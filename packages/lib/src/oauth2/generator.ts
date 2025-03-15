import * as encoding from '@oslojs/encoding';
import * as sha2 from '@oslojs/crypto/sha2';

export function createS256CodeChallenge(codeVerifier: string): string {
  const codeChallengeBytes = sha2.sha256(new TextEncoder().encode(codeVerifier));
  return encoding.encodeBase64urlNoPadding(codeChallengeBytes);
}

export function generateCodeVerifier(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encoding.encodeBase64urlNoPadding(randomValues);
}

export function generateState(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);
  return encoding.encodeBase64urlNoPadding(randomValues);
}
