import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { InterfaceException } from './exceptions'

type ValidationTarget = 'body' | 'params' | 'query'

interface ValidationSchema {
  body?: ZodType
  params?: ZodType
  query?: ZodType
}

type ValidatedData = {
  [K in ValidationTarget]?: unknown
}

export const validate = (schemas: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = []
    const validatedData: ValidatedData = {}

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodType][]) {
      if (!schema) continue

      const data = req[target]
      const result = schema.safeParse(data)

      if (!result.success) {
        const targetErrors = result.error.issues.map((issue) => {
          const path = issue.path.length > 0 ? `.${issue.path.join('.')}` : ''
          return `${target}${path}: ${issue.message}`
        })
        errors.push(...targetErrors)
      } else {
        validatedData[target] = result.data
      }
    }

    if (errors.length > 0) {
      const exception = new InterfaceException(
        errors.join(', '),
        'VALIDATION_ERROR',
        400,
        {
          operation: 'validate',
          resource: 'request',
          field: Object.keys(schemas).join(','),
          detail: JSON.stringify({
            body: req.body,
            params: req.params,
            query: req.query,
          }),
        },
        {
          name: 'ValidationError',
          message: errors.join(', '),
        }
      )
      exception.getResponse(res)
      return
    }

    if (validatedData.body !== undefined) {
      req.body = validatedData.body
    }
    if (validatedData.params !== undefined) {
      Object.assign(req.params, validatedData.params)
    }
    if (validatedData.query !== undefined) {
      Object.assign(req.query, validatedData.query)
    }

    next()
  }
}
