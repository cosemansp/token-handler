import { HTTPException } from 'hono/http-exception';

export class MethodNotAllowedError extends HTTPException {
  constructor(message: string = 'MethodNotAllowedError') {
    super(405, { message });
  }
}

export class NotFoundError extends HTTPException {
  constructor(message: string = 'NotFoundError') {
    super(404, { message, cause: new Error(message) });
  }
}

export class UnauthorizedError extends HTTPException {
  constructor(message: string = 'UnauthorizedError') {
    super(401, { message });
  }
}

export class BadRequestError extends HTTPException {
  constructor(message: string = 'BadRequestError') {
    super(400, { message });
  }
}
