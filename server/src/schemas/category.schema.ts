import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createCategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(1, 'Category name cannot be empty')
    .max(100, 'Category name must not exceed 100 characters'),
  slug: z
    .string({ required_error: 'Category slug is required' })
    .trim()
    .min(1, 'Category slug cannot be empty')
    .max(100, 'Category slug must not exceed 100 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and single hyphens'),
  description: z
    .string({ required_error: 'Category description is required' })
    .trim()
    .min(1, 'Category description cannot be empty')
    .max(1000, 'Category description must not exceed 1000 characters'),
  imageUrl: z
    .string()
    .trim()
    .refine((val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'), {
      message: 'Image URL must be a valid HTTP/HTTPS URL or absolute path',
    })
    .optional()
    .nullable(),
  image: z.string().trim().optional().nullable(), // Frontend alias
  displayOrder: z
    .number()
    .int('Display order must be an integer')
    .min(1, 'Display order must be at least 1')
    .default(1)
    .optional(),
  visibility: z
    .enum(['visible', 'hidden', 'VISIBLE', 'HIDDEN'])
    .default('visible')
    .transform((val) => val.toLowerCase() as 'visible' | 'hidden'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
  includeProductCounts: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
  includeHidden: z
    .string()
    .optional()
    .transform((val) => val === 'true' || val === '1'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>;
