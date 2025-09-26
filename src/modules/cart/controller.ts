import { Router } from 'express'
import { validateBody, validateParams } from '../../shared/validation'
import { Cart } from './models'
import * as cartService from './services'

export const cartRouter = Router()

cartRouter.post('/', async (_req, res, next) => {
  try {
    const cartId = await cartService.createCart()
    const cart = await cartService.getCart(cartId)
    res.json(cart)
  } catch (error) {
    next(error)
  }
})

cartRouter.get('/:id', validateParams(Cart.cartParams), async (req, res, next) => {
  try {
    const params = req.params as Cart.cartParams
    const cart = await cartService.getCart(params.id)
    res.json(cart)
  } catch (error) {
    next(error)
  }
})

cartRouter.post(
  '/:id/items',
  validateParams(Cart.cartParams),
  validateBody(Cart.addItemBody),
  async (req, res, next) => {
    try {
      const params = req.params as Cart.cartParams
      const { productId, quantity } = req.body
      const cart = await cartService.addProduct(params.id, productId, quantity)
      res.json(cart)
    } catch (error) {
      next(error)
    }
  }
)

cartRouter.delete(
  '/:cartId/items/:productId',
  validateParams(Cart.cartItemParams),
  async (req, res, next) => {
    try {
      const params = req.params as Cart.cartItemParams
      const cart = await cartService.removeProduct(params.cartId, params.productId)
      res.json(cart)
    } catch (error) {
      next(error)
    }
  }
)

cartRouter.patch(
  '/:cartId/items/:productId',
  validateParams(Cart.cartItemParams),
  validateBody(Cart.updateQuantityBody),
  async (req, res, next) => {
    try {
      const params = req.params as Cart.cartItemParams
      const { quantity } = req.body
      const cart = await cartService.updateQuantity(params.cartId, params.productId, quantity)
      res.json(cart)
    } catch (error) {
      next(error)
    }
  }
)

cartRouter.post(
  '/:id/coupons',
  validateParams(Cart.cartParams),
  validateBody(Cart.applyCouponBody),
  async (req, res, next) => {
    try {
      const params = req.params as Cart.cartParams
      const { code } = req.body
      const cart = await cartService.applyCoupon(params.id, code)
      res.json(cart)
    } catch (error) {
      next(error)
    }
  }
)

cartRouter.get('/:id/operations', validateParams(Cart.cartParams), async (req, res, next) => {
  try {
    const params = req.params as Cart.cartParams
    const operations = await cartService.getOperations(params.id)
    res.json(operations)
  } catch (error) {
    next(error)
  }
})
