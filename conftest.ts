import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { vi } from 'vitest'
import { z } from 'zod'

extendZodWithOpenApi(z)

global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

vi.mock('../src/settings', () => ({
  settings: {
    environment: {
      isDevelopment: true,
      isProduction: false,
      isTest: true,
    },
    server: {
      name: 'test-server',
      port: 3000,
    },
    logging: {
      level: 'silent',
    },
    database: {
      url: 'postgresql://test:test@localhost:5432/test',
    },
  },
}))

vi.mock('../src/shared/logging', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  logServerInfo: vi.fn(),
}))

vi.mock('../src/shared/database', () => ({
  startDatabase: vi.fn(),
  stopDatabase: vi.fn(),
  getClient: vi.fn(),
  query: vi.fn(),
}))
