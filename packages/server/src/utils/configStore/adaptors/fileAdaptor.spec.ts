import { describe, test, expect, beforeEach } from 'vitest';
import { FileAdaptor } from './fileAdaptor';
import { Adaptor } from './adaptor';

describe('FileAdaptor', () => {
  let adaptor: Adaptor;

  beforeEach(() => {
    adaptor = new FileAdaptor('file://.test.json');
  });

  beforeEach(async () => {
    await adaptor.clear('ns');
  });

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
