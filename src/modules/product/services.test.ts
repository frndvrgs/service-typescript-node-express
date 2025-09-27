import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as productRepository from './repository'
import * as productServices from './services'

vi.mock('./repository')
const mockRepository = vi.mocked(productRepository)

describe('Product Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listProducts', () => {
    it('should return list of products successfully', async () => {
      const mockProducts = [
        { id: 'product-1', name: 'Product 1', price: 19.99, category: 'Electronics' },
        { id: 'product-2', name: 'Product 2', price: 29.99, category: 'Books' },
      ]
      mockRepository.list.mockResolvedValue(mockProducts)

      const result = await productServices.listProducts()

      expect(result).toEqual(mockProducts)
    })
  })

  describe('readProduct', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: 'product-123',
        name: 'Test Product',
        price: 19.99,
        category: 'Electronics',
      }
      mockRepository.read.mockResolvedValue(mockProduct)

      const result = await productServices.readProduct('product-123')

      expect(result).toEqual(mockProduct)
    })
  })
})
