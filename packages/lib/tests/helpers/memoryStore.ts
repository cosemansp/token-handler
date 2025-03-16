import { Store } from 'hono-sessions';
import { SessionData } from '../../src/types';

export class MemoryStore implements Store {
  public data: Map<string, any> = new Map();
  constructor() {}

  public getFirstSession(): SessionData {
    const [firstSessionId] = this.data.keys();
    return this.data.get(firstSessionId)._data;
  }

  getSessionById(sid: string) {
    return this.data.has(sid) ? this.data.get(sid) : null;
  }

  createSession(sid: string, initialData: any) {
    this.data.set(sid, initialData);
  }

  deleteSession(sid: string) {
    this.data.delete(sid);
  }

  persistSessionData(sid: string, sessionData: any) {
    this.data.set(sid, sessionData);
  }

  clear() {
    // Delete all sessions that were created
    Object.keys(this.data).forEach((sid) => {
      this.deleteSession(sid);
    });
  }
}
