import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isGlobMatch, proxy } from './proxyMiddleware';
import { Hono } from 'hono';
import { HonoOptions } from '../types';
import { sessionMiddleware } from 'hono-sessions';
import { MemoryStore } from '../../tests/helpers/memoryStore';
import { proxy as honoProxy } from 'hono/proxy';

vi.mock('hono/proxy');

describe('proxy', () => {
  /**
   * /api/users -> matches /api/users & /api/users/1
   * /api/* -> matches /api/users & /api/users/1
   * /api/users/** -> matches /api/users/1/posts
   * /static/*.jpg -> matches /static/image.jpg
   */

  describe('isGlobMatch', () => {
    it('should match exact paths', () => {
      expect(isGlobMatch('/api/users', '/api/users')).toBe(true);
      expect(isGlobMatch('/api/posts', '/api/users')).toBe(false);
    });

    it('should match single wildcard patterns', () => {
      expect(isGlobMatch('/api/*', '/api/users')).toBe(true);
      expect(isGlobMatch('/api/*', '/api/users/1')).toBe(false);
      expect(isGlobMatch('/api/users/**', '/api/posts/1')).toBe(false);
    });

    it('should match paths using includes for non-glob patterns', () => {
      expect(isGlobMatch('/api', '/api/users')).toBe(true);
      expect(isGlobMatch('/users', '/api/users')).toBe(false);
    });
  });

  describe('router', () => {
    let app: Hono<HonoOptions>;
    beforeEach(() => {
      const store = new MemoryStore();
      app = new Hono<HonoOptions>();
      app.use(
        sessionMiddleware({
          store,
        }),
      );
      app.use(
        '/api/*',
        proxy({
          target: 'https://sample.com/api',
        }),
      );
      vi.mocked(honoProxy).mockImplementation((url, req) => {
        expect(url.toString()).toBe('https://sample.com/api/users');
        expect(req?.headers.get('Authorization')).toBe(null);
        return new Response('ok') as any;
      });
    });

    it('should proxy requests to the target', async () => {
      const response = await app.request('/api/users');
      expect(response.status).toBe(200);
      expect(vi.mocked(honoProxy)).toHaveBeenCalled();
    });
  });
});
