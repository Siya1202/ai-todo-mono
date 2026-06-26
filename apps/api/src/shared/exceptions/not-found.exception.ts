import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  statusCode = 404;
  status = 'fail';

  constructor(message: string) {
    super(message);
  }
}