const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const registerSchema = {
  body: z
    .object({
      email: z.string().email('Invalid email').max(255).trim().toLowerCase(),
      password: passwordSchema,
      name: z.string().trim().min(1).max(80).optional(),
      role: z.enum(['USER', 'ADMIN']).optional(),
    })
    .strict(),
};

const loginSchema = {
  body: z
    .object({
      email: z.string().email('Invalid email').trim().toLowerCase(),
      password: z.string().min(1, 'Password is required'),
    })
    .strict(),
};

module.exports = { registerSchema, loginSchema };
