import 'dotenv/config'

export const settings = {
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: Number(process.env['DB_PORT']) || 5432,
    name: process.env['DB_NAME'] || 'service-typescript-node-express',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '123456',
    maxConnections: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  },
  server: {
    port: Number(process.env['HTTP_PORT']) || 4000,
    name: 'service-typescript-node-express',
  },
  openapi: {
    enabled: true,
    spec: {
      path: '/spec',
      title: 'service-typescript-node-express',
      description: 'API - Node.js, TypeScript, Express.js, zod, OpenAPI and PostgreSQL',
      version: '1.0.0',
    },
    doc: {
      path: '/doc',
    },
  },
  debug: process.env['DEBUG'] === 'true',
  logging: {
    level: process.env['LOGGING_LEVEL'] || 'info',
  },
  environment: {
    isDevelopment: process.env['NODE_ENV'] === 'development',
    isProduction: process.env['NODE_ENV'] === 'production',
    nodeEnv: process.env['NODE_ENV'] || 'development',
  },
}
