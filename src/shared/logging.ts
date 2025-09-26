import type { NextFunction, Request, Response } from 'express'
import pino from 'pino'
import { settings } from '../settings'

export const logger = pino({
  level: settings.logging.level,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
})

export const logServerInfo = () => {
  console.info(`${settings.server.name} - ${settings.environment.nodeEnv}\n`)
  console.info(
    `server is running on port ${settings.server.port}: http://localhost:${settings.server.port}`
  )
  console.info(
    `openapi spec: http://localhost:${settings.server.port}${settings.openapi.spec.path}`
  )
  console.info(
    `api documentation: http://localhost:${settings.server.port}${settings.openapi.doc.path}\n`
  )
}

export const logHttpDebug = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now()

  const { method, url, body } = req

  const requestLog: Record<string, unknown> = { method, url }

  if (body !== undefined && body !== null && Object.keys(body).length > 0) {
    requestLog['body'] = body
  }

  if (req.params && Object.keys(req.params).length > 0) {
    requestLog['params'] = req.params
  }

  if (req.query && Object.keys(req.query).length > 0) {
    requestLog['query'] = req.query
  }

  logger.debug(requestLog, 'request')

  const originalSend = res.send
  let responseLogged = false

  res.send = function (body: unknown) {
    if (body && !responseLogged) {
      responseLogged = true
      const duration = performance.now() - startTime

      let parsedBody = body
      if (typeof body === 'string') {
        try {
          parsedBody = JSON.parse(body)
        } catch {
          parsedBody = body
        }
      }
      logger.debug(
        {
          body: parsedBody,
          duration: `${duration.toFixed(2)}ms`,
        },
        'response'
      )
    }
    return originalSend.call(this, body)
  }

  next()
}
