import { beforeEach, describe, expect, test } from 'vitest';
import { Adaptor } from './adaptor';
import { AppConfigAdaptor } from './appConfigAdaptor';
import { ClientSecretCredential } from '@azure/identity';
import { env } from '../../../env';

describe('AppConfigAdaptor', () => {
  let adaptor: Adaptor;

  beforeEach(() => {
    adaptor = new AppConfigAdaptor(
      'https://ac-euri-tokens-we.azconfig.io',
      new ClientSecretCredential(env.ENTRA_TENANT_ID, env.ENTRA_CLIENT_ID, env.ENTRA_CLIENT_SECRET),
    );
  });

  beforeEach(async () => {
    await adaptor.clear('test');
  });

  test('should save and load data correctly', async () => {
    const testData = { key: 'value', number: 42 };

    await adaptor.save(testData, 'test');
    const loadedData = await adaptor.load('test');
    expect(loadedData).toEqual(testData);
  });

  test('should return null when no data is stored', async () => {
    const loadedData = await adaptor.load('test');
    expect(loadedData).toBeNull();
  });

  test('using alternative config adaptor setup', async () => {
    adaptor = new AppConfigAdaptor(
      'Endpoint=https://ac-euri-tokens-we.azconfig.io;Id=12Bk;Secret=4rsSwQrUKzteHszct9l4e4ENQOMYLqvYgN3Vvsp9YGBSuu4DnBk6JQQJ99BCACYeBjFWy122AAACAZAC309Y',
    );

    const testData = { key: 'value', number: 42 };
    await adaptor.save(testData, 'test');
    const loadedData = await adaptor.load('test');
    expect(loadedData).toEqual(testData);
  });
});
