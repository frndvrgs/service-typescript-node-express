import { z } from 'zod'

export namespace Cart {
  // entities
  // -----------------------------------------------------------------------------

  export const cartItem = z.object({
    id: z.string(),
    productId: z.string(),
    productName: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
  })
  export type cartItem = z.infer<typeof cartItem>

  export const cart = z.object({
    id: z.string(),
    userId: z.string().optional(),
    status: z.string(),
    items: z.array(cartItem),
    subtotal: z.number(),
    discount: z.number(),
    shipping: z.number(),
    total: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  export type cart = z.infer<typeof cart>

  export const coupon = z.object({
    id: z.string(),
    code: z.string(),
    discountType: z.string(),
    discountValue: z.number(),
    minAmount: z.number(),
    maxDiscount: z.number().optional(),
    active: z.boolean(),
  })
  export type coupon = z.infer<typeof coupon>

  export const operation = z.object({
    id: z.string(),
    cartId: z.string(),
    operationType: z.string(),
    details: z.record(z.string(), z.union([z.string(), z.number()])),
    createdAt: z.string(),
  })
  export type operation = z.infer<typeof operation>

  // request inputs
  // -----------------------------------------------------------------------------

  export const addItemBody = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
  })
  export type addItemBody = z.infer<typeof addItemBody>

  export const updateQuantityBody = z.object({
    quantity: z.number().min(0),
  })
  export type updateQuantityBody = z.infer<typeof updateQuantityBody>

  export const applyCouponBody = z.object({
    code: z.string(),
  })
  export type applyCouponBody = z.infer<typeof applyCouponBody>

  export const cartParams = z.object({ id: z.string() })
  export type cartParams = z.infer<typeof cartParams>

  export const cartItemParams = z.object({
    cartId: z.string(),
    productId: z.string(),
  })
  export type cartItemParams = z.infer<typeof cartItemParams>
}
