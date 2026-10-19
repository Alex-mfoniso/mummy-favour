import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const specificationItemSchema = z.object({
  label: z.string().trim().min(1, 'Specification label cannot be empty'),
  value: z.string().trim().min(1, 'Specification value cannot be empty'),
});

const allowedSortOptions = [
  'featured',
  'name-asc',
  'name-desc',
  'title-asc',
  'title-desc',
  'newest',
  'oldest',
  'createdAt-desc',
  'createdAt-asc',
] as const;

export const createProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Product name is required').max(150, 'Product name must not exceed 150 characters').optional(),
  title: z.string().trim().min(1, 'Product title is required').max(150).optional(),
  slug: z
    .string({ required_error: 'Product slug is required' })
    .trim()
    .min(1, 'Product slug cannot be empty')
    .max(150, 'Product slug must not exceed 150 characters')
    .regex(slugRegex, 'Slug must contain only lowercase letters, numbers, and single hyphens'),
  categoryId: z
    .string({ required_error: 'Category ID is required' })
    .trim()
    .min(1, 'Category ID is required'),
  shortDescription: z.string().trim().min(1, 'Short description cannot be empty').max(500).optional(),
  tagline: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').max(5000).optional(),
  fullDescription: z.string().trim().min(1).max(5000).optional(),
  mainImageUrl: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  galleryImageUrls: z.array(z.string().trim()).optional().default([]),
  gallery: z.array(z.string().trim()).optional(),
  specifications: z.array(specificationItemSchema).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z
    .enum([
      'in-stock',
      'made-to-order',
      'low-stock',
      'custom-order',
      'provisional-sample',
      'IN_STOCK',
      'MADE_TO_ORDER',
      'LOW_STOCK',
      'CUSTOM_ORDER',
      'PROVISIONAL_SAMPLE',
    ])
    .optional()
    .default('in-stock')
    .transform((val) => val.toLowerCase().replace(/_/g, '-') as 'in-stock' | 'made-to-order' | 'low-stock' | 'custom-order' | 'provisional-sample'),
  minOrderQuantity: z.string().trim().optional(),
  materialGrade: z.string().trim().optional(),
  material: z.string().trim().optional(),
  thickness: z.string().trim().optional(),
  dimensions: z.array(z.string().trim()).optional(),
  availableColors: z.array(z.string().trim()).optional(),
  targetAudience: z.array(z.string().trim()).optional(),
  customizationOptions: z.array(z.string().trim()).optional(),
  isProvisional: z.boolean().optional(),
}).refine((data) => data.name || data.title, {
  message: 'Product name or title is required',
  path: ['name'],
}).refine((data) => data.shortDescription || data.tagline, {
  message: 'Short description or tagline is required',
  path: ['shortDescription'],
}).refine((data) => data.description || data.fullDescription, {
  message: 'Full description is required',
  path: ['description'],
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  title: z.string().trim().min(1).max(150).optional(),
  slug: z.string().trim().min(1).max(150).regex(slugRegex).optional(),
  categoryId: z.string().trim().min(1).optional(),
  shortDescription: z.string().trim().min(1).max(500).optional(),
  tagline: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  fullDescription: z.string().trim().min(1).max(5000).optional(),
  mainImageUrl: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  galleryImageUrls: z.array(z.string().trim()).optional(),
  gallery: z.array(z.string().trim()).optional(),
  specifications: z.array(specificationItemSchema).optional(),
  featured: z.boolean().optional(),
  status: z
    .enum([
      'in-stock',
      'made-to-order',
      'low-stock',
      'custom-order',
      'provisional-sample',
      'IN_STOCK',
      'MADE_TO_ORDER',
      'LOW_STOCK',
      'CUSTOM_ORDER',
      'PROVISIONAL_SAMPLE',
    ])
    .optional()
    .transform((val) => val ? (val.toLowerCase().replace(/_/g, '-') as 'in-stock' | 'made-to-order' | 'low-stock' | 'custom-order' | 'provisional-sample') : undefined),
  minOrderQuantity: z.string().trim().optional(),
  materialGrade: z.string().trim().optional(),
  material: z.string().trim().optional(),
  thickness: z.string().trim().optional(),
  dimensions: z.array(z.string().trim()).optional(),
  availableColors: z.array(z.string().trim()).optional(),
  targetAudience: z.array(z.string().trim()).optional(),
  customizationOptions: z.array(z.string().trim()).optional(),
  isProvisional: z.boolean().optional(),
});

export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z
    .string()
    .optional()
    .default('12')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? 12 : Math.min(parsed, 100);
    }),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === 'true' || val === '1';
    }),
  availability: z.string().trim().optional(),
  status: z.string().trim().optional(),
  sort: z
    .enum(allowedSortOptions, {
      errorMap: () => ({
        message: `Sort must be one of: ${allowedSortOptions.join(', ')}`,
      }),
    })
    .optional()
    .default('featured'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
