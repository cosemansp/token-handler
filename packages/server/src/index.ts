import { serve } from '@hono/node-server';
import { env } from './env';
import app from './server';
import { getLogger } from './logger';

const log = getLogger('server');

log.info(`Server listening on http://localhost:${env.PORT}`);
serve({
  fetch: app.fetch,
  port: Number(env.PORT),
});
