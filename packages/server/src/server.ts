import { Hono } from 'hono';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/serve-static';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import sessionMiddleware from './middleware/session';
import proxyRoutes from './routes/proxy';
import healthRoutes from './routes/health';
import openApiRoutes from './routes/openApi';
import applicationsRoutes from './routes/applications';
import { ConfigStore } from './utils/configStore/store';
import { env } from '@/env';
import { ApplicationConfig } from './models/config';
import { configMiddleware } from './middleware/appsConfig';
import { getLogger } from './logger';

const log = getLogger('server');

const app = new Hono();

//
// preload the configuration
//
const configStore = new ConfigStore<ApplicationConfig>(env.CONFIG_STORE, env.CONFIG_STORE_NS);
const config = await configStore.load();
log.info({ config }, 'appsConfig');

//
// Middleware
//

app.use(configMiddleware(configStore));
// app.use(poweredBy());
if (process.env.NODE_ENV !== 'test') {
  app.use(logger());
}
app.use(sessionMiddleware);

//
// Test page for development
//
if (process.env.NODE_ENV === 'development') {
  app.use(
    '/',
    serveStatic({
      root: join(process.cwd(), 'tests'),
      getContent: async (path) => {
        return readFileSync(path, 'utf-8');
      },
    }),
  );
}

//
// Routes
//

app.route('/auth', authRoutes);
app.route('/openapi', openApiRoutes);
app.route('/api/applications', applicationsRoutes);
app.route('/api/health', healthRoutes);
app.route('/api/*', proxyRoutes);

//
// Error handlers
//
app.onError(errorHandler);

export default app;
