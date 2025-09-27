import { AppException } from '../../shared/exceptions'
import { list, read } from './repository'

export function listProducts() {
  return list()
}

export async function readProduct(id: string) {
  const product = await read(id)
  if (!product) {
    throw new AppException('product not found', 'NOT_FOUND', 404, {
      operation: 'read',
      resource: 'product',
    })
  }

  return product
}
