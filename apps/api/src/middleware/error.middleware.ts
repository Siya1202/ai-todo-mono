import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../shared/exceptions';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof BaseException) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};