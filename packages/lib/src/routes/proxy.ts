import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import micromatch from 'micromatch';
import { HonoOptions } from '../context';

export type ProxyMiddlewareOptions = {
  target: string;
  pathFilter?: string | string[];
  // TODO: add plugins support
  // plugins?: Array<{
  //   onRequest?: (req: Request) => Promise<Request> | Request;
  //   onResponse?: (res: Response) => Promise<Response> | Response;
  // }>;
};

/** Matches paths using glob patterns.
 * @example
 * /api/users -> matches /api/users & /api/users/1
 * /api/* -> matches /api/users & /api/users/1
 * /api/users/** -> matches /api/users/1/posts
 * /static/*.jpg -> matches /static/image.jpg
 * @param pattern - The glob pattern to match against
 * @param path - The path to test
 * @returns boolean indicating if the path matches the pattern
 */
export const isGlobMatch = (pattern: string, path: string): boolean => {
  if (!pattern.includes('*')) {
    return path.startsWith(pattern);
  }
  return micromatch.isMatch(path, pattern, { dot: true });
};

/**
 * Proxy and keep the same base path "/api"
 * http://127.0.0.1:3000/api/foo/bar -> http://www.example.org/api/foo/bar
 * @param options
 * @returns
 */
export const proxyRouter = (options: ProxyMiddlewareOptions) => {
  const router = new Hono<HonoOptions>();
  router.use('*', async (ctx, next) => {
    const url = new URL(ctx.req.url);

    // apply filters
    if (options.pathFilter) {
      const filters = Array.isArray(options.pathFilter) ? options.pathFilter : [options.pathFilter];
      if (!filters.some((filter) => isGlobMatch(filter, url.pathname))) {
        return next();
      }
    }

    // update url to proxy
    const proxyUrl = new URL(options.target);
    url.protocol = proxyUrl.protocol;
    url.host = proxyUrl.host;
    const headers = new Headers(ctx.req.header());

    // remove cookie and add auth headers
    const tokens = ctx.var.session.get('tokens');
    headers.delete('cookie');
    headers.set('Authorization', `Bearer ${tokens?.accessToken}`);

    try {
      return await proxy(url, {
        ...ctx.req,
        headers,
      });
    } catch (error) {
      // handle proxy errors, throw 502 error
      if (error instanceof Error) {
        console.error('Proxy error:', error);
        return ctx.json({ code: 'BAD_GATEWAY', message: error.message, cause: error.cause }, 502);
      }
      throw error;
    }
  });
  return router;
};
