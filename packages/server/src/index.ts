import { serve } from '@hono/node-server';
import { env } from './env';
import app from './server';

console.log(`\nStarting server on http://localhost:${env.PORT}`);
serve({
  fetch: app.fetch,
  port: Number(env.PORT),
});
