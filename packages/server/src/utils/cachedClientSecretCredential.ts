import { AccessToken, GetTokenOptions, TokenCredential, ClientSecretCredential } from '@azure/identity';
import { getLogger } from '@/logger';

const logger = getLogger('CachedClientSecretCredential');

export class CachedClientSecretCredential implements TokenCredential {
  private credential: ClientSecretCredential;
  private cachedTokens: Map<string, AccessToken> = new Map();

  constructor(tenantId: string, clientId: string, clientSecret: string, options?: any) {
    this.credential = new ClientSecretCredential(tenantId, clientId, clientSecret, options);
  }

  async getToken(scopes: string | string[], options?: GetTokenOptions): Promise<AccessToken | null> {
    const scopeKey = Array.isArray(scopes) ? scopes.join(' ') : scopes;

    // Check if we have a cached token that's not expired
    const cachedToken = this.cachedTokens.get(scopeKey);
    if (cachedToken && cachedToken.expiresOnTimestamp - Date.now() > 5 * 60 * 1000) {
      // Return cached token if it's not expiring in the next 5 minutes
      logger.debug('Token cache hit:', `${scopeKey} - ${cachedToken.token.substring(0, 20)}...`);
      return cachedToken;
    }

    // Get a new token
    const token = await this.credential.getToken(scopes, options);
    logger.debug('Get token:', token);
    if (token) {
      // Cache the new token
      this.cachedTokens.set(scopeKey, token);
    }

    return token;
  }
}
