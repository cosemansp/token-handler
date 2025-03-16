import { Context } from 'hono';
import { CookieStore, SessionData } from 'hono-sessions';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { CookieOptions } from 'hono/utils/cookie';
import { decrypt, encrypt } from '../crypto';

interface CookieStoreOptions {
  encryptionKey?: string | null;
  cookieOptions?: CookieOptions;
  sessionCookieName: string;
}

const ALLOWED_COOKIE_SIZE = 4096;
const ESTIMATED_EMPTY_COOKIE_SIZE = 160;
const CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;

export class CookieStoreEx extends CookieStore {
  public encryptionKey: string | null | undefined;
  public cookieOptions: CookieOptions | undefined;
  public sessionCookieName: string;

  constructor(options?: CookieStoreOptions) {
    super();
    this.encryptionKey = options?.encryptionKey;
    this.cookieOptions = options?.cookieOptions;
    this.sessionCookieName = options?.sessionCookieName || 'session';
  }

  async getSession(c: Context): Promise<SessionData | null> {
    let session_data_raw: string;
    const sessionCookie = getCookie(c, this.sessionCookieName);
    const sessionCookieChunk = getCookie(c, `${this.sessionCookieName}-0`);
    const value = sessionCookieChunk ? sessionCookie + sessionCookieChunk : sessionCookie;
    if (this.encryptionKey && value) {
      // Decrypt cookie string. If decryption fails, return null
      try {
        session_data_raw = (await decrypt(this.encryptionKey, value)) as string;
      } catch {
        return null;
      }

      // Parse session object from cookie string and return result. If fails, return null
      try {
        const session_data = JSON.parse(session_data_raw) as SessionData;
        return session_data;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  async createSession(c: Context, initial_data: SessionData) {
    const stringified_data = JSON.stringify(initial_data);
    const value = this.encryptionKey ? await encrypt(this.encryptionKey, stringified_data) : stringified_data;
    this.setCookie(c, this.sessionCookieName, value);
  }

  async deleteSession(c: Context) {
    this.setCookie(c, this.sessionCookieName, this.encryptionKey ? await encrypt(this.encryptionKey, '') : '');
  }

  async persistSessionData(c: Context, session_data: SessionData) {
    const stringified_data = JSON.stringify(session_data);
    const value = this.encryptionKey ? await encrypt(this.encryptionKey, stringified_data) : stringified_data;
    this.setCookie(c, this.sessionCookieName, value);
  }

  private setCookie(c: Context, name: string, value: string) {
    const chunkCount = Math.ceil(value.length / CHUNK_SIZE);
    if (chunkCount > 1) {
      const value1 = value.substr(0, CHUNK_SIZE);
      setCookie(c, this.sessionCookieName, value1, this.cookieOptions);
      const value2 = value.substr(1 * CHUNK_SIZE, CHUNK_SIZE);
      setCookie(c, `${this.sessionCookieName}-0`, value2, this.cookieOptions);
      return;
    }
    setCookie(c, this.sessionCookieName, value, this.cookieOptions);
    deleteCookie(c, `${this.sessionCookieName}-0`, this.cookieOptions);
  }
}
