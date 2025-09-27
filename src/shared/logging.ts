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

const logRequest = (req: Request) => {
  if (settings.logging.level !== 'debug') return

  const { method, url, body, params, query } = req

  logger.debug({ method, url, body, params, query }, 'request')
}

const logResponse = (body: unknown) => {
  if (settings.logging.level !== 'debug') return
  if (!body) return

  let parsedBody = body
  if (typeof body === 'string') {
    try {
      parsedBody = JSON.parse(body)
    } catch {
      parsedBody = body
    }
  }

  logger.debug({ body: parsedBody }, 'response')
}

export const logHttpDebug = (_error: Error, req: Request, res: Response, next: NextFunction) => {
  logRequest(req)

  const originalSend = res.send
  let responseLogged = false

  res.send = function (body: unknown) {
    if (!responseLogged) {
      responseLogged = true
      logResponse(body)
    }
    return originalSend.call(this, body)
  }

  next()
}
