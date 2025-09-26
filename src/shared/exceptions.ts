import type { NextFunction, Request, Response } from 'express'
import { settings } from '../settings'
import { logger } from './logging'

interface ErrorContext {
  operation?: string
  resource?: string
  field?: string
  detail?: string
}

abstract class BaseException extends Error {
  public readonly status: number
  public readonly code: string
  public readonly context?: ErrorContext
  public readonly timestamp: string

  constructor(message: string, status: number, code: string, context?: ErrorContext) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.code = code
    this.context = context
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
  }

  abstract getResponse(res: Response): void
}

export class InterfaceException extends BaseException {
  constructor(message: string, status = 400, code: string, context?: ErrorContext) {
    super(message, status, code, context)
  }

  getResponse(res: Response) {
    res.status(this.status).json({
      success: false,
      error: {
        type: 'interface_error',
        message: this.message,
        code: this.code,
        context: settings.environment.isDevelopment ? this.context : undefined,
        timestamp: this.timestamp,
      },
    })
  }
}

export class AppException extends BaseException {
  constructor(message: string, status = 422, code: string, context?: ErrorContext) {
    super(message, status, code, context)
  }

  getResponse(res: Response) {
    res.status(this.status).json({
      success: false,
      error: {
        type: 'application_error',
        message: this.message,
        code: this.code,
        context: settings.environment.isDevelopment ? this.context : undefined,
        timestamp: this.timestamp,
      },
    })
  }
}

export class ServerException extends BaseException {
  constructor(message: string, status = 500, code: string, context?: ErrorContext) {
    super(message, status, code, context)
  }

  getResponse(res: Response) {
    res.status(this.status).json({
      success: false,
      error: {
        type: 'server_error',
        message: settings.environment.isDevelopment ? this.message : 'internal server error',
        code: this.code,
        context: settings.environment.isDevelopment ? this.context : undefined,
        timestamp: this.timestamp,
      },
    })
  }
}

export const errorHandler = (error: Error, _req: Request, res: Response, next: NextFunction) => {
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

  const serverError = new ServerException('internal server error', 500, 'INTERNAL_ERROR')
  serverError.getResponse(res)
}
