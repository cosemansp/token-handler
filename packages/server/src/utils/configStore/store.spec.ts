import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ConfigStore } from './store';
import { FileAdaptor } from './adaptors/fileAdaptor';
import { AppConfigAdaptor } from './adaptors/appConfigAdaptor';
import { env } from '@/env';
import { ClientSecretCredential } from '@azure/identity';
import { MemoryAdaptor } from './adaptors/memoryAdaptor';

describe.skip('ConfigStore', () => {
  describe('Memory', () => {
    let store: ConfigStore;

    beforeEach(async () => {
      store = new ConfigStore(new MemoryAdaptor());
      await store.clear();
    });

    afterEach(async () => {});

    test('should save and load data correctly', async () => {
      const testData = { key: 'value', number: 42 };

      await store.save(testData);
      const loadedData = await store.load();

      expect(loadedData).toEqual(testData);
    });

    test('should return null when no data is stored', async () => {
      const loadedData = await store.load();

      expect(loadedData).toBeNull();
    });
  });

  describe('File', () => {
    let store: ConfigStore;

    beforeEach(() => {
      store = new ConfigStore(new FileAdaptor('file://.test.json'));
    });

    beforeEach(async () => {
      await store.clear();
    });

    test('should save and load data correctly', async () => {
      const testData = { key: 'value', number: 42 };

      await store.save(testData);
      const loadedData = await store.load();

      expect(loadedData).toEqual(testData);
    });

    test('should return null when no data is stored', async () => {
      const loadedData = await store.load();

      expect(loadedData).toBeNull();
    });
  });

  // config is skipped by default because it requires a valid
  // Azure App Configuration endpoint and credentials
  describe('Config', () => {
    let store: ConfigStore;

    beforeEach(() => {
      store = new ConfigStore(
        new AppConfigAdaptor(
          'https://ac-euri-tokens-we.azconfig.io',
          'test',
          new ClientSecretCredential(env.AZURE_TENANT_ID, env.AZURE_CLIENT_ID, env.AZURE_CLIENT_SECRET),
        ),
      );
    });

    beforeEach(async () => {
      await store.clear();
    });

    test('should save and load data correctly', async () => {
      const testData = { key: 'value', number: 42 };

      await store.save(testData);
      const loadedData = await store.load();
      expect(loadedData).toEqual(testData);
    });

    test('should return null when no data is stored', async () => {
      const loadedData = await store.load();
      expect(loadedData).toBeNull();
    });

    test('using alternative config adaptor setup', async () => {
      store = new ConfigStore(
        new AppConfigAdaptor(
          'Endpoint=https://ac-euri-tokens-we.azconfig.io;Id=12Bk;Secret=4rsSwQrUKzteHszct9l4e4ENQOMYLqvYgN3Vvsp9YGBSuu4DnBk6JQQJ99BCACYeBjFWy122AAACAZAC309Y',
          'test',
        ),
      );

      const testData = { key: 'value', number: 42 };
      await store.save(testData);
      const loadedData = await store.load();
      expect(loadedData).toEqual(testData);
    });
  });
});
