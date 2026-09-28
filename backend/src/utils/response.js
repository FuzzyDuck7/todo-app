/**
 * Standard API Response Utilities
 * Enforces uniform response schema across the entire application
 */

export const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    data,
    message
  };

  if (meta !== undefined) {
    if (meta.pagination) {
      payload.pagination = meta.pagination;
    }
    Object.keys(meta).forEach(key => {
      if (key !== 'pagination') {
        payload[key] = meta[key];
      }
    });
  }

  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, message = 'An unexpected error occurred', code = 'SERVER_ERROR', statusCode = 500, details = null) => {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};
