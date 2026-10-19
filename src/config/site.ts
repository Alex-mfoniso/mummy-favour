/**
 * Centralized site-wide configuration and business identity constants for Divine Favour.
 * 
 * NOTE: Commercial channels, verified telephone numbers, and factory addresses
 * are bound strictly through environment variables or verified production inputs
 * to maintain strict accuracy and avoid displaying unverified numbers.
 */

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

export const SITE_CONFIG = {
  name: 'Divine Favour',
  legalName: 'Divine Favour Packaging & Manufacturing',
  tagline: 'Quality Packaging. Reliable Supply.',
  industry: 'Nylon manufacturing and packaging',
  
  // 1. WhatsApp Commercial Enquiry Integration
  // Read from Vite environment variable (set in .env.local or production host)
  whatsAppNumber: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_WHATSAPP_NUMBER) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_WHATSAPP_NUMBER) ||
    ''
  ).trim(),

  // 2. Verified Phone Number
  phone: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_PHONE) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_PHONE) ||
    ''
  ).trim(),

  // 3. Verified Email Address
  email: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_EMAIL) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_EMAIL) ||
    ''
  ).trim(),

  // 4. Verified Physical Location / Factory Address
  address: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_ADDRESS) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_ADDRESS) ||
    ''
  ).trim(),

  // 5. Verified Map URL
  mapUrl: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_MAP_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_MAP_URL) ||
    ''
  ).trim(),

  // 6. Confirmed Business Operating Hours
  businessHours: (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BUSINESS_HOURS) ||
    (typeof process !== 'undefined' && process.env?.VITE_BUSINESS_HOURS) ||
    ''
  ).trim(),

  // 7. Confirmed Social Media Links
  socialLinks: {
    instagram: '',
    facebook: '',
    linkedin: '',
    twitter: '',
  } as SocialMediaLinks,

  // Helper flags for conditional rendering (prevents rendering unverified/fake data)
  get isWhatsAppConfigured(): boolean {
    return this.whatsAppNumber.replace(/[^0-9]/g, '').length >= 7;
  },
  get hasPhone(): boolean {
    return this.phone.length > 0;
  },
  get hasEmail(): boolean {
    return this.email.length > 0;
  },
  get hasAddress(): boolean {
    return this.address.length > 0;
  },
  get hasMapUrl(): boolean {
    return this.mapUrl.length > 0;
  },
  get hasBusinessHours(): boolean {
    return this.businessHours.length > 0;
  },
};
