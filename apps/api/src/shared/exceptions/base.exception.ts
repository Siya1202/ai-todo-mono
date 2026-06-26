export abstract class BaseException extends Error {
  abstract statusCode: number;
  abstract status: string;

  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}