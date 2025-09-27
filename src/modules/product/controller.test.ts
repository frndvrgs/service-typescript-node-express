import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleError } from '../../shared/exceptions'
import { productRouter } from './controller'
import * as productServices from './services'

vi.mock('./services')
const mockServices = vi.mocked(productServices)

const mockApp = express()
mockApp.use(express.json())
mockApp.use('/products', productRouter)
mockApp.use(handleError)

describe('Product Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /', () => {
    it('should return list of products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 19.99, category: 'Electronics' },
        { id: '2', name: 'Product 2', price: 29.99, category: 'Books' },
      ]
      mockServices.listProducts.mockResolvedValue(mockProducts)

      const res = await request(mockApp).get('/products')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockProducts)
      expect(mockServices.listProducts).toHaveBeenCalledWith()
    })

    it('should return empty array when no products exist', async () => {
      mockServices.listProducts.mockResolvedValue([])

      const res = await request(mockApp).get('/products')

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })

  describe('GET /:id', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: '123',
        name: 'Test Product',
        price: 19.99,
        category: 'Electronics',
      }
      mockServices.readProduct.mockResolvedValue(mockProduct)

      const res = await request(mockApp).get('/products/123')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockProduct)
      expect(mockServices.readProduct).toHaveBeenCalledWith('123')
    })

    it('should return 404 when product not found', async () => {
      mockServices.readProduct.mockRejectedValue(new Error('product not found'))

      const res = await request(mockApp).get('/products/999')

      expect(res.status).toBe(500)
    })
  })
})
