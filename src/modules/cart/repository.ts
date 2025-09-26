import { getPool } from '../../shared/database'
import { AppException } from '../../shared/exceptions'

export async function createCart(userId?: string) {
  const pool = getPool()
  const sql = 'INSERT INTO carts (user_id) VALUES ($1) RETURNING id'
  const { rows } = await pool.query(sql, [userId || null])
  return rows[0].id
}

export async function findCartById(id: string) {
  const pool = getPool()
  const cartSql = `
    SELECT id, user_id, status, subtotal_cents, discount_cents, 
           shipping_cents, total_cents, created_at, updated_at 
    FROM carts WHERE id = $1
  `
  const { rows: cartRows } = await pool.query(cartSql, [id])

  if (cartRows.length === 0) return null

  const cart = cartRows[0]

  const itemsSql = `
    SELECT ci.id, ci.product_id, ci.quantity, ci.unit_price_cents, 
           ci.total_price_cents, p.name as product_name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at
  `
  const { rows: itemRows } = await pool.query(itemsSql, [id])

  return {
    id: String(cart.id),
    userId: cart.user_id,
    status: cart.status,
    subtotal: cart.subtotal_cents / 100,
    discount: cart.discount_cents / 100,
    shipping: cart.shipping_cents / 100,
    total: cart.total_cents / 100,
    items: itemRows.map((item) => ({
      id: String(item.id),
      productId: String(item.product_id),
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price_cents / 100,
      totalPrice: item.total_price_cents / 100,
    })),
    createdAt: cart.created_at.toISOString(),
    updatedAt: cart.updated_at.toISOString(),
  }
}

export async function addItemToCart(cartId: string, productId: string, quantity: number) {
  const pool = getPool()

  const productSql = 'SELECT id, price_cents FROM products WHERE id = $1'
  const { rows: productRows } = await pool.query(productSql, [productId])

  if (productRows.length === 0) {
    throw new AppException('product not found', 404, 'NOT_FOUND', {
      operation: 'addItemToCart',
      resource: 'product',
    })
  }

  const product = productRows[0]
  const unitPriceCents = product.price_cents
  const totalPriceCents = unitPriceCents * quantity

  const sql = `
    INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_cents, total_price_cents)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET 
      quantity = cart_items.quantity + $3,
      total_price_cents = cart_items.unit_price_cents * (cart_items.quantity + $3),
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `

  await pool.query(sql, [cartId, productId, quantity, unitPriceCents, totalPriceCents])
  await updateCartTotals(cartId)
  await logOperation(cartId, 'add_item', { productId, quantity })
}

export async function removeItemFromCart(cartId: string, productId: string) {
  const pool = getPool()
  const sql = 'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2'
  await pool.query(sql, [cartId, productId])
  await updateCartTotals(cartId)
  await logOperation(cartId, 'remove_item', { productId })
}

export async function updateItemQuantity(cartId: string, productId: string, quantity: number) {
  const pool = getPool()

  if (quantity === 0) {
    return removeItemFromCart(cartId, productId)
  }

  const sql = `
    UPDATE cart_items 
    SET quantity = $3, 
        total_price_cents = unit_price_cents * $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE cart_id = $1 AND product_id = $2
  `
  await pool.query(sql, [cartId, productId, quantity])
  await updateCartTotals(cartId)
  await logOperation(cartId, 'update_quantity', { productId, quantity })
}

export async function findCouponByCode(code: string) {
  const pool = getPool()
  const sql = `
    SELECT id, code, discount_type, discount_value, min_amount_cents, 
           max_discount_cents, active, expires_at
    FROM coupons 
    WHERE code = $1 AND active = true 
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `
  const { rows } = await pool.query(sql, [code])

  if (rows.length === 0) return null

  const coupon = rows[0]
  return {
    id: String(coupon.id),
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    minAmount: coupon.min_amount_cents / 100,
    maxDiscount: coupon.max_discount_cents ? coupon.max_discount_cents / 100 : undefined,
    active: coupon.active,
  }
}

export async function getCartOperations(cartId: string) {
  const pool = getPool()
  const sql = `
    SELECT id, cart_id, operation_type, details, created_at
    FROM cart_operations 
    WHERE cart_id = $1 
    ORDER BY created_at DESC
  `
  const { rows } = await pool.query(sql, [cartId])

  return rows.map((op) => ({
    id: String(op.id),
    cartId: String(op.cart_id),
    operationType: op.operation_type,
    details: op.details,
    createdAt: op.created_at.toISOString(),
  }))
}

async function updateCartTotals(cartId: string) {
  const pool = getPool()

  const itemsTotalSql = `
    SELECT COALESCE(SUM(total_price_cents), 0) as subtotal_cents
    FROM cart_items WHERE cart_id = $1
  `
  const { rows: totalRows } = await pool.query(itemsTotalSql, [cartId])
  const subtotalCents = totalRows[0].subtotal_cents

  let discountCents = 0
  let shippingCents = 0

  if (subtotalCents >= 100000) {
    discountCents = Math.floor(subtotalCents * 0.1)
  }

  if (subtotalCents < 50000) {
    shippingCents = 1500
  }

  const totalCents = subtotalCents - discountCents + shippingCents

  const updateSql = `
    UPDATE carts 
    SET subtotal_cents = $2, discount_cents = $3, shipping_cents = $4, 
        total_cents = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `
  await pool.query(updateSql, [cartId, subtotalCents, discountCents, shippingCents, totalCents])
}

export async function updateCartDiscount(
  cartId: string,
  discountCents: number,
  totalCents: number
) {
  const pool = getPool()
  const sql = `
    UPDATE carts 
    SET discount_cents = $2, total_cents = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `
  await pool.query(sql, [cartId, discountCents, totalCents])
}

async function logOperation(
  cartId: string,
  operationType: string,
  details: Record<string, string | number>
) {
  const pool = getPool()
  const sql = `
    INSERT INTO cart_operations (cart_id, operation_type, details)
    VALUES ($1, $2, $3)
  `
  await pool.query(sql, [cartId, operationType, JSON.stringify(details)])
}
