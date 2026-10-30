import { apiClient, ApiClientError } from './apiClient';
import { AdminBusinessSettings } from '@/types/admin';
import { SITE_CONFIG } from '@/config/site';

export interface PublicBusinessSettings {
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
  socialLinks: {
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
  } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  quoteInstructions: string | null;
  publicAnnouncement: string | null;
  updatedAt?: string;
}

// Default fallback matching stable brand identity
export const FALLBACK_PUBLIC_SETTINGS: PublicBusinessSettings = {
  businessName: SITE_CONFIG.name,
  tagline: SITE_CONFIG.tagline,
  shortDescription: 'Manufacturer and supplier of durable nylon packaging films, commercial sacks, and custom retail bags engineered for reliability, barrier protection, and high-tensile strength.',
  fullDescription: 'Divine Favour provides end-to-end flexible packaging solutions for retailers, industrial processors, wholesalers, and commercial logistics hubs across Nigeria.',
  logoUrl: null,
  email: SITE_CONFIG.email || null,
  publicEmail: SITE_CONFIG.email || null,
  phone: SITE_CONFIG.phone || '+234 813 472 6113',
  publicPhone: SITE_CONFIG.phone || '+234 813 472 6113',
  whatsAppNumber: SITE_CONFIG.whatsAppNumber || '2348134726113',
  publicWhatsApp: SITE_CONFIG.whatsAppNumber || '2348134726113',
  address: SITE_CONFIG.address || null,
  businessAddress: SITE_CONFIG.address || null,
  businessHours: {
    weekdays: '8:00 AM – 5:00 PM (WAT)',
    saturday: '9:00 AM – 2:00 PM (WAT)',
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

type SettingsChangeListener = (settings: PublicBusinessSettings) => void;

class BusinessSettingsService {
  private cachedSettings: PublicBusinessSettings | null = null;
  private listeners: Set<SettingsChangeListener> = new Set();
  private fetchPromise: Promise<PublicBusinessSettings> | null = null;

  /**
   * Subscribe to business settings updates.
   */
  public subscribe(listener: SettingsChangeListener): () => void {
    this.listeners.add(listener);
    if (this.cachedSettings) {
      listener(this.cachedSettings);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(settings: PublicBusinessSettings) {
    this.cachedSettings = settings;
    this.listeners.forEach((listener) => {
      try {
        listener(settings);
      } catch (err) {
        console.error('[BusinessSettingsService] Listener error:', err);
      }
    });
  }

  /**
   * Fetch public business settings.
   * Cached in-memory to prevent duplicate requests across components.
   */
  public async getPublicSettings(forceRefresh = false): Promise<PublicBusinessSettings> {
    if (!forceRefresh && this.cachedSettings) {
      return this.cachedSettings;
    }

    if (this.fetchPromise && !forceRefresh) {
      return this.fetchPromise;
    }

    this.fetchPromise = (async () => {
      try {
        const res = await apiClient.get<PublicBusinessSettings>('/business-settings');
        const data = res.data || FALLBACK_PUBLIC_SETTINGS;
        this.notifyListeners(data);
        return data;
      } catch (err) {
        console.warn('[BusinessSettingsService] Unable to reach backend, using brand fallback:', err);
        return this.cachedSettings || FALLBACK_PUBLIC_SETTINGS;
      } finally {
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  /**
   * Fetch settings for authenticated administrator console.
   */
  public async getAdminBusinessSettings(): Promise<AdminBusinessSettings> {
    try {
      const res = await apiClient.get<AdminBusinessSettings>('/admin/business-settings');
      return res.data;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  /**
   * Partially update settings through authenticated administrator endpoint.
   * Broadcasts updated settings to all public UI listeners.
   */
  public async updateAdminBusinessSettings(
    updates: Partial<AdminBusinessSettings>
  ): Promise<AdminBusinessSettings> {
    try {
      const res = await apiClient.patch<AdminBusinessSettings>('/admin/business-settings', updates);
      const updated = res.data;

      // Update in-memory cache and notify listeners
      const publicEquivalent: PublicBusinessSettings = {
        businessName: updated.businessName,
        tagline: updated.tagline,
        shortDescription: updated.shortDescription ?? null,
        fullDescription: updated.fullDescription ?? null,
        logoUrl: updated.logoUrl ?? null,
        email: updated.email ?? null,
        publicEmail: updated.email ?? null,
        phone: updated.phone ?? null,
        publicPhone: updated.phone ?? null,
        whatsAppNumber: updated.whatsAppNumber ?? null,
        publicWhatsApp: updated.whatsAppNumber ?? null,
        address: updated.address ?? null,
        businessAddress: updated.address ?? null,
        businessHours: updated.businessHours ?? null,
        socialLinks: updated.socialLinks ?? null,
        metaTitle: updated.metaTitle ?? null,
        metaDescription: updated.metaDescription ?? null,
        quoteInstructions: updated.quoteInstructions ?? null,
        publicAnnouncement: updated.publicAnnouncement ?? null,
        updatedAt: updated.updatedAt,
      };

      this.notifyListeners(publicEquivalent);
      return updated;
    } catch (err) {
      if (err instanceof ApiClientError) {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  /**
   * Broadcast local / fallback update immediately to reactive frontend subscribers.
   */
  public notifyLocalUpdate(updated: Partial<AdminBusinessSettings>): void {
    const current = this.cachedSettings || FALLBACK_PUBLIC_SETTINGS;
    const merged: PublicBusinessSettings = {
      ...current,
      businessName: updated.businessName || current.businessName,
      tagline: updated.tagline || current.tagline,
      shortDescription: updated.shortDescription !== undefined ? updated.shortDescription : current.shortDescription,
      fullDescription: updated.fullDescription !== undefined ? updated.fullDescription : current.fullDescription,
      logoUrl: updated.logoUrl !== undefined ? updated.logoUrl : current.logoUrl,
      email: updated.email !== undefined ? updated.email : current.email,
      publicEmail: updated.email !== undefined ? updated.email : current.publicEmail,
      phone: updated.phone !== undefined ? updated.phone : current.phone,
      publicPhone: updated.phone !== undefined ? updated.phone : current.publicPhone,
      whatsAppNumber: updated.whatsAppNumber !== undefined ? updated.whatsAppNumber : current.whatsAppNumber,
      publicWhatsApp: updated.whatsAppNumber !== undefined ? updated.whatsAppNumber : current.publicWhatsApp,
      address: updated.address !== undefined ? updated.address : current.address,
      businessAddress: updated.address !== undefined ? updated.address : current.businessAddress,
      businessHours: updated.businessHours !== undefined ? updated.businessHours : current.businessHours,
      socialLinks: updated.socialLinks !== undefined ? (updated.socialLinks as any) : current.socialLinks,
      metaTitle: updated.metaTitle !== undefined ? updated.metaTitle : current.metaTitle,
      metaDescription: updated.metaDescription !== undefined ? updated.metaDescription : current.metaDescription,
      quoteInstructions: updated.quoteInstructions !== undefined ? updated.quoteInstructions : current.quoteInstructions,
      publicAnnouncement: updated.publicAnnouncement !== undefined ? updated.publicAnnouncement : current.publicAnnouncement,
      updatedAt: new Date().toISOString(),
    };
    this.notifyListeners(merged);
  }
}

export const businessSettingsService = new BusinessSettingsService();
