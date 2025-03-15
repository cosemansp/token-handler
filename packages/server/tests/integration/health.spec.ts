import { describe, expect, it } from 'vitest';
import app from '@/server';

describe('Health', () => {
  it('should return 200', async () => {
    const response = await app.request('/health');
    expect(response.status).toBe(200);
  });
});
