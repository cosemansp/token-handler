import { tokenHandler } from '@euricom/hono-token-handler';

export default tokenHandler({
  applications: [
    {
      domain: 'localhost:3000',
      provider: {
        name: 'azure',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        redirectURI: 'http://localhost:3000/auth/login',
        scopes: ['openid', 'email', 'profile', 'offline_access', 'api://bb14914d-6da2-4306-8ab1-0eb99a352702/test'],
      },
    },
  ],
});
