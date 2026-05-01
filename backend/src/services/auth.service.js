/**
 * Authentication business logic.
 *
 * Responsibilities:
 *  - Hashing / comparing passwords.
 *  - Creating users.
 *  - Producing JWTs on successful login.
 */
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { sign } = require('../utils/jwt');
const { sanitizeUser } = require('../utils/sanitize');

const register = async ({ email, password, name, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const hashed = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  // NOTE: Self-service ADMIN creation is disabled. Admins must be provisioned
  //       by an existing admin (see admin controller) or via seed.
  const effectiveRole = role === 'ADMIN' ? 'USER' : role || 'USER';

  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: effectiveRole },
  });

  const token = sign({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const token = sign({ id: user.id, role: user.role });
  return { user: sanitizeUser(user), token };
};

const getMe = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
};

module.exports = { register, login, getMe };
