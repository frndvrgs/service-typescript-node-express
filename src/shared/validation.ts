import type { NextFunction, Request, Response } from 'express'
import { type ZodType, z } from 'zod'
import { InterfaceException } from './exceptions'

type ValidationTarget = 'body' | 'params' | 'query'

export const validate = <T extends ZodType>(target: ValidationTarget, schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: unknown

      switch (target) {
        case 'body':
          data = req.body
          break
        case 'params':
          data = req.params
          break
        case 'query':
          data = req.query
          break
      }

      const result = schema.parse(data)

      switch (target) {
        case 'body':
          req.body = result
          break
        case 'params':
          Object.assign(req.params, result)
          break
        case 'query':
          Object.assign(req.query, result)
          break
      }

      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ')
        const exception = new InterfaceException(
          `validation error: ${message}`,
          400,
          'VALIDATION_ERROR',
          {
            operation: `validate_${target}`,
            detail: `${target} validation failed`,
          }
        )
        exception.sendResponse(res)
        return
      }
      next(error)
    }
  }
}
