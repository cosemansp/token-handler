import { Context, Next } from 'hono';
import { proxy as honoProxy } from 'hono/proxy';
import micromatch from 'micromatch';

export type ProxyOptions = {
  // Target URL to proxy to
  target: string;

  // Filter paths to proxy
  pathFilter?: string | string[];

  // Middleware to apply to the proxy request
  middleware?: (orgUrl: string, ctx: Request, next: any) => Promise<void>;
};

export const isGlobMatch = (pattern: string, path: string): boolean => {
  if (!pattern.includes('*')) {
    return path.startsWith(pattern);
  }
  return micromatch.isMatch(path, pattern, { dot: true });
};

/**
 * ProxyMiddleware: Proxy and keep the same base path "/api"
 * http://127.0.0.1:3000/api/foo/bar -> http://www.example.org/api/foo/bar
 * @param options
 * @returns
 */
export const proxy = (options: ProxyOptions) => async (ctx: Context, next: Next) => {
  const url = new URL(ctx.req.url);

  // apply filters
  if (options.pathFilter) {
    const filters = Array.isArray(options.pathFilter) ? options.pathFilter : [options.pathFilter];
    if (!filters.some((filter) => isGlobMatch(filter, url.pathname))) {
      return next();
    }
  }

  try {
    // update url to proxy
    const newUrl = new URL(ctx.req.url);
    const proxyUrl = new URL(options.target);
    newUrl.protocol = proxyUrl.protocol;
    newUrl.host = proxyUrl.host;
    const headers = new Headers(ctx.req.header());

    // remove cookie and add auth headers
    const tokens = ctx.var.session.get('tokens');

    console.log('tokens', tokens);
    headers.delete('cookie');
    if (tokens?.accessToken) {
      headers.set('Authorization', `Bearer ${tokens?.accessToken}`);
    }
    // construct new request
    const req = {
      ...ctx.req,
      headers,
      url: newUrl.toString(),
    } as any;

    // apply middleware (if any)
    if (options.middleware) {
      const next = () => {
        return honoProxy(newUrl, req);
      };
      return await options.middleware(url.toString(), req, next);
    }

    // no middleware, just proxy
    return await honoProxy(newUrl, req);
  } catch (error) {
    // handle proxy errors, throw 502 error
    if (error instanceof Error) {
      console.error('Proxy error:', error);
      return ctx.json({ code: 'BAD_GATEWAY', message: error.message, cause: error.cause }, 502);
    }
    throw error;
  }
};

// export const proxyRouter = (options: ProxyOptions) => {
//   const router = new Hono<HonoOptions>();
//   router.use('/', proxy(options));
//   return router;
// };
