import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  // Hide stack trace in production
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    res.status(409).json({
      status: 'error',
      message: 'A record with that unique field already exists.',
    });
    return;
  }

  // Handle Zod Validation Errors (if they bypass validation middleware somehow)
  if (err.name === 'ZodError') {
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.errors,
    });
    return;
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message || 'Internal Server Error',
  });
};
