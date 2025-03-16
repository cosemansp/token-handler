import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MemoryAdaptor } from './memoryAdaptor';
import { Adaptor } from './adaptor';

describe('MemoryAdaptor', () => {
  let adaptor: Adaptor;

  beforeEach(async () => {
    adaptor = new MemoryAdaptor();
    await adaptor.clear('ns');
  });

  afterEach(async () => {});

  test('should save and load data correctly', async () => {
    const testData = { key: 'value', number: 42 };

    await adaptor.save(testData, 'ns');
    const loadedData = await adaptor.load('ns');

    expect(loadedData).toEqual(testData);
  });

  test('should return null when no data is stored', async () => {
    const loadedData = await adaptor.load('ns');
    expect(loadedData).toBeNull();
  });
});
