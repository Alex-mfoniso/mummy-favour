import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Phone, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Share2,
  Globe,
  Clock,
  Megaphone,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { 
  getBusinessSettingsAsync, 
  updateBusinessSettingsAsync 
} from '@/services/adminService';
import { AdminBusinessSettings } from '@/types/admin';

interface FormState {
  businessName: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  whatsAppNumber: string;
  email: string;
  address: string;
  logoUrl: string;
  metaTitle: string;
  metaDescription: string;
  quoteInstructions: string;
  publicAnnouncement: string;
  primaryColor: string;
  footerDescription: string;
  socialInstagram: string;
  socialFacebook: string;
  socialLinkedin: string;
  socialTwitter: string;
  businessHoursWeekdays: string;
  businessHoursSaturday: string;
  businessHoursSunday: string;
}

const emptyFormState: FormState = {
  businessName: 'Divine Favour',
  tagline: 'Quality Packaging. Reliable Supply.',
  shortDescription: '',
  fullDescription: '',
  phone: '',
  whatsAppNumber: '',
  email: '',
  address: '',
  logoUrl: '',
  metaTitle: '',
  metaDescription: '',
  quoteInstructions: '',
  publicAnnouncement: '',
  primaryColor: '#246B45',
  footerDescription: '',
  socialInstagram: '',
  socialFacebook: '',
  socialLinkedin: '',
  socialTwitter: '',
  businessHoursWeekdays: '8:00 AM – 5:00 PM (WAT)',
  businessHoursSaturday: '9:00 AM – 2:00 PM (WAT)',
  businessHoursSunday: 'Closed',
};

function mapSettingsToForm(settings: AdminBusinessSettings): FormState {
  const social = settings.socialLinks || {};
  let weekdays = '8:00 AM – 5:00 PM (WAT)';
  let saturday = '9:00 AM – 2:00 PM (WAT)';
  let sunday = 'Closed';

  if (settings.businessHours) {
    if (typeof settings.businessHours === 'object') {
      weekdays = settings.businessHours.weekdays || settings.businessHours.monday || weekdays;
      saturday = settings.businessHours.saturday || saturday;
      sunday = settings.businessHours.sunday || sunday;
    } else if (typeof settings.businessHours === 'string') {
      weekdays = settings.businessHours;
    }
  }

  return {
    businessName: settings.businessName || 'Divine Favour',
    tagline: settings.tagline || 'Quality Packaging. Reliable Supply.',
    shortDescription: settings.shortDescription || settings.description || '',
    fullDescription: settings.fullDescription || '',
    phone: settings.phone || '',
    whatsAppNumber: settings.whatsAppNumber || '',
    email: settings.email || '',
    address: settings.address || '',
    logoUrl: settings.logoUrl || '',
    metaTitle: settings.metaTitle || '',
    metaDescription: settings.metaDescription || '',
    quoteInstructions: settings.quoteInstructions || '',
    publicAnnouncement: settings.publicAnnouncement || '',
    primaryColor: settings.primaryColor || '#246B45',
    footerDescription: settings.footerDescription || '',
    socialInstagram: social.instagram || '',
    socialFacebook: social.facebook || '',
    socialLinkedin: social.linkedin || '',
    socialTwitter: social.twitter || '',
    businessHoursWeekdays: weekdays,
    businessHoursSaturday: saturday,
    businessHoursSunday: sunday,
  };
}

