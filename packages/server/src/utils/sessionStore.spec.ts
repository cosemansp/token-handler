import { describe, test, expect, beforeEach, beforeAll } from 'vitest';
import SessionStore from './sessionStore';
import { env } from '@/env';

describe('ConfigStore', () => {
  describe('Memory', () => {
    let store: SessionStore;

    beforeEach(async () => {
      store = new SessionStore();
    });

    test('should save and load data correctly', async () => {
      const testData = {
        _data: { test: { value: 'peter', flash: false } },
        _expire: '000',
        _accessed: 'abc',
        _delete: false,
      };

      await store.createSession('1234', testData);
      const loadedData = await store.getSessionById('1234');

      expect(loadedData).toEqual(testData);
    });

    test('should return null when no data is stored', async () => {
      const loadedData = await store.getSessionById('unknown');

      expect(loadedData).toBeUndefined();
    });
  });

  // Mongo is skipped by default because it requires a valid
  // Azure Cosmos DB connection string
  describe('Mongo', () => {
    let store: SessionStore;

    beforeAll(async () => {
      store = new SessionStore(env.SESSION_STORE);
    });

    test('should save and load data correctly', async () => {
      const testData = {
        _data: { test: { value: 'peter', flash: false } },
        _expire: '000',
        _accessed: 'abc',
        _delete: false,
      };

      await store.createSession('1234', testData);
      const loadedData = await store.getSessionById('1234');
      expect(loadedData).toEqual(testData);
    });

    test('should return session data from cache', async () => {
      console.time('getSessionById');
      const loadedData = await store.getSessionById('1234');
      const loadedData2 = await store.getSessionById('1234');
      const loadedData3 = await store.getSessionById('1234');
      const loadedData4 = await store.getSessionById('1234');
      console.timeEnd('getSessionById');
      expect(loadedData).toEqual(loadedData2);
      expect(loadedData).toEqual(loadedData3);
      expect(loadedData).toEqual(loadedData4);
    });

    test('should return null when no data is stored', async () => {
      const loadedData = await store.getSessionById('unknown');
      expect(loadedData).toBeUndefined();
    });
  });
});
