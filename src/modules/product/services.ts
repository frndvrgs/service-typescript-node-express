import { AppException } from '../../shared/exceptions'
import { list, read } from './repository'

export function listProducts() {
  return list()
}

export async function readProduct(id: string) {
  if (!id || id.trim() === '') {
    throw new AppException('product id is required', 400, 'REQUIRED', {
      operation: 'readProduct',
      resource: 'product',
      field: 'id',
    })
  }

  const product = await read(id)
  if (!product) {
    throw new AppException('product not found', 404, 'NOT_FOUND', {
      operation: 'read',
      resource: 'product',
    })
  }

  return product
}
