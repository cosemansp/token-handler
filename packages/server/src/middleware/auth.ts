import { createMiddleware } from 'hono/factory';
import { JwksClient } from 'jwks-rsa';
import * as jose from 'jose';
import { JOSEError } from 'jose/errors';
import { env } from '@/env';

export type AzureJWTPayload = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  nbf: number;
  sub: string;
  upn: string;
  preferred_username: string;
  roles_euri: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  claims?: AzureJWTPayload;
};

const jwksClient = new JwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
  cache: true, // Enable caching to avoid excessive network requests
});

export const authMiddleware = createMiddleware(async (c, next) => {
  // get token from header
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid authorization token' }, 401);
  }
  const token = authHeader.substring(7);

  try {
    // get public key
    const header = jose.decodeProtectedHeader(token);
    const alg = header.alg || 'RS256';
    const spki = await jwksClient.getSigningKey(header.kid).then((key) => {
      return key!.getPublicKey();
    });
    const publicKey = await jose.importSPKI(spki, alg);

    // verify token
    const result = await jose.jwtVerify<AzureJWTPayload>(token, publicKey, {
      algorithms: [alg],
      audience: env.AZURE_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/v2.0`,
    });

    // map payload to user
    const user = {
      id: result.payload.sub,
      email: result.payload.preferred_username?.toLowerCase(),
      name: result.payload.name,
      roles: result.payload.roles_euri?.split(',') || ['user'],
      // claims: result.payload,
    };

    // set user to context
    console.log('user', user);
    console.log('payload', result.payload);
    c.set('user', user);
    await next();
  } catch (err) {
    // something went wrong
    console.error(err);
    if (err instanceof JOSEError) {
      return c.json({ error: 'Unauthorized', reason: err.code }, 401);
    }
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

export default authMiddleware;
