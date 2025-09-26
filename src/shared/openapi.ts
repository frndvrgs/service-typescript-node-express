import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { apiReference } from '@scalar/express-api-reference'
import type { Express } from 'express'
import { Cart } from '../modules/cart/models'
import { Product } from '../modules/product/models'
import { settings } from '../settings'

export function setupOpenAPI(app: Express) {
  const registry = new OpenAPIRegistry()

  registry.registerPath({
    method: 'get',
    path: '/api/products',
    summary: 'List all products',
    description: 'Retrieve a list of all available products in the system',
    tags: ['Products'],
    responses: {
      200: {
        description: 'List of products',
        content: {
          'application/json': {
            schema: Product.listProductsResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/products/{id}',
    summary: 'Get product by ID',
    description: 'Retrieve detailed information about a specific product',
    tags: ['Products'],
    request: {
      params: Product.readParams,
    },
    responses: {
      200: {
        description: 'Product details',
        content: {
          'application/json': {
            schema: Product.readProductResponse,
          },
        },
      },
      404: {
        description: 'Product not found',
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/carts',
    summary: 'Create new cart',
    description: 'Create a new shopping cart for a user session',
    tags: ['Carts'],
    responses: {
      200: {
        description: 'Cart created successfully',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/carts/{id}',
    summary: 'Get cart by ID',
    description: 'Retrieve cart details including items and totals',
    tags: ['Carts'],
    request: {
      params: Cart.cartParams,
    },
    responses: {
      200: {
        description: 'Cart details',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
      404: {
        description: 'Cart not found',
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/carts/{id}/items',
    summary: 'Add item to cart',
    description: 'Add a product to the shopping cart with specified quantity',
    tags: ['Carts'],
    request: {
      params: Cart.cartParams,
      body: {
        content: {
          'application/json': {
            schema: Cart.addItemBody,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Item added to cart successfully',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
      400: {
        description: 'Invalid request data',
      },
      404: {
        description: 'Cart or product not found',
      },
    },
  })

  registry.registerPath({
    method: 'delete',
    path: '/api/carts/{cartId}/items/{productId}',
    summary: 'Remove item from cart',
    description: 'Remove a specific product from the shopping cart',
    tags: ['Carts'],
    request: {
      params: Cart.cartItemParams,
    },
    responses: {
      200: {
        description: 'Item removed from cart successfully',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
      404: {
        description: 'Cart or item not found',
      },
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/carts/{cartId}/items/{productId}',
    summary: 'Update item quantity in cart',
    description: 'Update the quantity of a specific item in the cart',
    tags: ['Carts'],
    request: {
      params: Cart.cartItemParams,
      body: {
        content: {
          'application/json': {
            schema: Cart.updateQuantityBody,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Item quantity updated successfully',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
      400: {
        description: 'Invalid quantity value',
      },
      404: {
        description: 'Cart or item not found',
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/carts/{id}/coupons',
    summary: 'Apply coupon to cart',
    description: 'Apply a discount coupon to the shopping cart',
    tags: ['Carts'],
    request: {
      params: Cart.cartParams,
      body: {
        content: {
          'application/json': {
            schema: Cart.applyCouponBody,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Coupon applied successfully',
        content: {
          'application/json': {
            schema: Cart.cartResponse,
          },
        },
      },
      400: {
        description: 'Invalid or expired coupon',
      },
      404: {
        description: 'Cart not found',
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/carts/{id}/operations',
    summary: 'Get cart operations history',
    description: 'Retrieve the history of operations performed on the cart',
    tags: ['Carts'],
    request: {
      params: Cart.cartParams,
    },
    responses: {
      200: {
        description: 'Cart operations history',
        content: {
          'application/json': {
            schema: Cart.operationsResponse,
          },
        },
      },
      404: {
        description: 'Cart not found',
      },
    },
  })

  const generator = new OpenApiGeneratorV3(registry.definitions)
  const document = generator.generateDocument({
    openapi: '3.2.0',
    info: {
      version: settings.openapi.spec.version,
      title: settings.openapi.spec.title,
      description: settings.openapi.spec.description,
    },
    servers: [
      {
        url: `http://localhost:${settings.server.port}`,
        description: settings.environment.nodeEnv,
      },
    ],
  })

  app.get(settings.openapi.spec.path, (_req, res) => {
    res.json(document)
  })

  app.use(
    settings.openapi.doc.path,
    apiReference({
      theme: 'saturn',
      layout: 'modern',
      url: settings.openapi.spec.path,
    })
  )
}
