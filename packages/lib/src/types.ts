import { Session } from 'hono-sessions';
import { OAuth2Tokens } from './oauth2';

export interface User {
  oid: string;
  name: string;
  email: string;
  roles: string[];
}

export interface SessionData {
  tokens?: OAuth2Tokens;
  user?: User;
  providerName?: string;
}

export interface InternalSessionData extends SessionData {
  state?: string;
  codeVerifier?: string;
}

export { OAuth2Tokens };

export type HonoOptions = {
  Variables: {
    session: Session<InternalSessionData>;
  };
};
