import { z } from 'zod'

export namespace Product {
  // entities
  // -----------------------------------------------------------------------------

  export const product = z
    .object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      category: z.string().optional(),
    })
    .openapi('Product')
  export type product = z.infer<typeof product>

  // request
  // -----------------------------------------------------------------------------

  export const readParams = z
    .object({
      id: z.string().regex(/^\d+$/, 'must be a valid number'),
    })
    .openapi('ProductReadParams')
  export type readParams = z.infer<typeof readParams>

  // response
  // -----------------------------------------------------------------------------

  export const listProductsResponse = z.array(product).openapi('ProductList')
  export type listProductsResponse = z.infer<typeof listProductsResponse>

  export const readProductResponse = product
  export type readProductResponse = z.infer<typeof readProductResponse>
}
