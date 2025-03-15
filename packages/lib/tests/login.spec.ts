import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import { tokenHandler } from '../src/routes/tokenHandler';
import { ofetch } from 'ofetch';
import * as tokenFixture from './helpers/tokenFixture';
import { sessionMiddleware } from 'hono-sessions';
import { MockMemoryStore } from './helpers/mockMemoryStore';

vi.mock('ofetch');

describe('login', async () => {
  let app: Hono;
  let provider: any;
  let store: MockMemoryStore;
  beforeEach(() => {
    app = new Hono();
    store = new MockMemoryStore();
    app.use(
      sessionMiddleware({
        store: store,
      }),
    );
    provider = {
      name: 'azure',
      clientId: 'abc',
      clientSecret: '1234567890',
      redirectURI: 'http://localhost:3000/auth/login',
      scopes: ['api://1234567890/test'],
    };
    app.route(
      '/auth',
      tokenHandler({
        applications: [{ domain: 'localhost:3000', provider }],
      }),
    );
  });

  test('login - redirect to STS', async () => {
    const response = await app.request('/auth/login', {
      headers: {
        host: 'localhost:3000',
      },
    });
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get('location')!);
    const cookie = response.headers.get('set-cookie');
    // console.log(response.headers.get('location'));
    const state = location.searchParams.get('state');
    expect(`${location.origin}${location.pathname}`).toBe(
      'https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/v2.0/authorize',
    );
    expect(location.searchParams.get('client_id')).toBe(provider.clientId);
    expect(location.searchParams.get('redirect_uri')).toBe(provider.redirectURI);
    expect(state).toBeDefined();
    expect(location.searchParams.get('response_type')).toBe('code');
    expect(location.searchParams.get('scope')).toBe(provider.scopes.join(' '));
    expect(location.searchParams.get('code_challenge')).toBeDefined();
    expect(location.searchParams.get('code_challenge_method')).toBe('S256');
    expect(cookie).toBeDefined();
  });

  test('login - exchange code for tokens at STS', async () => {
    const host = 'localhost:3000';
    //
    // step 1 - redirect to STS
    //
    const response1 = await app.request('/auth/login', {
      headers: { host },
    });
    expect(response1.status).toBe(302);
    const location = new URL(response1.headers.get('location')!);
    const cookie = response1.headers.get('set-cookie');
    const state = location.searchParams.get('state');
    expect(cookie).toBeDefined();

    //
    // step 2 - exchange code for tokens at STS
    //
    vi.mocked(ofetch).mockResolvedValue({
      access_token: tokenFixture.accessToken,
      id_token: tokenFixture.idToken,
    });
    const response2 = await app.request(`/auth/login?code=9999999999&state=${state}`, {
      headers: {
        cookie: cookie!,
        host,
      },
    });
    expect(response2.status).toBe(302);
    expect(response2.headers.get('location')).toBe('/');
    expect(ofetch).toHaveBeenCalledWith(
      'https://login.microsoftonline.com/0b53d2c1-bc55-4ab3-a161-927d289257f2/oauth2/v2.0/token',
      expect.anything(),
    );
    const arg = (ofetch as any).mock.calls[0][1];
    const params = new URLSearchParams(arg.body);
    expect(arg.method).toBe('POST');
    expect(arg.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(params.get('code')).toBe('9999999999');
    expect(params.get('grant_type')).toBe('authorization_code');
    expect(params.get('client_secret')).toBe(provider.clientSecret);
    expect(params.get('client_id')).toBe(provider.clientId);
    expect(params.get('redirect_uri')).toBe(provider.redirectURI);

    const session = store.getFirstSession();
    expect(session.tokens).toBeDefined();
    expect(session.user).toMatchInlineSnapshot(`
      {
        "flash": false,
        "value": {
          "email": "john.doe@example.com",
          "name": "John Doe",
          "oid": "1234567890",
          "roles": [
            "staff",
            "tsz:admin",
          ],
        },
      }
    `);
  });
});
