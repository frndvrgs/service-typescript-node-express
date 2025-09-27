import type { NextFunction, Request, Response } from 'express'
import { settings } from '../settings'
import { logger } from './logging'

interface Exception {
  timestamp: string
  type: string
  message: string
  code: string
  context?: ExceptionContext
  error?: { message: string; stack?: string }
}
interface ExceptionContext {
  operation?: string
  resource?: string
  field?: string
  detail?: string
}

abstract class BaseException extends Error {
  public readonly status: number
  public readonly code: string
  public readonly context?: ExceptionContext
  public readonly timestamp: string
  protected readonly type: string
  protected readonly prefix: string
  protected readonly exception: Exception

  constructor(
    message: string,
    status: number,
    code: string,
    context?: ExceptionContext,
    error?: Error,
    type: string = 'base_error',
    prefix: string = '[exception]'
  ) {
    const timestamp = new Date().toISOString()
    const errorMessage =
      type === 'server_error' && !settings.environment.isDevelopment
        ? 'internal server error'
        : message

    super(errorMessage)
    this.name = this.constructor.name
    this.status = status
    this.code = code
    this.context = context
    this.timestamp = timestamp
    this.type = type
    this.prefix = prefix

    Error.captureStackTrace(this, this.constructor)

    this.exception = {
      timestamp,
      type,
      message: errorMessage,
      code,
      ...(context && { context }),
      ...(error && { error: { message: error.message, stack: error.stack } }),
    }

    logger.error({ error: this.exception }, prefix)
  }

  getResponse(res: Response): void {
    res.status(this.status).json({
      success: false,
      error: settings.environment.isDevelopment
        ? this.exception
        : {
            timestamp: this.timestamp,
            type: this.type,
            message: this.message,
            code: this.code,
          },
    })
  }
}

export class InterfaceException extends BaseException {
  constructor(
    message: string,
    code: string,
    status = 400,
    context?: ExceptionContext,
    error?: Error
  ) {
    super(message, status, code, context, error, 'interface_error', '[exception] interface')
  }
}

export class AppException extends BaseException {
  constructor(
    message: string,
    code: string,
    status = 422,
    context?: ExceptionContext,
    error?: Error
  ) {
    super(message, status, code, context, error, 'application_error', '[exception] application')
  }
}

export class ServerException extends BaseException {
  constructor(
    message: string,
    code: string,
    status = 500,
    context?: ExceptionContext,
    error?: Error
  ) {
    super(message, status, code, context, error, 'server_error', '[exception] server')
  }
}

export const handleError = (error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error)
  }

  if (
    error instanceof AppException ||
    error instanceof InterfaceException ||
    error instanceof ServerException
  ) {
    error.getResponse(res)
    return
  }

  logger.error({ error }, 'unhandled error')

  const serverError = new ServerException(
    'internal server error',
    'INTERNAL_ERROR',
    500,
    undefined,
    error
  )
  serverError.getResponse(res)
}
