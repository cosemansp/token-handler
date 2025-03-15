import { describe, it, expect } from 'vitest';
import { createS256CodeChallenge, generateCodeVerifier, generateState } from './generator';
import * as encoding from '@oslojs/encoding';
import * as sha2 from '@oslojs/crypto/sha2';

describe('OAuth2 Generator', () => {
  it('should create a valid S256 code challenge', () => {
    const codeVerifier = 'testCodeVerifier';
    const expectedChallenge = encoding.encodeBase64urlNoPadding(sha2.sha256(new TextEncoder().encode(codeVerifier)));

    const codeChallenge = createS256CodeChallenge(codeVerifier);

    expect(codeChallenge).toBe(expectedChallenge);
  });

  it('should generate a valid code verifier', () => {
    const codeVerifier = generateCodeVerifier();
    expect(codeVerifier).toHaveLength(43); // Base64url encoding of 32 bytes results in 43 characters
  });

  it('should generate a valid state', () => {
    const state = generateState();
    expect(state).toHaveLength(43); // Base64url encoding of 32 bytes results in 43 characters
  });
});
