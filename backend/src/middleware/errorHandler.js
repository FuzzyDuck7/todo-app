import { errorResponse } from '../utils/response.js';

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Endpoint not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND', 404);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 400 ? 'VALIDATION_ERROR' : 'SERVER_ERROR');
  const message = err.message || 'An unexpected internal error occurred';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
    if (statusCode === 500 && err.stack) {
      console.error(err.stack);
    }
  }

  return errorResponse(res, message, code, statusCode, err.details || (process.env.NODE_ENV === 'development' ? err.stack : null));
};
