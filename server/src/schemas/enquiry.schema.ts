import { z } from 'zod';

// Preprocessor to handle case-insensitivity from frontend
function caseInsensitiveEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess((val) => {
    if (typeof val === 'string') {
      const upper = val.toUpperCase().replace(/-/g, '_');
      return upper;
    }
    return val;
  }, z.enum(values));
}

export const CreateEnquiryItemSchema = z.object({
  productId: z.string().trim().optional(),
  productSlug: z.string().trim().optional(),
  productName: z.string().trim().max(150).optional(),
  requestedProductName: z.string().trim().max(150).optional(),
  quantity: z
    .preprocess((val) => {
      if (val === undefined || val === null || val === '') return undefined;
      if (typeof val === 'string') {
        const parsed = parseInt(val.replace(/,/g, ''), 10);
        return isNaN(parsed) ? val : parsed;
      }
      return val;
    }, z.number().int().positive().max(10000000).optional())
    .optional(),
  unit: z.string().trim().max(50).optional(),
  size: z.string().trim().max(100).optional(),
  gauge: z.string().trim().max(100).optional(),
  color: z.string().trim().max(100).optional(),
  customPrinting: z.string().trim().max(200).optional(),
  specifications: z.record(z.any()).optional(),
});

export const CreateEnquirySchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, { message: 'Customer name must be at least 2 characters.' })
    .max(120, { message: 'Customer name cannot exceed 120 characters.' }),
  businessName: z.string().trim().max(150).optional().nullable(),
  customerPhone: z
    .string()
    .trim()
    .min(7, { message: 'Phone number must be at least 7 digits.' })
    .max(35, { message: 'Phone number cannot exceed 35 characters.' }),
  customerEmail: z
    .preprocess((val) => (val === '' ? undefined : val), z.string().trim().email({ message: 'Invalid email address.' }).optional().nullable()),
  customerType: caseInsensitiveEnum(['INDIVIDUAL', 'RETAILER', 'WHOLESALER', 'COMMERCIAL'] as const),
  enquiryType: caseInsensitiveEnum(['QUOTE_STANDARD', 'QUOTE_CUSTOM', 'CONTACT_GENERAL'] as const),
  subject: z.string().trim().max(200).optional().nullable(),
  customerMessage: z.string().trim().max(3000, { message: 'Message cannot exceed 3000 characters.' }).optional().nullable(),
  source: z.string().trim().max(50).optional().default('WEBSITE'),
  items: z.array(CreateEnquiryItemSchema).max(20, { message: 'Cannot submit more than 20 items in a single enquiry.' }).optional().default([]),
  idempotencyKey: z.string().trim().max(64).optional(),
});

export const AdminUpdateEnquiryStatusSchema = z.object({
  status: caseInsensitiveEnum(['NEW', 'IN_REVIEW', 'CONTACTED', 'QUOTED', 'CLOSED'] as const),
});

export const AdminCreateEnquiryNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Note content cannot be empty.' })
    .max(5000, { message: 'Note content cannot exceed 5000 characters.' }),
});

export const AdminUpdateEnquiryNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Note content cannot be empty.' })
    .max(5000, { message: 'Note content cannot exceed 5000 characters.' }),
});

export const AdminListEnquiriesQuerySchema = z.object({
  page: z
    .preprocess((val) => (val ? parseInt(val as string, 10) : 1), z.number().int().min(1))
    .optional()
    .default(1),
  limit: z
    .preprocess((val) => (val ? parseInt(val as string, 10) : 20), z.number().int().min(1).max(100))
    .optional()
    .default(20),
  status: z.string().trim().optional(),
  type: z.string().trim().optional(),
  search: z.string().trim().optional(),
  startDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
});

export const TrackEnquiryQuerySchema = z.object({
  token: z
    .string()
    .trim()
    .min(32, { message: 'Tracking token is invalid or missing.' })
    .max(128, { message: 'Tracking token format is invalid.' }),
});

export type CreateEnquiryInput = z.infer<typeof CreateEnquirySchema>;
export type CreateEnquiryItemInput = z.infer<typeof CreateEnquiryItemSchema>;
export type AdminUpdateEnquiryStatusInput = z.infer<typeof AdminUpdateEnquiryStatusSchema>;
export type AdminCreateEnquiryNoteInput = z.infer<typeof AdminCreateEnquiryNoteSchema>;
export type AdminUpdateEnquiryNoteInput = z.infer<typeof AdminUpdateEnquiryNoteSchema>;
export type TrackEnquiryQuery = z.infer<typeof TrackEnquiryQuerySchema>;
export type AdminListEnquiriesQuery = z.infer<typeof AdminListEnquiriesQuerySchema>;
