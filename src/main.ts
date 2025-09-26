import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import pinoHttp from 'pino-http'
import routes from './routes'
import { settings } from './settings'
import { startDatabase, stopDatabase } from './shared/database'
import { AppException, InterfaceException, ServerException } from './shared/exceptions'
import { logger } from './shared/logger'
import { setupOpenAPI } from './shared/openapi'

await startDatabase()

const app = express()

if (settings.logging.enabled) {
  app.use(pinoHttp({ logger }))
}

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

setupOpenAPI(app)

app.use(routes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      type: 'not_found',
      message: 'route not found',
      timestamp: new Date().toISOString(),
    },
  })
})

app.use(
  (error: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      return next(error)
    }

    if (
      error instanceof AppException ||
      error instanceof InterfaceException ||
      error instanceof ServerException
    ) {
      error.sendResponse(res)
      return
    }

    logger.error({ error }, 'unhandled error')

    const serverError = new ServerException('internal server error', 500, 'INTERNAL_ERROR')
    serverError.sendResponse(res)
  }
)

const port = settings.server.port
app.listen(port, () => {
  console.log('[http]', `server is running on port ${port} - ${settings.environment.nodeEnv}`)
  console.log('[http]', `api documentation: http://localhost:${port}${settings.openapi.doc.path}`)
  console.log('[http]', `openapi spec: http://localhost:${port}${settings.openapi.spec.path}`)
})

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await stopDatabase()
    process.exit(0)
  })
}
