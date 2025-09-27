import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import routes from './routes'
import { settings } from './settings'
import { startDatabase, stopDatabase } from './shared/database'
import { handleError } from './shared/exceptions'
import { logHttpDebug, logServerInfo } from './shared/logging'
import { setupOpenAPI } from './shared/openapi'

await startDatabase()

const app = express()
  .use(helmet())
  .use(cors())
  .use(cookieParser())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(logHttpDebug)
  .use(routes)
  .use(handleError)

setupOpenAPI(app)

app.listen(settings.server.port, () => logServerInfo())

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await stopDatabase()
    process.exit(0)
  })
}

export default app
