import { describe, it, expect, beforeEach } from 'vitest';
import app from '../../src/server';
import { getIDPStrategy } from '../src/config';
import type { IDPStrategy } from '../src/config/idp';

describe('login', () => {
  describe('entra', () => {
    let entraConfig: IDPStrategy;

    beforeEach(() => {
      entraConfig = getIDPStrategy('entra');
    });

    it('should redirect to the authorization URL', async () => {
      const response = await app.request('/auth/login?idp=entra');
      expect(response.status).toBe(302);

      const url = new URL(response.headers.get('location')!);
      expect(`${url.origin}${url.pathname}`).toBe(entraConfig.getAuthorizationEndpoint());
      expect(url.searchParams.get('client_id')).toBe(entraConfig.getClientId());
      expect(url.searchParams.get('redirect_uri')).toBe(entraConfig.getRedirectUri());
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe(entraConfig.getScopes());
      expect(url.searchParams.get('state')).toBeDefined();
      expect(url.searchParams.get('code_challenge')).toBeDefined();
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    });

    it('should redirect to the authorization URL with additional scopes', async () => {
      const response = await app.request('/auth/login?idp=entra&scopes=user.read%20calendar.read');
      expect(response.status).toBe(302);

      const url = new URL(response.headers.get('location')!);
      expect(url.searchParams.get('scope')).toBe('openid profile email user.read calendar.read');
    });

    it('should return error if idp is missing', async () => {
      const response = await app.request('/auth/login');
      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: 'Missing idp parameter',
      });
    });

    it('should return 400 if idp is unknown', async () => {
      const response = await app.request('/auth/login?idp=invalid');
      expect(response.status).toBe(400);

      expect(await response.json()).toEqual({
        error: 'Invalid idp provider',
      });
    });
  });
});
