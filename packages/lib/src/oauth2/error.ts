export class OAuth2RequestError extends Error {
  public code: string;
  public description: string | null;
  public uri: string | null;
  public state: string | null;

  constructor(code: string, description: string | null, uri: string | null, state: string | null) {
    super(`OAuth request error: ${code}`);
    this.code = code;
    this.description = description;
    this.uri = uri;
    this.state = state;
  }
}

export class UnexpectedResponseError extends Error {
  public status: number;
  public data: unknown;

  constructor(status: number, data: unknown) {
    super('Unexpected error response body');
    this.status = status;
    this.data = data;
  }
}
