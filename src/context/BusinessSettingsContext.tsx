import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  businessSettingsService, 
  PublicBusinessSettings, 
  FALLBACK_PUBLIC_SETTINGS 
} from '@/services/businessSettingsService';
import { SITE_CONFIG } from '@/config/site';

export interface BusinessSettingsContextValue {
  settings: PublicBusinessSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  // Helper getters for conditional UI rendering (never display unverified placeholders)
  isWhatsAppConfigured: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  hasAddress: boolean;
  hasSocialLinks: boolean;
  formattedHours: string;
}

const BusinessSettingsContext = createContext<BusinessSettingsContextValue | undefined>(undefined);

function formatHoursValue(hours: any): string {
  if (!hours) return '';
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object') {
    if (hours.weekdays && hours.saturday) {
      return `Mon–Fri: ${hours.weekdays} | Sat: ${hours.saturday}`;
    }
    const entries = Object.entries(hours)
      .filter(([_, val]) => Boolean(val))
      .map(([day, val]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${val}`);
    return entries.slice(0, 3).join(', ');
  }
  return '';
}

export const BusinessSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicBusinessSettings>(FALLBACK_PUBLIC_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const syncSiteConfig = useCallback((data: PublicBusinessSettings) => {
    if (data.businessName) SITE_CONFIG.name = data.businessName;
    if (data.tagline) SITE_CONFIG.tagline = data.tagline;
    if (data.phone) SITE_CONFIG.phone = data.phone;
    if (data.whatsAppNumber) SITE_CONFIG.whatsAppNumber = data.whatsAppNumber;
    if (data.email) SITE_CONFIG.email = data.email;
    if (data.address) SITE_CONFIG.address = data.address;
    if (data.businessHours) {
      SITE_CONFIG.businessHours = formatHoursValue(data.businessHours);
    }
  }, []);

  const loadSettings = useCallback(async (force = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await businessSettingsService.getPublicSettings(force);
      setSettings(data);
      syncSiteConfig(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load business settings');
    } finally {
      setIsLoading(false);
    }
  }, [syncSiteConfig]);

  useEffect(() => {
    // Initial fetch
    loadSettings();

    // Subscribe to reactive updates emitted by admin save or background refresh
    const unsubscribe = businessSettingsService.subscribe((updated) => {
      setSettings(updated);
      syncSiteConfig(updated);
    });

    return () => {
      unsubscribe();
    };
  }, [loadSettings, syncSiteConfig]);

  const isWhatsAppConfigured = useMemo(() => {
    const raw = settings.whatsAppNumber || settings.publicWhatsApp || '';
    return raw.replace(/[^0-9]/g, '').length >= 7;
  }, [settings]);

  const hasPhone = useMemo(() => {
    const phone = settings.phone || settings.publicPhone || '';
    return phone.trim().length >= 5;
  }, [settings]);

  const hasEmail = useMemo(() => {
    const email = settings.email || settings.publicEmail || '';
    return email.trim().length > 0 && email.includes('@');
  }, [settings]);

  const hasAddress = useMemo(() => {
    const address = settings.address || settings.businessAddress || '';
    return address.trim().length > 0;
  }, [settings]);

  const hasSocialLinks = useMemo(() => {
    if (!settings.socialLinks) return false;
    return Boolean(
      settings.socialLinks.instagram ||
      settings.socialLinks.facebook ||
      settings.socialLinks.linkedin ||
      settings.socialLinks.twitter
    );
  }, [settings]);

  const formattedHours = useMemo(() => {
    return formatHoursValue(settings.businessHours);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      refreshSettings: () => loadSettings(true),
      isWhatsAppConfigured,
      hasPhone,
      hasEmail,
      hasAddress,
      hasSocialLinks,
      formattedHours,
    }),
    [
      settings,
      isLoading,
      error,
      loadSettings,
      isWhatsAppConfigured,
      hasPhone,
      hasEmail,
      hasAddress,
      hasSocialLinks,
      formattedHours,
    ]
  );

  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  );
};

export const useBusinessSettings = (): BusinessSettingsContextValue => {
  const context = useContext(BusinessSettingsContext);
  if (!context) {
    throw new Error('useBusinessSettings must be used within a BusinessSettingsProvider');
  }
  return context;
};
