import pino from 'pino';
import { env } from './env';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL || 'error',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname,context',
          singleLine: false,
        },
      }
    : undefined,
});

export const getLogger = (context: string) => logger.child({ context }, { msgPrefix: `[${context}] ` });
