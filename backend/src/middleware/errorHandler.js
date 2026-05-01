/**
 * Centralized error handler. Maps known error types to consistent responses
 * and hides internal details in production.
 */
const { Prisma } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const { fail } = require('../utils/apiResponse');
const logger = require('../config/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `Unique constraint failed on ${err.meta?.target?.join?.(', ') || 'field'}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid database query';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    status: statusCode,
    message: err.message,
  };

  if (statusCode >= 500) {
    logger.error(err.stack || err.message, logPayload);
  } else {
    logger.warn(err.message, logPayload);
  }

  return fail(res, {
    statusCode,
    message,
    details: env.NODE_ENV === 'production' && statusCode >= 500 ? null : details,
  });
};

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

module.exports = { errorHandler, notFoundHandler };
