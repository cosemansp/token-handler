import { jwtDecode } from 'jwt-decode';

export type OAuth2Tokens = {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
  scope: string[];
};

export function decodeToken(token: string): Record<string, unknown> {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error(error);
    return {};
  }
}
