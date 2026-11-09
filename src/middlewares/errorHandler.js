// src/middlewares/errorHandler.js
import { ZodError } from 'zod';
import config from '../config/env.js';
import logger from '../utils/logger.js';

function formatZodError(zodError) {
  return zodError.errors.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function globalErrorHandler(err, req, res, next) {
  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
    },
    'Request error'
  );

  // Handle CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Handle Zod validation errors => 400
  if (err instanceof ZodError) {
    const errors = formatZodError(err);

    return res.status(400).json({
      status: 'fail',
      message: 'Invalid request data',
      errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (config.env === 'development') {
    return res.status(statusCode).json({
      status,
      message: err.message,
      error: err,
      stack: err.stack,
      ...(err.details && { details: err.details }),
    });
  }

  if (!err.isOperational) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  return res.status(statusCode).json({
    status,
    message: err.message,
    ...(err.details && { details: err.details }),
  });
}

export default globalErrorHandler;