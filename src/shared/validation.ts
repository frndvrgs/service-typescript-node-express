import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { InterfaceException } from './exceptions'

export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body)
      req.body = result
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
            operation: 'validate_body',
            detail: 'body validation failed',
          }
        )
        exception.sendResponse(res)
        return
      }
      next(error)
    }
  }
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.params)
      Object.assign(req.params, result)
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
            operation: 'validate_params',
            detail: 'params validation failed',
          }
        )
        exception.sendResponse(res)
        return
      }
      next(error)
    }
  }
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.query)
      Object.assign(req.query, result)
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
            operation: 'validate_query',
            detail: 'query validation failed',
          }
        )
        exception.sendResponse(res)
        return
      }
      next(error)
    }
  }
}
