import { z } from 'zod';

// Helper to preprocess empty strings or whitespace to null
const optionalNullableString = (maxLength?: number) => {
  let schema = z.string().trim();
  if (maxLength) {
    schema = schema.max(maxLength, { message: `Cannot exceed ${maxLength} characters.` });
  }
  return z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null || (typeof val === 'string' && val.trim() === '')) return null;
    return val;
  }, schema.nullable().optional());
};

const optionalNullableEmail = () => {
  return z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null || (typeof val === 'string' && val.trim() === '')) return null;
    return val;
  }, z.string().trim().email({ message: 'Must be a valid email address.' }).nullable().optional());
};

const optionalNullablePhone = () => {
  return z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null || (typeof val === 'string' && val.trim() === '')) return null;
    return val;
  }, z.string().trim().min(7, { message: 'Phone number must be at least 7 characters.' }).max(35, { message: 'Phone number cannot exceed 35 characters.' }).nullable().optional());
};

export const SocialLinksSchema = z.object({
  instagram: optionalNullableString(200),
  facebook: optionalNullableString(200),
  linkedin: optionalNullableString(200),
  twitter: optionalNullableString(200),
}).optional().nullable();

export const UpdateBusinessSettingsSchema = z.object({
  businessName: z.string().trim().min(1, { message: 'Business name cannot be empty.' }).max(150).optional(),
  tagline: optionalNullableString(200),
  shortDescription: optionalNullableString(500),
  description: optionalNullableString(500), // Alias for shortDescription
  fullDescription: optionalNullableString(5000),
  logoUrl: optionalNullableString(500), // Accept relative path or URL
  email: optionalNullableEmail(),
  publicEmail: optionalNullableEmail(), // Alias for email
  phone: optionalNullablePhone(),
  publicPhone: optionalNullablePhone(), // Alias for phone
  whatsAppNumber: optionalNullablePhone(),
  publicWhatsApp: optionalNullablePhone(), // Alias for whatsAppNumber
  address: optionalNullableString(300),
  businessAddress: optionalNullableString(300), // Alias for address
  businessHours: z.any().optional().nullable(),
  socialLinks: SocialLinksSchema,
  metaTitle: optionalNullableString(150),
  metaDescription: optionalNullableString(300),
  quoteInstructions: optionalNullableString(2000),
  publicAnnouncement: optionalNullableString(1000),
}).strict(); // Disallow mass assignment of unapproved fields

export type UpdateBusinessSettingsInput = z.infer<typeof UpdateBusinessSettingsSchema>;
