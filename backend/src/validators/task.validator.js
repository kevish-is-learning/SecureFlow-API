const { z } = require('zod');

const idParam = z.object({
  id: z.string().uuid('Invalid task id'),
});

const listQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  completed: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  q: z.string().trim().max(120).optional(),
});

const createTaskSchema = {
  body: z
    .object({
      title: z.string().trim().min(1, 'Title is required').max(120),
      description: z.string().trim().max(2000).optional(),
      completed: z.boolean().optional(),
    })
    .strict(),
};

const updateTaskSchema = {
  params: idParam,
  body: z
    .object({
      title: z.string().trim().min(1).max(120).optional(),
      description: z.string().trim().max(2000).optional(),
      completed: z.boolean().optional(),
    })
    .strict()
    .refine((v) => Object.keys(v).length > 0, {
      message: 'At least one field must be provided',
    }),
};

const idParamSchema = { params: idParam };
const listQuerySchema = { query: listQuery };

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  idParamSchema,
  listQuerySchema,
};
