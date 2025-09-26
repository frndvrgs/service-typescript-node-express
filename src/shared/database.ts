import { Pool, type PoolConfig } from 'pg'
import { settings } from '../settings'
import { ServerException } from './exceptions'
import { logger } from './logging'

let pool: Pool | null = null

function getConfig() {
  const { host, name, user, password } = settings.database

  if (!host || !name || !user || !password) {
    throw new ServerException('missing required database settings', 500, 'MISSING_SETTINGS', {
      operation: 'get_config',
      resource: 'database',
    })
  }

  return settings.database
}

function createPool(config: typeof settings.database): Pool {
  const poolConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    database: config.name,
    user: config.user,
    password: config.password,
    max: config.maxConnections,
    idleTimeoutMillis: config.idleTimeoutMillis,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
  }

  const newPool = new Pool(poolConfig)

  newPool.on('error', (err) => {
    logger.error({ error: err }, '[database] pool error')
  })

  return newPool
}

export async function startDatabase(): Promise<Pool> {
  const config = getConfig()
  logger.info(
    `[database] connection pool initialized: ${config.host}:${config.port}/${config.name}`
  )

  if (pool) {
    return pool
  }

  try {
    pool = createPool(config)

    await pool.query('SELECT 1')

    return pool
  } catch (error) {
    logger.error({ error }, '[database] error initializing connection pool')
    throw error
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new ServerException(
      'connection pool not initialized.',
      500,
      'CONNECTION_POOL_NOT_INITIALIZED',
      {
        operation: 'get_pool',
        resource: 'database',
      }
    )
  }
  return pool
}

export async function stopDatabase(): Promise<void> {
  const config = getConfig()

  if (pool) {
    try {
      await pool.end()
      logger.info(
        `[database] connection pool terminated: ${config.host}:${config.port}/${config.name}`
      )
    } catch (error) {
      logger.error({ error }, '[database] error terminating connection pool')
    } finally {
      pool = null
    }
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const currentPool = getPool()
    await currentPool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}
