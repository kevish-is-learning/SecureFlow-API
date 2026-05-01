/**
 * Helpers to emit a consistent response shape across all endpoints.
 * Format: { success, data, message }
 */
const success = (res, { statusCode = 200, data = null, message = 'OK' } = {}) => {
  return res.status(statusCode).json({ success: true, data, message });
};

const fail = (res, { statusCode = 400, message = 'Request failed', details = null } = {}) => {
  return res.status(statusCode).json({ success: false, data: null, message, details });
};

module.exports = { success, fail };
