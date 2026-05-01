/**
 * Task business logic with role-based scoping.
 *
 *  - USER   can only read/write tasks they own.
 *  - ADMIN  can operate on any task regardless of owner.
 *
 * Caching: list and detail reads are cached per-principal when Redis is enabled.
 */
const prisma = require('../config/prisma');
const cache = require('../config/redis');
const ApiError = require('../utils/ApiError');

const ROLES = { USER: 'USER', ADMIN: 'ADMIN' };

const scopeFilter = (actor) =>
  actor.role === ROLES.ADMIN ? {} : { userId: actor.id };

const invalidateTaskCache = async (actorId) => {
  await cache.del(`tasks:list:${actorId}:*`);
  await cache.del('tasks:list:admin:*');
};

const list = async (actor, { page = 1, limit = 20, completed, q }) => {
  const key = `tasks:list:${actor.role === ROLES.ADMIN ? 'admin' : actor.id}:${page}:${limit}:${completed ?? ''}:${q ?? ''}`;

  const cached = await cache.get(key);
  if (cached) return cached;

  const where = {
    ...scopeFilter(actor),
    ...(completed !== undefined ? { completed } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: actor.role === ROLES.ADMIN
        ? { user: { select: { id: true, email: true, name: true, role: true } } }
        : undefined,
    }),
  ]);

  const result = {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };

  await cache.set(key, result);
  return result;
};

const getById = async (actor, id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw ApiError.notFound('Task not found');
  if (actor.role !== ROLES.ADMIN && task.userId !== actor.id) {
    throw ApiError.forbidden('You do not have access to this task');
  }
  return task;
};

const create = async (actor, data) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      completed: data.completed ?? false,
      userId: actor.id,
    },
  });
  await invalidateTaskCache(actor.id);
  return task;
};

const update = async (actor, id, data) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Task not found');
  if (actor.role !== ROLES.ADMIN && existing.userId !== actor.id) {
    throw ApiError.forbidden('You cannot modify this task');
  }

  const task = await prisma.task.update({ where: { id }, data });
  await invalidateTaskCache(existing.userId);
  return task;
};

const remove = async (actor, id) => {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound('Task not found');
  if (actor.role !== ROLES.ADMIN && existing.userId !== actor.id) {
    throw ApiError.forbidden('You cannot delete this task');
  }

  await prisma.task.delete({ where: { id } });
  await invalidateTaskCache(existing.userId);
};

module.exports = { list, getById, create, update, remove };
