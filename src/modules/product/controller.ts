import { Router } from 'express'
import { validate } from '../../shared/validation'
import { Product } from './models'
import { listProducts, readProduct } from './services'

export const productRouter = Router()

productRouter.get('/', async (_req, res, next) => {
  try {
    const items = await listProducts()
    res.json(items)
  } catch (error) {
    next(error)
  }
})

productRouter.get('/:id', validate('params', Product.readParams), async (req, res, next) => {
  try {
    const params = req.params as Product.readParams
    const item = await readProduct(params.id)
    res.json(item)
  } catch (error) {
    next(error)
  }
})
