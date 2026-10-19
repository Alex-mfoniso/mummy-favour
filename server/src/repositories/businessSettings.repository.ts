import { prisma } from '../lib/prisma.js';
import { BusinessSettings, Prisma } from '@prisma/client';

export const DEFAULT_BUSINESS_SETTINGS: Prisma.BusinessSettingsCreateInput = {
  id: 'default',
  businessName: 'Divine Favour',
  tagline: 'Quality Packaging. Reliable Supply.',
  shortDescription: 'Manufacturer and supplier of high-grade industrial nylon packaging, commercial carrier sacks, and custom poly films.',
  fullDescription: 'Divine Favour provides end-to-end flexible packaging solutions for retailers, industrial processors, wholesalers, and commercial logistics hubs across Nigeria.',
  logoUrl: null,
  email: null,
  phone: null,
  whatsAppNumber: null,
  address: null,
  businessHours: {
    monday: '8:00 AM – 5:00 PM',
    tuesday: '8:00 AM – 5:00 PM',
    wednesday: '8:00 AM – 5:00 PM',
    thursday: '8:00 AM – 5:00 PM',
    friday: '8:00 AM – 5:00 PM',
    saturday: '9:00 AM – 2:00 PM',
    sunday: 'Closed',
  },
  socialLinks: {
    instagram: null,
    facebook: null,
    linkedin: null,
    twitter: null,
  },
  metaTitle: 'Divine Favour | Quality Nylon Packaging & Manufacturing',
  metaDescription: 'Trusted manufacturer of industrial poly films, heavy-duty sacks, and commercial carrier bags.',
  quoteInstructions: 'Provide detailed dimensions, gauge thickness (in microns), and estimated quantity for immediate pricing assessment.',
  publicAnnouncement: null,
};

export class BusinessSettingsRepository {
  /**
   * Retrieves the singleton business settings record.
   * If not yet created, initializes default settings idempotently.
   */
  async getSettings(): Promise<BusinessSettings> {
    const existing = await prisma.businessSettings.findUnique({
      where: { id: 'default' },
    });

    if (existing) {
      return existing;
    }

    // Initialize singleton with predictable defaults
    return prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: DEFAULT_BUSINESS_SETTINGS,
    });
  }

  /**
   * Partially updates the singleton business settings.
   * Preserves omitted fields.
   */
  async updateSettings(data: Prisma.BusinessSettingsUpdateInput): Promise<BusinessSettings> {
    return prisma.businessSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        ...DEFAULT_BUSINESS_SETTINGS,
        ...(data as any),
        id: 'default',
      },
    });
  }
}

export const businessSettingsRepository = new BusinessSettingsRepository();
