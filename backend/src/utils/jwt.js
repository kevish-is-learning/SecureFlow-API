/**
 * Thin wrapper around jsonwebtoken using the app's JWT_SECRET/EXPIRES_IN.
 * Payload format: { id, role }.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const sign = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const verify = (token) => jwt.verify(token, env.JWT_SECRET);

module.exports = { sign, verify };
