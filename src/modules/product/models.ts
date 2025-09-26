import { z } from 'zod'

export namespace Product {
  // entities
  // -----------------------------------------------------------------------------

  export const product = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.string().optional(),
  })
  export type product = z.infer<typeof product>

  // request
  // -----------------------------------------------------------------------------

  export const readParams = z.object({ id: z.string() })
  export type readParams = z.infer<typeof readParams>
}
