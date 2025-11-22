import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { errorResponse } from '../utils/response.util';
import { logger } from '../utils/logger.util';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      errorResponse(err.code || 'ERROR', err.message)
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', err.errors)
    );
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json(
        errorResponse('CONFLICT', 'A record with this value already exists')
      );
    }
    if (err.code === 'P2025') {
      return res.status(404).json(
        errorResponse('NOT_FOUND', 'Record not found')
      );
    }
  }

  // Handle unknown errors
  return res.status(500).json(
    errorResponse(
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message
    )
  );
};
