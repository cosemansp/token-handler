import { Hono } from 'hono';

export type ProxyMiddlewareOptions = {};

export const proxy = (options: ProxyMiddlewareOptions) => {
  const router = new Hono();
  router.use('/api/*', async (c, next) => {
    console.log('proxyMiddleware');
    await next();
  });
  return router;

  // return createMiddleware(async (c, next) => {
  //   console.log('proxyMiddleware');
  //   await next();
  // });
};
