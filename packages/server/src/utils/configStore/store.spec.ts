import { describe, test, expect } from 'vitest';
import { ConfigStore } from './store';
import { FileAdaptor } from './adaptors/fileAdaptor';
import { MemoryAdaptor } from './adaptors/memoryAdaptor';
import { AppConfigAdaptor } from './adaptors/appConfigAdaptor';

describe('ConfigStore', () => {
  test('should create a file based store', () => {
    const store = new ConfigStore('file://./test.json', 'abc');
    expect(store.adaptor).toBeInstanceOf(FileAdaptor);
    expect(store.nameSpace).toBe('abc');
  });

  test('should create a memory based store', () => {
    const store = new ConfigStore('memory://', 'ns');
    expect(store.adaptor).toBeInstanceOf(MemoryAdaptor);
    expect(store.nameSpace).toBe('ns');
  });

  test('should create a azure app config based store', () => {
    const store = new ConfigStore('https://ac-euri-tokens-we.azconfig.io', 'test');
    expect(store.adaptor).toBeInstanceOf(AppConfigAdaptor);
    expect(store.nameSpace).toBe('test');
  });

  test('should return saved data', async () => {
    const store = new ConfigStore('memory://', 'ns');
    await store.save({ test: 'test' });
    expect(store.config).toEqual({ test: 'test' });

    const data = await store.load();
    expect(data).toEqual({ test: 'test' });
  });
});
