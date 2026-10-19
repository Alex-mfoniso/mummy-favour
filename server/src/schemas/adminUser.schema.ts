import { z } from 'zod';

export const createAdminUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters'),
  role: z.enum(['ADMIN', 'STAFF', 'SUPER_ADMIN'], {
    errorMap: () => ({ message: 'Role must be ADMIN or STAFF' }),
  }),
});

export const updateAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(255).optional(),
  role: z.enum(['ADMIN', 'STAFF', 'SUPER_ADMIN']).optional(),
});

export const updateAdminUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status is required' }),
});

export const resetAdminUserPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters'),
});

export const listAdminUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  role: z.string().trim().optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.string().trim().optional(),
  actorId: z.string().trim().optional(),
});
