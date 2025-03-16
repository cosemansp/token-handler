import { ApplicationConfig } from '@/models/config';
import { ConfigStore } from '@/utils/configStore/store';
import { createMiddleware } from 'hono/factory';

export const configMiddleware = (store: ConfigStore<ApplicationConfig>) => {
  return createMiddleware(async (ctx, next) => {
    ctx.set('config', store);
    await next();
  });
};
