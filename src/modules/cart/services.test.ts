import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as cartRepository from './repository'
import * as cartServices from './services'

vi.mock('./repository')
const mockRepository = vi.mocked(cartRepository)

describe('Cart Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createCart', () => {
    it('should create a cart successfully', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 'user-123',
        status: 'active',
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }
      mockRepository.createCart.mockResolvedValue(mockCart)

      const result = await cartServices.createCart('user-123')

      expect(mockRepository.createCart).toHaveBeenCalledWith('user-123')
      expect(result).toEqual(mockCart)
    })
  })

  describe('getCart', () => {
    it('should return cart when found', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 'user-123',
        status: 'active',
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }
      mockRepository.findCartById.mockResolvedValue(mockCart)

      const result = await cartServices.getCart('cart-123')

      expect(result).toEqual(mockCart)
    })

    it('should throw error when cart id is empty', async () => {
      await expect(cartServices.getCart('')).rejects.toThrow('cart id is required')
    })
  })

  describe('addProduct', () => {
    it('should add product to cart successfully', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 'user-123',
        status: 'active',
        items: [
          {
            id: 'item-1',
            productId: 'product-123',
            productName: 'Test Product',
            quantity: 2,
            unitPrice: 10.99,
            totalPrice: 21.98,
          },
        ],
        subtotal: 21.98,
        discount: 0,
        shipping: 0,
        total: 21.98,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockRepository.addItemToCart.mockResolvedValue(undefined)
      mockRepository.findCartById.mockResolvedValue(mockCart)

      const result = await cartServices.addProduct('cart-123', 'product-123', 2)

      expect(result).toEqual(mockCart)
    })

    it('should throw error when quantity is invalid', async () => {
      await expect(cartServices.addProduct('cart-123', 'product-123', 0)).rejects.toThrow(
        'quantity must be greater than 0'
      )
    })
  })

  describe('applyCoupon', () => {
    it('should apply coupon successfully', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 'user-123',
        status: 'active',
        items: [],
        subtotal: 60.0,
        discount: 0,
        shipping: 0,
        total: 60.0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }
      const mockCoupon = {
        id: 'coupon-123',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        minAmount: 50,
        maxDiscount: 0,
        active: true,
      }
      const updatedCart = { ...mockCart, discount: 6.0, total: 54.0 }

      mockRepository.findCartById.mockResolvedValueOnce(mockCart).mockResolvedValueOnce(updatedCart)
      mockRepository.findCouponByCode.mockResolvedValue(mockCoupon)
      mockRepository.updateCartDiscount.mockResolvedValue(undefined)

      const result = await cartServices.applyCoupon('cart-123', 'SAVE10')

      expect(result).toEqual(updatedCart)
    })

    it('should throw error when coupon not found', async () => {
      const mockCart = {
        id: 'cart-123',
        userId: 'user-123',
        status: 'active',
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }
      mockRepository.findCartById.mockResolvedValue(mockCart)
      mockRepository.findCouponByCode.mockResolvedValue(null)

      await expect(cartServices.applyCoupon('cart-123', 'INVALID')).rejects.toThrow(
        'invalid or expired coupon'
      )
    })
  })
})
