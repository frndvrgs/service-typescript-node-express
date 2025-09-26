import pino from 'pino'
import { settings } from '../settings'

const createLogger = () => {
  if (!settings.logging.enabled) {
    return pino({ enabled: false })
  }

  const config: pino.LoggerOptions = {
    level: settings.environment.isDevelopment ? 'debug' : 'info',
    ...(settings.environment.isDevelopment && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  }

  return pino(config)
}

export const logger = createLogger()
