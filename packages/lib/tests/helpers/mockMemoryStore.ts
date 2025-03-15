import { MemoryStore } from 'hono-sessions';
import { SessionData } from '../../src/context';

export class MockMemoryStore extends MemoryStore {
  constructor() {
    super();
  }

  public getData(): Map<string, any> {
    // little hack to get the data from the private property
    return (this as any).data;
  }

  public getFirstSession(): SessionData {
    const data = this.getData();
    const [firstSessionId] = data.keys();
    return data.get(firstSessionId)._data;
  }

  getSessionById(sid: string) {
    return super.getSessionById(sid);
  }

  createSession(sid: string, initialData: any) {
    super.createSession(sid, initialData);
  }

  deleteSession(sid: string) {
    super.deleteSession(sid);
  }

  persistSessionData(sid: string, sessionData: any) {
    super.persistSessionData(sid, sessionData);
  }

  clear() {
    // Delete all sessions that were created
    Object.keys(this.getData()).forEach((sid) => {
      this.deleteSession(sid);
    });
  }
}
