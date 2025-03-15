import { describe, it, expect } from 'vitest';
import { OAuth2RequestError, UnexpectedResponseError } from './error';

describe('OAuth2RequestError', () => {
  it('should create an instance with correct properties', () => {
    const error = new OAuth2RequestError('invalid_request', 'The request is invalid', 'http://example.com', 'state123');
    expect(error.code).toBe('invalid_request');
    expect(error.description).toBe('The request is invalid');
    expect(error.uri).toBe('http://example.com');
    expect(error.state).toBe('state123');
  });

  it('should have a correct message', () => {
    const error = new OAuth2RequestError('invalid_request', null, null, null);
    expect(error.message).toBe('OAuth request error: invalid_request');
  });
});

describe('UnexpectedResponseError', () => {
  it('should create an instance with correct properties', () => {
    const error = new UnexpectedResponseError(500, { message: 'Internal Server Error' });
    expect(error.status).toBe(500);
    expect(error.data).toEqual({ message: 'Internal Server Error' });
  });

  it('should have a correct message', () => {
    const error = new UnexpectedResponseError(404, {});
    expect(error.message).toBe('Unexpected error response body');
  });
});
