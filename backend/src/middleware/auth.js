/**
 * Authentication and authorization middleware.
 *
 *  - verifyToken:      extracts and verifies the bearer JWT, attaches req.user.
 *  - authorizeRoles:   restricts access to callers having one of the given roles.
 */
const ApiError = require('../utils/ApiError');
const { verify } = require('../utils/jwt');

const verifyToken = (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    const decoded = verify(token);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    next(err);
  }
};

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient permissions'));
  }
  next();
};

module.exports = { verifyToken, authorizeRoles };
