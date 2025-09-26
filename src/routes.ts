import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { z } from 'zod'

extendZodWithOpenApi(z)

import { settings } from './settings'

const routes = Router()

routes.get('/', (_req, res) => {
  res.json({
    name: settings.server.name,
  })
})

routes.use('/products', (await import('./modules/product/controller')).productRouter)
routes.use('/carts', (await import('./modules/cart/controller')).cartRouter)

export default routes
