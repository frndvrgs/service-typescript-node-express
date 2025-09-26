import { AppException } from '../../shared/exceptions'
import * as cartRepository from './repository'

export async function createCart(userId?: string) {
  return await cartRepository.createCart(userId)
}

export async function getCart(id: string) {
  if (!id || id.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'read',
      resource: 'cart',
      field: 'id',
    })
  }

  const cart = await cartRepository.findCartById(id)
  if (!cart) {
    throw new AppException('cart not found', 404, 'NOT_FOUND', {
      operation: 'read',
      resource: 'cart',
    })
  }
  return cart
}

export async function addProduct(cartId: string, productId: string, quantity: number) {
  if (!cartId || cartId.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'addProduct',
      resource: 'cart',
      field: 'id',
    })
  }
  if (!productId || productId.trim() === '') {
    throw new AppException('product id is required', 400, 'REQUIRED', {
      operation: 'addProduct',
      resource: 'cart',
      field: 'id',
    })
  }
  if (!quantity || quantity <= 0) {
    throw new AppException('quantity must be greater than 0', 400, 'REQUIRED', {
      operation: 'addProduct',
      resource: 'cart',
      field: 'quantity',
    })
  }

  await cartRepository.addItemToCart(cartId, productId, quantity)
  return await cartRepository.findCartById(cartId)
}

export async function removeProduct(cartId: string, productId: string) {
  if (!cartId || cartId.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'removeProduct',
      resource: 'cart',
      field: 'id',
    })
  }
  if (!productId || productId.trim() === '') {
    throw new AppException('product id is required', 400, 'REQUIRED', {
      operation: 'removeProduct',
      resource: 'cart',
      field: 'id',
    })
  }

  await cartRepository.removeItemFromCart(cartId, productId)
  return await cartRepository.findCartById(cartId)
}

export async function updateQuantity(cartId: string, productId: string, quantity: number) {
  if (!cartId || cartId.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'updateQuantity',
      resource: 'cart',
      field: 'id',
    })
  }
  if (!productId || productId.trim() === '') {
    throw new AppException('product id is required', 400, 'REQUIRED', {
      operation: 'updateQuantity',
      resource: 'cart',
      field: 'id',
    })
  }
  if (quantity < 0) {
    throw new AppException('quantity cannot be negative', 400, 'REQUIRED', {
      operation: 'updateQuantity',
      resource: 'cart',
      field: 'quantity',
    })
  }

  await cartRepository.updateItemQuantity(cartId, productId, quantity)
  return await cartRepository.findCartById(cartId)
}

export async function applyCoupon(cartId: string, couponCode: string) {
  if (!cartId || cartId.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'applyCoupon',
      resource: 'cart',
      field: 'id',
    })
  }
  if (!couponCode || couponCode.trim() === '') {
    throw new AppException('coupon code is required', 400, 'REQUIRED', {
      operation: 'applyCoupon',
      resource: 'cart',
      field: 'id',
    })
  }

  const cart = await cartRepository.findCartById(cartId)
  if (!cart)
    throw new AppException('cart not found', 404, 'NOT_FOUND', {
      operation: 'applyCoupon',
      resource: 'cart',
    })

  const coupon = await cartRepository.findCouponByCode(couponCode)
  if (!coupon)
    throw new AppException('invalid or expired coupon', 404, 'NOT_FOUND', {
      operation: 'applyCoupon',
      resource: 'cart',
    })

  const subtotalCents = Math.floor(cart.subtotal * 100)

  if (subtotalCents < coupon.minAmount * 100) {
    throw new AppException(`minimum order amount is $${coupon.minAmount}`, 400, 'REQUIRED', {
      operation: 'applyCoupon',
      resource: 'cart',
      field: 'minAmount',
    })
  }

  let discountCents = 0

  if (coupon.discountType === 'percentage') {
    discountCents = Math.floor(subtotalCents * (coupon.discountValue / 100))
    if (coupon.maxDiscount) {
      discountCents = Math.min(discountCents, coupon.maxDiscount * 100)
    }
  } else {
    discountCents = coupon.discountValue * 100
  }

  let shippingCents = 0
  if (subtotalCents < 50000) {
    shippingCents = 1500
  }

  const totalCents = subtotalCents - discountCents + shippingCents

  await cartRepository.updateCartDiscount(cartId, discountCents, totalCents)

  return await cartRepository.findCartById(cartId)
}

export async function getOperations(cartId: string) {
  if (!cartId || cartId.trim() === '') {
    throw new AppException('cart id is required', 400, 'REQUIRED', {
      operation: 'getOperations',
      resource: 'cart',
      field: 'id',
    })
  }

  return await cartRepository.getCartOperations(cartId)
}
