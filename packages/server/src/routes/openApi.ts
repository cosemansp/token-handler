import { apiReference } from '@scalar/hono-api-reference';
import openApiDoc from '../openapi.json';
import { env } from '../env';
import { proxy } from 'hono/proxy';

import { Hono } from 'hono';

const router = new Hono();

router.get('/spec.json', (c) => c.json(openApiDoc));

// To avoid CORS error we need to proxy the request to microsoft Entra ID
// See proxyUrl in the configuration
router.post('/proxy', async (c) => {
  const url = c.req.query('scalar_url');
  const headers = new Headers(c.req.header());
  headers.delete('host');
  headers.delete('cookie');
  headers.delete('origin');
  headers.delete('content-encoding');
  return proxy(url!, {
    ...c.req,
    headers,
  });
});

// More config
// https://github.com/scalar/scalar/blob/main/documentation/configuration.md

router.get(
  '/',
  apiReference({
    theme: 'kepler',
    layout: 'classic',
    darkMode: true,
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'fetch',
    },
    proxyUrl: 'http://localhost:3000/openapi/proxy',
    authentication: {
      oAuth2: {
        clientId: env.AZURE_CLIENT_ID,
        scopes: ['bb14914d-6da2-4306-8ab1-0eb99a352702/.default'],
        accessToken: '',
        state: '',
        username: '',
        password: '',
      },
    },
    spec: {
      url: '/openapi/spec.json',
    },
  }),
);

export default router;
