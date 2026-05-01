/**
 * Generic Zod validation middleware.
 * Accepts a schema shaped like: { body?, params?, query? }
 * and replaces the request segments with parsed (stripped) values.
 */
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, _res, next) => {
  try {
    if (schema.body) req.body = schema.body.parse(req.body);
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    next();
  } catch (err) {
    if (err.name === 'ZodError') {
      const details = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    next(err);
  }
};

module.exports = validate;
