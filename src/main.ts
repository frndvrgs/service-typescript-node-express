import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import routes from './routes'
import { settings } from './settings'
import { startDatabase, stopDatabase } from './shared/database'
import { AppException, InterfaceException, ServerException } from './shared/exceptions'
import { logger, logHttpDebug, logServerInfo } from './shared/logging'
import { setupOpenAPI } from './shared/openapi'

await startDatabase()

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (settings.logging.level === 'debug') {
  app.use(logHttpDebug)
}

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

app.listen(settings.server.port, () => logServerInfo())

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await stopDatabase()
    process.exit(0)
  })
}
