import { Store, SessionData } from 'hono-sessions';
import Keyv from 'keyv';
import KeyvSqlite from '@keyv/sqlite';
import KeyvMongo from '@keyv/mongo';
import { getLogger } from '@/logger';
import { LRUCache } from 'lru-cache';

const log = getLogger('sessionStore');

class SessionStore implements Store {
  keyv: Keyv;
  cache: LRUCache<string, SessionData>;

  constructor(storeUrl: string = '') {
    this.cache = new LRUCache<string, SessionData>({
      max: 1000, // Maximum number of items to store
      ttl: 1000 * 60 * 60, // 60 minutes TTL

      // stale-while-revalidate
      allowStale: true,
      fetchMethod: async (key) => {
        log.debug('SWR - Fetch session data', key);
        const session = await this.getSessionById(key);
        return session!;
      },
    });

    // mongo store (mongodb://localhost:27017/test)
    if (storeUrl.includes('mongo')) {
      const store = new KeyvMongo(storeUrl);
      this.keyv = new Keyv({ store, ttl: 5000, namespace: 'cache' });
      log.info('Using Mongo store');
    }
    // sqlite store (sqlite://sessionStore.sqlite)
    else if (storeUrl.includes('sqlite')) {
      this.keyv = new Keyv({
        store: new KeyvSqlite(storeUrl),
        ttl: 5000,
        namespace: 'cache',
      });
      log.info('Using SQLite store');
      return;
    }
    // memory store
    else {
      this.keyv = new Keyv();
      log.info('Using memory store');
    }

    // log errors
    this.keyv.on('error', (err) => console.error('Connection Error', err));
    return;
  }

  async getSessionById(sid: string): Promise<SessionData | null | undefined> {
    // Try to get from cache first
    const cached = this.cache.get(sid);
    if (cached) {
      return cached;
    }

    const session = await this.keyv.get<SessionData | null | undefined>(sid);
    if (session) {
      this.cache.set(sid, session);
    }
    return session;
  }

  async createSession(sid: string, initial_data: SessionData) {
    await this.keyv.set(sid, initial_data, 5000);
    this.cache.set(sid, initial_data);
  }

  async deleteSession(sid: string) {
    await this.keyv.delete(sid);
    this.cache.delete(sid);
  }

  async persistSessionData(sid: string, session_data: SessionData) {
    await this.keyv.set(sid, session_data);
    this.cache.set(sid, session_data);
  }
}

export default SessionStore;
