import { describe, it, expect } from 'vitest';
import { isGlobMatch } from './proxy';

describe('isGlobMatch', () => {
  it('should match exact paths', () => {
    expect(isGlobMatch('/api/users', '/api/users')).toBe(true);
    expect(isGlobMatch('/api/posts', '/api/users')).toBe(false);
  });

  it('should match single wildcard patterns', () => {
    expect(isGlobMatch('/api/*', '/api/users')).toBe(true);
    expect(isGlobMatch('/api/*', '/api/posts')).toBe(true);
    expect(isGlobMatch('/api/*', '/api/users/1')).toBe(false);
    expect(isGlobMatch('/static/*.jpg', '/static/image.jpg')).toBe(true);
    expect(isGlobMatch('/static/*.jpg', '/static/image.png')).toBe(false);
  });

  it('should match double wildcard patterns', () => {
    expect(isGlobMatch('/api/**', '/api/users/1/posts')).toBe(true);
    expect(isGlobMatch('/api/users/**', '/api/users/1/posts/2')).toBe(true);
    expect(isGlobMatch('/api/users/**', '/api/posts/1')).toBe(false);
  });

  it('should handle trailing slashes correctly', () => {
    expect(isGlobMatch('/api/users/', '/api/users')).toBe(true);
    expect(isGlobMatch('/api/users', '/api/users/')).toBe(true);
  });

  it.only('should match paths using includes for non-glob patterns', () => {
    expect(isGlobMatch('/api', '/api/users')).toBe(true);
    expect(isGlobMatch('/users', '/api/users')).toBe(false);
    expect(isGlobMatch('/posts', '/api/users')).toBe(false);
  });
});
