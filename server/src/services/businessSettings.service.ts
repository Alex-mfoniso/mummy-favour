import { businessSettingsRepository } from '../repositories/businessSettings.repository.js';
import { UpdateBusinessSettingsInput } from '../schemas/businessSettings.schema.js';
import { BusinessSettings, Prisma } from '@prisma/client';

export interface PublicBusinessSettingsResponse {
  businessName: string;
  tagline: string;
  shortDescription: string | null;
  fullDescription: string | null;
  logoUrl: string | null;
  email: string | null;
  publicEmail: string | null;
  phone: string | null;
  publicPhone: string | null;
  whatsAppNumber: string | null;
  publicWhatsApp: string | null;
  address: string | null;
  businessAddress: string | null;
  businessHours: any;
  socialLinks: any;
  metaTitle: string | null;
  metaDescription: string | null;
  quoteInstructions: string | null;
  publicAnnouncement: string | null;
  updatedAt: string;
}

export interface AdminBusinessSettingsResponse extends PublicBusinessSettingsResponse {
  createdAt: string;
}

export class BusinessSettingsService {
  /**
   * Formats a database BusinessSettings entity for public consumption.
   * Excludes any internal IDs, credentials, or internal configuration.
   */
  private formatPublicResponse(settings: BusinessSettings): PublicBusinessSettingsResponse {
    const email = settings.email ?? null;
    const phone = settings.phone ?? null;
    const whatsAppNumber = settings.whatsAppNumber ?? null;
    const address = settings.address ?? null;
    const shortDesc = settings.shortDescription ?? settings.businessDescription ?? null;

    return {
      businessName: settings.businessName,
      tagline: settings.tagline,
      shortDescription: shortDesc,
      fullDescription: settings.fullDescription ?? null,
      logoUrl: settings.logoUrl ?? null,
      email,
      publicEmail: email,
      phone,
      publicPhone: phone,
      whatsAppNumber,
      publicWhatsApp: whatsAppNumber,
      address,
      businessAddress: address,
      businessHours: settings.businessHours ?? null,
      socialLinks: settings.socialLinks ?? null,
      metaTitle: settings.metaTitle ?? null,
      metaDescription: settings.metaDescription ?? null,
      quoteInstructions: settings.quoteInstructions ?? null,
      publicAnnouncement: settings.publicAnnouncement ?? null,
      updatedAt: settings.updatedAt.toISOString(),
    };
  }

  /**
   * Retrieves public-facing business settings.
   */
  async getPublicSettings(): Promise<PublicBusinessSettingsResponse> {
    const settings = await businessSettingsRepository.getSettings();
    return this.formatPublicResponse(settings);
  }

  /**
   * Retrieves business settings for authenticated administrator.
   */
  async getAdminSettings(): Promise<AdminBusinessSettingsResponse> {
    const settings = await businessSettingsRepository.getSettings();
    const publicData = this.formatPublicResponse(settings);
    return {
      ...publicData,
      createdAt: settings.createdAt.toISOString(),
    };
  }

  /**
   * Updates business settings with validated partial data.
   * Preserves omitted fields.
   */
  async updateAdminSettings(input: UpdateBusinessSettingsInput): Promise<AdminBusinessSettingsResponse> {
    const updateData: Prisma.BusinessSettingsUpdateInput = {};

    if (input.businessName !== undefined) {
      updateData.businessName = input.businessName;
    }

    if (input.tagline !== undefined) {
      updateData.tagline = input.tagline ?? '';
    }

    // Handle shortDescription or description alias
    if (input.shortDescription !== undefined) {
      updateData.shortDescription = input.shortDescription;
      updateData.businessDescription = input.shortDescription;
    } else if (input.description !== undefined) {
      updateData.shortDescription = input.description;
      updateData.businessDescription = input.description;
    }

    if (input.fullDescription !== undefined) {
      updateData.fullDescription = input.fullDescription;
    }

    if (input.logoUrl !== undefined) {
      updateData.logoUrl = input.logoUrl;
    }

    // Handle email or publicEmail alias
    if (input.email !== undefined) {
      updateData.email = input.email;
    } else if (input.publicEmail !== undefined) {
      updateData.email = input.publicEmail;
    }

    // Handle phone or publicPhone alias
    if (input.phone !== undefined) {
      updateData.phone = input.phone;
    } else if (input.publicPhone !== undefined) {
      updateData.phone = input.publicPhone;
    }

    // Handle whatsAppNumber or publicWhatsApp alias
    if (input.whatsAppNumber !== undefined) {
      updateData.whatsAppNumber = input.whatsAppNumber;
    } else if (input.publicWhatsApp !== undefined) {
      updateData.whatsAppNumber = input.publicWhatsApp;
    }

    // Handle address or businessAddress alias
    if (input.address !== undefined) {
      updateData.address = input.address;
    } else if (input.businessAddress !== undefined) {
      updateData.address = input.businessAddress;
    }

    if (input.businessHours !== undefined) {
      updateData.businessHours = input.businessHours;
    }

    if (input.socialLinks !== undefined) {
      updateData.socialLinks = input.socialLinks as any;
    }

    if (input.metaTitle !== undefined) {
      updateData.metaTitle = input.metaTitle;
    }

    if (input.metaDescription !== undefined) {
      updateData.metaDescription = input.metaDescription;
    }

    if (input.quoteInstructions !== undefined) {
      updateData.quoteInstructions = input.quoteInstructions;
    }

    if (input.publicAnnouncement !== undefined) {
      updateData.publicAnnouncement = input.publicAnnouncement;
    }

    const updated = await businessSettingsRepository.updateSettings(updateData);
    return {
      ...this.formatPublicResponse(updated),
      createdAt: updated.createdAt.toISOString(),
    };
  }
}

export const businessSettingsService = new BusinessSettingsService();
