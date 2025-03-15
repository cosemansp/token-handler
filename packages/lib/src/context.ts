import { Session } from 'hono-sessions';
import { OAuth2Tokens } from './oauth2';

export interface User {
  oid: string;
  name: string;
  email: string;
  roles: string[];
}

export interface SessionData {
  state?: string;
  codeVerifier?: string;
  tokens?: OAuth2Tokens;
  user?: User;
  providerName?: string;
}

export interface HonoOptions {
  Variables: {
    session: Session<SessionData>;
  };
}