export const AdminBusinessSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(emptyFormState);
  const [initialData, setInitialData] = useState<FormState>(emptyFormState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = 'Business Settings | Divine Favour Internal Console';
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await getBusinessSettingsAsync();
      const mapped = mapSettingsToForm(data);
      setFormData(mapped);
      setInitialData(mapped);
    } catch (err: any) {
      setFetchError(err?.message || 'Failed to fetch business settings from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required.';
    }
    if (!formData.tagline.trim()) {
      newErrors.tagline = 'Company tagline is required.';
    }
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please provide a valid email format (e.g. info@company.com).';
      }
    }
    if (formData.phone.trim() && formData.phone.trim().length < 7) {
      newErrors.phone = 'Phone number must have at least 7 characters.';
    }
    if (formData.whatsAppNumber.trim() && formData.whatsAppNumber.replace(/[^0-9]/g, '').length < 7) {
      newErrors.whatsAppNumber = 'WhatsApp number must have at least 7 digits including country code.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const payload: Partial<AdminBusinessSettings> = {
        businessName: formData.businessName.trim(),
        tagline: formData.tagline.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        description: formData.shortDescription.trim() || null,
        fullDescription: formData.fullDescription.trim() || null,
        logoUrl: formData.logoUrl.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        whatsAppNumber: formData.whatsAppNumber.trim() || null,
        address: formData.address.trim() || null,
        metaTitle: formData.metaTitle.trim() || null,
        metaDescription: formData.metaDescription.trim() || null,
        quoteInstructions: formData.quoteInstructions.trim() || null,
        publicAnnouncement: formData.publicAnnouncement.trim() || null,
        socialLinks: {
          instagram: formData.socialInstagram.trim() || null,
          facebook: formData.socialFacebook.trim() || null,
          linkedin: formData.socialLinkedin.trim() || null,
          twitter: formData.socialTwitter.trim() || null,
        },
        businessHours: {
          weekdays: formData.businessHoursWeekdays.trim(),
          saturday: formData.businessHoursSaturday.trim(),
          sunday: formData.businessHoursSunday.trim(),
        },
      };

      const saved = await updateBusinessSettingsAsync(payload);
      const mapped = mapSettingsToForm(saved);
      setInitialData(mapped);
      setFormData(mapped);
      setSuccessNotice('Business settings successfully saved and persisted to database.');
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save business settings. Please check your inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setErrors({});
    setSaveError(null);
    setSuccessNotice('All modifications reverted to current saved values.');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#246B45] animate-spin" />
        <p className="text-sm font-medium text-[#252A27]">Loading business settings from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="border-b border-[#E6E4DD] pb-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#246B45]">
          CONFIGURATION & PRESENTATION
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
              Business Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#5C635F] mt-1">
              Manage public brand identity, official communication channels, factory address, and storefront metadata.
            </p>
          </div>
          {isDirty && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 self-start sm:self-auto">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-900 block">Unable to reach settings API</span>
            <p className="leading-relaxed">{fetchError}</p>
            <Button variant="outline" size="sm" onClick={loadSettings} className="mt-2 text-xs">
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Save Error Banner */}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-900 block">Update Failed</span>
            <p className="leading-relaxed">{saveError}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successNotice && (
        <div className="p-4 bg-[#EAF3ED] border border-[#BADBC5] rounded-md text-xs text-[#1D5838] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
          <span className="font-medium">{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* =========================================================================
            1. BUSINESS IDENTITY
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Building2 className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Business Identity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              required
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              error={errors.businessName}
              helperText="Official company name displayed across header and documents."
            />

            <Input
              label="Official Tagline"
              required
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              error={errors.tagline}
              helperText="e.g. Quality Packaging. Reliable Supply."
            />

            <div className="sm:col-span-2">
              <Textarea
                label="Short Business Summary"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => handleChange('shortDescription', e.target.value)}
                helperText="Brief summary used in footer, hero sections, and preview metadata."
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Full Business Description"
                rows={4}
                value={formData.fullDescription}
                onChange={(e) => handleChange('fullDescription', e.target.value)}
                helperText="Comprehensive corporate overview displayed on the About page."
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Logo Image URL (Optional)"
                placeholder="https://... or relative path"
                value={formData.logoUrl}
                onChange={(e) => handleChange('logoUrl', e.target.value)}
                helperText="Leave empty to use default SVG wordmark logo."
                leftIcon={<ImageIcon className="w-4 h-4 text-[#88918C]" />}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. PUBLIC CONTACT INFORMATION
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Phone className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Public Contact Channels
            </h2>
          </div>

          <p className="text-xs text-[#88918C]">
            Leave empty if unverified. The public website gracefully hides unconfigured contact methods to protect customer experience.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Phone Line"
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              helperText="Direct voice telephone line for customer enquiries."
            />

            <Input
              label="WhatsApp Commercial Number"
              placeholder="+234 800 000 0000"
              value={formData.whatsAppNumber}
              onChange={(e) => handleChange('whatsAppNumber', e.target.value)}
              error={errors.whatsAppNumber}
              helperText="International format for direct quotation consultation."
            />

            <div className="sm:col-span-2">
              <Input
                label="Official Email Address"
                type="email"
                placeholder="info@divinefavour.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
                helperText="Inbound email address for order notifications and quotes."
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. PHYSICAL LOCATION & OPERATING HOURS
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Clock className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Facility Location & Business Hours
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Factory & Commercial Depot Address"
              placeholder="e.g. Industrial Layout, Onitsha, Anambra State, Nigeria"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              helperText="Physical facility location for commercial pickup and inspections."
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Input
                label="Monday – Friday Hours"
                value={formData.businessHoursWeekdays}
                onChange={(e) => handleChange('businessHoursWeekdays', e.target.value)}
                placeholder="8:00 AM – 5:00 PM (WAT)"
              />
              <Input
                label="Saturday Hours"
                value={formData.businessHoursSaturday}
                onChange={(e) => handleChange('businessHoursSaturday', e.target.value)}
                placeholder="9:00 AM – 2:00 PM (WAT)"
              />
              <Input
                label="Sunday Hours"
                value={formData.businessHoursSunday}
                onChange={(e) => handleChange('businessHoursSunday', e.target.value)}
                placeholder="Closed"
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. SOCIAL MEDIA CHANNELS
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Share2 className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Social Media Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instagram Profile"
              placeholder="https://instagram.com/divinefavour"
              value={formData.socialInstagram}
              onChange={(e) => handleChange('socialInstagram', e.target.value)}
            />
            <Input
              label="Facebook Page"
              placeholder="https://facebook.com/divinefavour"
              value={formData.socialFacebook}
              onChange={(e) => handleChange('socialFacebook', e.target.value)}
            />
            <Input
              label="LinkedIn Company"
              placeholder="https://linkedin.com/company/divinefavour"
              value={formData.socialLinkedin}
              onChange={(e) => handleChange('socialLinkedin', e.target.value)}
            />
            <Input
              label="Twitter / X Profile"
              placeholder="https://x.com/divinefavour"
              value={formData.socialTwitter}
              onChange={(e) => handleChange('socialTwitter', e.target.value)}
            />
          </div>
        </div>

        {/* =========================================================================
            5. WEBSITE METADATA (SEO)
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Globe className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Storefront Metadata & SEO
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Default Meta Title"
              placeholder="Divine Favour | Quality Nylon Packaging & Manufacturing"
              value={formData.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              helperText="Appears on search engine result pages and browser tab titles."
            />

            <Textarea
              label="Default Meta Description"
              rows={2}
              placeholder="Manufacturer of industrial poly films, heavy-duty sacks, and commercial carrier bags."
              value={formData.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              helperText="Concise summary for search engine indexers (recommended: 150–160 chars)."
            />
          </div>
        </div>

        {/* =========================================================================
            6. PUBLIC ANNOUNCEMENT & QUOTE INSTRUCTIONS
            ========================================================================= */}
        <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4">
          <div className="border-b border-[#E6E4DD] pb-3 flex items-center gap-2 text-[#246B45]">
            <Megaphone className="w-4 h-4" />
            <h2 className="text-sm font-bold text-[#252A27]">
              Customer Notices & Instructions
            </h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Public Announcement Banner (Optional)"
              placeholder="e.g. Factory maintenance scheduled for Friday; early pickups encouraged."
              value={formData.publicAnnouncement}
              onChange={(e) => handleChange('publicAnnouncement', e.target.value)}
              helperText="Shown at the top of the storefront when set. Leave empty to hide banner."
            />

            <Textarea
              label="Quote Request Instructions"
              rows={3}
              placeholder="Provide detailed dimensions, gauge thickness (in microns), and estimated quantity for immediate pricing assessment."
              value={formData.quoteInstructions}
              onChange={(e) => handleChange('quoteInstructions', e.target.value)}
              helperText="Displayed to customers above the quotation submission form."
            />
          </div>
        </div>

        {/* =========================================================================
            SAVE & CANCEL ACTIONS
            ========================================================================= */}
        <div className="p-4 bg-white border border-[#D8D5CB] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-md z-10">
          <div className="text-xs text-[#5C635F]">
            {isDirty ? (
              <span className="text-amber-700 font-medium">You have unsaved changes.</span>
            ) : (
              <span>All settings are synchronized with the database.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving || !isDirty}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              Revert Changes
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving || !isDirty}
              leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial"
            >
              {isSaving ? 'Saving to Database...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
