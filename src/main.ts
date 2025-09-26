import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import routes from './routes'
import { settings } from './settings'
import { startDatabase, stopDatabase } from './shared/database'
import { errorHandler } from './shared/exceptions'
import { logHttpDebug, logServerInfo } from './shared/logging'
import { setupOpenAPI } from './shared/openapi'

await startDatabase()

const app = express()

app.use(helmet())
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (settings.logging.level === 'debug') {
  app.use(logHttpDebug)
}

setupOpenAPI(app)

app.use(routes)
app.use(errorHandler)
app.listen(settings.server.port, () => logServerInfo())

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await stopDatabase()
    process.exit(0)
  })
}
