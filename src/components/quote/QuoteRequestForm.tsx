import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Phone,
  Mail,
  User,
  Building,
  Sliders,
  Package,
  Info,
  Copy,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { Product, QuoteFormState, QuoteFormErrors, CustomerType, QuoteMode } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { QuoteProductSelector } from './QuoteProductSelector';
import { WhatsAppNotice } from './WhatsAppNotice';
import { 
  generateQuotationMessage, 
  generateWhatsAppUrl, 
  isWhatsAppConfigured,
  formatPackagingTypeLabel
} from '@/lib/whatsapp';
import { enquiryService, PublicEnquiryConfirmation } from '@/services/enquiryService';

export interface QuoteRequestFormProps {
  products: Product[];
  initialProductSlug?: string;
  initialMode?: QuoteMode;
  unknownSlugAttempt?: string | null;
  className?: string;
}

export const QuoteRequestForm: React.FC<QuoteRequestFormProps> = ({
  products,
  initialProductSlug = '',
  initialMode = 'standard',
  unknownSlugAttempt = null,
  className = '',
}) => {
  const navigate = useNavigate();
  const [copiedRef, setCopiedRef] = useState(false);

  // Mode: 'standard' or 'custom'
  const [mode, setMode] = useState<QuoteMode>(initialMode);

  // Form input state
  const [formData, setFormData] = useState<QuoteFormState>({
    mode: initialMode,
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    customerType: '',
    productSlug: initialProductSlug,
    customPackagingType: 'carrier-bags',
    intendedUse: '',
    quantity: '',
    unit: 'pieces',
    preferredSize: '',
    preferredThickness: '',
    preferredColor: '',
    customPrinting: 'no',
    additionalRequirements: '',
  });

  // Validation errors
  const [errors, setErrors] = useState<QuoteFormErrors>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<PublicEnquiryConfirmation | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitted-success' | 'submitted-unconfigured'>('idle');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const whatsAppReady = isWhatsAppConfigured();
  const selectedProduct = products.find((p) => p.slug === formData.productSlug);

  // Handle mode toggle
  const handleModeChange = (newMode: QuoteMode) => {
    setMode(newMode);
    setFormData((prev) => ({ ...prev, mode: newMode }));
    // Clear product-specific error when switching modes
    setErrors((prev) => ({
      ...prev,
      productSlug: undefined,
      customPackagingType: undefined,
    }));
  };

  // Field change handlers
  const handleTextChange = (field: keyof QuoteFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field on typing
    if (errors[field as keyof QuoteFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Comprehensive Client-Side Form Validation
  const validate = (): boolean => {
    const newErrors: QuoteFormErrors = {};

    // 1. Full name: required
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    // 2. Phone number: required, at least 7 digits
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for quote communication.';
    } else if (cleanPhone.length < 7) {
      newErrors.phone = 'Please provide a valid phone number (minimum 7 digits).';
    }

    // 3. Customer type: required
    if (!formData.customerType) {
      newErrors.customerType = 'Please select your customer / business category.';
    }

    // 4. Product or packaging type selection based on mode
    if (mode === 'standard') {
      if (!formData.productSlug) {
        newErrors.productSlug = 'Please select a packaging product of interest.';
      }
    } else {
      if (!formData.customPackagingType) {
        newErrors.customPackagingType = 'Please select a packaging category.';
      }
    }

    // 5. Quantity: optional, but if entered must be positive number
    if (formData.quantity.trim()) {
      const num = Number(formData.quantity.replace(/,/g, ''));
      if (isNaN(num) || num <= 0) {
        newErrors.quantity = 'Quantity must be a positive number greater than zero.';
      }
    }

    // 6. Email: optional, but if entered must be valid format
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const items = mode === 'standard' ? [
        {
          productSlug: formData.productSlug,
          productName: selectedProduct?.title,
          quantity: formData.quantity ? Number(formData.quantity.replace(/,/g, '')) : undefined,
          unit: formData.unit,
          size: formData.preferredSize || undefined,
          gauge: formData.preferredThickness || undefined,
          color: formData.preferredColor || undefined,
          customPrinting: formData.customPrinting,
          specifications: formData.intendedUse ? { intendedUse: formData.intendedUse } : undefined,
        }
      ] : [
        {
          productName: formatPackagingTypeLabel(formData.customPackagingType),
          quantity: formData.quantity ? Number(formData.quantity.replace(/,/g, '')) : undefined,
          unit: formData.unit,
          size: formData.preferredSize || undefined,
          gauge: formData.preferredThickness || undefined,
          color: formData.preferredColor || undefined,
          customPrinting: formData.customPrinting,
          specifications: {
            customPackagingType: formData.customPackagingType,
            intendedUse: formData.intendedUse,
          },
        }
      ];

      const confirmation = await enquiryService.submitPublicEnquiry({
        customerName: formData.fullName.trim(),
        businessName: formData.businessName.trim() || undefined,
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || undefined,
        customerType: (formData.customerType as any) || 'individual',
        enquiryType: mode === 'custom' ? 'quote_custom' : 'quote_standard',
        customerMessage: formData.additionalRequirements.trim() || undefined,
        source: 'Quote Request Page',
        items,
      });

      setConfirmationData(confirmation);
      try {
        sessionStorage.setItem('df_last_enquiry_confirmation', JSON.stringify(confirmation));
      } catch {}

      // Prepare optional WhatsApp handoff message with reference prepended
      const baseMsg = generateQuotationMessage(
        formData,
        mode === 'standard' ? selectedProduct?.title : undefined,
        mode === 'standard' ? selectedProduct?.category : undefined
      );
      const enrichedMsg = `*Enquiry Reference: ${confirmation.reference}*\n\n${baseMsg}`;
      setGeneratedMessage(enrichedMsg);

      if (whatsAppReady) {
        const url = generateWhatsAppUrl(enrichedMsg);
        setWhatsappUrl(url);
      }

      setSubmitState('submitted-success');
      navigate('/enquiry-confirmation', { state: { confirmation } });
    } catch (err: any) {
      setSubmitError(err.message || 'We could not submit your quotation enquiry right now. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (!confirmationData?.reference) return;
    navigator.clipboard.writeText(confirmationData.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleReset = () => {
    setFormData({
      mode: 'standard',
      fullName: '',
      businessName: '',
      phone: '',
      email: '',
      customerType: '',
      productSlug: '',
      customPackagingType: 'carrier-bags',
      intendedUse: '',
      quantity: '',
      unit: 'pieces',
      preferredSize: '',
      preferredThickness: '',
      preferredColor: '',
      customPrinting: 'no',
      additionalRequirements: '',
    });
    setMode('standard');
    setErrors({});
    setSubmitState('idle');
    setSubmitError(null);
    setConfirmationData(null);
    setIsSubmitting(false);
    setGeneratedMessage('');
    setWhatsappUrl(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real Confirmation View after server persistence */}
      {submitState === 'submitted-success' && confirmationData && (
        <div className="bg-white border border-[#D8D5CB] rounded-lg p-6 sm:p-10 shadow-subtle text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#EAF3ED] text-[#246B45] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 stroke-[2]" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF3ED] border border-[#B8D7C2] text-[#246B45] font-mono font-bold text-xs rounded-full">
              Reference: {confirmationData.reference}
              <button
                type="button"
                onClick={handleCopyReference}
                className="ml-1 text-[11px] underline hover:text-[#18492F] cursor-pointer inline-flex items-center gap-0.5"
              >
                {copiedRef ? <Check className="w-3 h-3 text-[#246B45]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <h3 className="text-2xl font-bold text-[#252A27]">
              Quotation Request Received
            </h3>
            <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
              {confirmationData.message || 'Your quotation requirements have been recorded in our production system. Our order desk will evaluate your specifications and contact you shortly.'}
            </p>
          </div>

          {/* Quick Summary Snapshot */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md max-w-md mx-auto text-left text-xs space-y-1.5">
            <span className="font-bold text-[#252A27] block mb-1">Enquiry Summary:</span>
            <div><span className="text-[#5C635F]">Reference:</span> <span className="font-mono font-bold text-[#246B45]">{confirmationData.reference}</span></div>
            <div><span className="text-[#5C635F]">Name:</span> {formData.fullName}</div>
            {formData.businessName && <div><span className="text-[#5C635F]">Business:</span> {formData.businessName}</div>}
            <div><span className="text-[#5C635F]">Phone:</span> {formData.phone}</div>
            <div>
              <span className="text-[#5C635F]">Order Type:</span>{' '}
              {mode === 'custom' ? 'Custom Packaging Requirement' : 'Standard Catalogue Product'}
            </div>
            <div>
              <span className="text-[#5C635F]">Item / Type:</span>{' '}
              {mode === 'custom' 
                ? formatPackagingTypeLabel(formData.customPackagingType)
                : (selectedProduct?.title || formData.productSlug)}
            </div>
            {formData.quantity && (
              <div><span className="text-[#5C635F]">Estimated Quantity:</span> {formData.quantity} {formData.unit}</div>
            )}
          </div>

          {/* Action Buttons: Tracking, WhatsApp, Confirmation */}
          <div className="space-y-3 pt-2 max-w-md mx-auto">
            {confirmationData.trackingToken && (
              <Link to={`/track-enquiry?token=${confirmationData.trackingToken}`} className="w-full block">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<Search className="w-4 h-4" />}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                >
                  Track Live Status
                </Button>
              </Link>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5 ml-1" />}
                >
                  Send Details to Order Desk via WhatsApp
                </Button>
              </a>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSubmitState('idle')}
              >
                Review Submitted Form
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Submit Another Quote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Quotation Form */}
      {submitState !== 'submitted-success' && (
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Inline Error Banner if Submission Failed */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-xs sm:text-sm">
              <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Unable to Submit Quotation</p>
                <p className="text-red-700 leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}
          {/* Unconfigured Notice if WhatsApp line is pending configuration */}
          {submitState === 'submitted-unconfigured' && (
            <WhatsAppNotice
              isConfigured={false}
              formattedMessage={generatedMessage}
            />
          )}

          {/* =========================================================================
              ENQUIRY TYPE SELECTOR (STANDARD PRODUCT VS CUSTOM PACKAGING)
              ========================================================================= */}
          <div className="bg-white border border-[#D8D5CB] p-4 sm:p-6 rounded-lg shadow-subtle space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Choose Enquiry Type
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleModeChange('standard')}
                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  mode === 'standard'
                    ? 'border-[#246B45] bg-[#EAF3ED] ring-1 ring-[#246B45]'
                    : 'border-[#D8D5CB] bg-white hover:border-[#88918C]'
                }`}
              >
                <Package className={`w-5 h-5 mt-0.5 shrink-0 ${mode === 'standard' ? 'text-[#246B45]' : 'text-[#5C635F]'}`} />
                <div>
                  <div className="text-sm font-bold text-[#252A27]">
                    Standard Catalogue Product
                  </div>
                  <div className="text-xs text-[#5C635F] mt-0.5">
                    Select from our verified carrier bags, rolls, liners, or sacks.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('custom')}
                className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                  mode === 'custom'
                    ? 'border-[#246B45] bg-[#EAF3ED] ring-1 ring-[#246B45]'
                    : 'border-[#D8D5CB] bg-white hover:border-[#88918C]'
                }`}
              >
                <Sliders className={`w-5 h-5 mt-0.5 shrink-0 ${mode === 'custom' ? 'text-[#246B45]' : 'text-[#5C635F]'}`} />
                <div>
                  <div className="text-sm font-bold text-[#252A27]">
                    Discuss a Custom Packaging Requirement
                  </div>
                  <div className="text-xs text-[#5C635F] mt-0.5">
                    Specify custom sizes, unlisted gauges, branding, or intended uses.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* =========================================================================
              SECTION 1: CUSTOMER INFORMATION
              ========================================================================= */}
          <div className="bg-white border border-[#D8D5CB] p-6 sm:p-8 rounded-lg shadow-subtle space-y-5">
            <div className="border-b border-[#E6E4DD] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#246B45]">
                Step 1 of 3
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#252A27]">
                Customer & Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                placeholder="e.g. Alex Morgan"
                required
                value={formData.fullName}
                onChange={(e) => handleTextChange('fullName', e.target.value)}
                error={errors.fullName}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Business or Organization Name"
                placeholder="e.g. Apex Wholesale Depot (optional)"
                value={formData.businessName}
                onChange={(e) => handleTextChange('businessName', e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                required
                value={formData.phone}
                onChange={(e) => handleTextChange('phone', e.target.value)}
                error={errors.phone}
                helperText="Direct phone line for quotation follow-up and stock verification."
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. buyer@example.com (optional)"
                value={formData.email}
                onChange={(e) => handleTextChange('email', e.target.value)}
                error={errors.email}
                helperText="Optional email for formal written estimates."
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="sm:col-span-2">
                <Select
                  label="Customer / Buyer Category"
                  required
                  placeholder="Select customer category"
                  options={[
                    { value: 'individual', label: 'Individual Buyer — Personal or Household Use' },
                    { value: 'retailer', label: 'Retailer — Shop Owner, Boutique or Supermarket' },
                    { value: 'wholesaler', label: 'Wholesaler / Distributor — Bulk Reseller' },
                    { value: 'commercial', label: 'Commercial Business — Industrial, Food, or Agricultural Enterprise' },
                  ]}
                  value={formData.customerType}
                  onChange={(e) => handleTextChange('customerType', e.target.value as CustomerType)}
                  error={errors.customerType}
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: PRODUCT OR CUSTOM PACKAGING REQUIREMENTS
              ========================================================================= */}
          <div className="bg-white border border-[#D8D5CB] p-6 sm:p-8 rounded-lg shadow-subtle space-y-6">
            <div className="border-b border-[#E6E4DD] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#246B45]">
                Step 2 of 3
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#252A27]">
                {mode === 'custom' 
                  ? 'Custom Packaging Specifications' 
                  : 'Product Requirements & Specifications'}
              </h3>
            </div>

            {/* In Standard Mode: Standard Product Selector */}
            {mode === 'standard' ? (
              <QuoteProductSelector
                products={products}
                selectedSlug={formData.productSlug}
                onChange={(slug) => handleTextChange('productSlug', slug)}
                error={errors.productSlug}
                unknownSlugAttempt={unknownSlugAttempt}
              />
            ) : (
              /* In Custom Mode: Custom Packaging Type & Intended Use */
              <div className="space-y-5">
                <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-xs text-[#5C635F] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-[#252A27] block">Flexible Custom Specifications:</span>
                    <p className="leading-relaxed">
                      Not sure about the size or thickness? Tell us what you need the packaging for, and ask us to help you identify suitable options.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Select
                    label="Packaging Type of Interest"
                    required
                    options={[
                      { value: 'carrier-bags', label: 'Retail Carrier Bags (Punch-Hole, Vest, Loop)' },
                      { value: 'packaging-bags', label: 'Heavy-Duty Packaging Bags & Liners' },
                      { value: 'nylon-rolls-and-film', label: 'Continuous Film Rolls / Heat-Shrink Sheeting' },
                      { value: 'custom-printed-nylon', label: 'Custom Printed Brand Bags' },
                      { value: 'agricultural-film', label: 'Agricultural Mulch & Protective Sheeting' },
                      { value: 'other', label: 'Specialty / Unlisted Nylon Application' },
                    ]}
                    value={formData.customPackagingType}
                    onChange={(e) => handleTextChange('customPackagingType', e.target.value)}
                    error={errors.customPackagingType}
                    helperText="Select the packaging category that most closely matches your need."
                  />

                  <Input
                    label="Intended Use or Application"
                    placeholder="e.g. Retail clothing, food grains, bakery produce, machine parts..."
                    value={formData.intendedUse || ''}
                    onChange={(e) => handleTextChange('intendedUse', e.target.value)}
                    helperText="Helps our team recommend suitable film elasticity and density."
                  />
                </div>
              </div>
            )}

            {/* Quantity and Unit of Measurement (Both modes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <Input
                label="Estimated Quantity Required"
                placeholder="e.g. 5000 (optional)"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleTextChange('quantity', e.target.value)}
                error={errors.quantity}
                helperText="Optional estimated numerical volume if known."
              />

              <Select
                label="Unit of Measurement"
                options={[
                  { value: 'pieces', label: 'Pieces / Finished Bags' },
                  { value: 'rolls', label: 'Rolls / Film Spools' },
                  { value: 'packs', label: 'Packs / Bundles' },
                  { value: 'kg', label: 'Kilograms (kg) by weight' },
                  { value: 'other', label: 'Other / Custom packaging format' },
                ]}
                value={formData.unit}
                onChange={(e) => handleTextChange('unit', e.target.value)}
              />

              <div>
                <Input
                  label="Preferred Size or Dimensions"
                  placeholder="e.g. 40cm x 60cm or 1.2m width (optional)"
                  value={formData.preferredSize}
                  onChange={(e) => handleTextChange('preferredSize', e.target.value)}
                  helperText="Leave blank if standard catalog sizes are acceptable."
                />
              </div>

              <div>
                <Input
                  label="Preferred Thickness or Gauge"
                  placeholder="e.g. 50 microns / 200 gauge (optional)"
                  value={formData.preferredThickness}
                  onChange={(e) => handleTextChange('preferredThickness', e.target.value)}
                  helperText="Leave blank if standard material gauge is acceptable."
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Preferred Colour or Film Tint"
                  placeholder="e.g. Natural Translucent, Milky White, or Tinted (optional)"
                  value={formData.preferredColor}
                  onChange={(e) => handleTextChange('preferredColor', e.target.value)}
                  helperText="Subject to resin batch pigmentation and minimum order thresholds."
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: CUSTOM PRINTING & SUBMISSION
              ========================================================================= */}
          <div className="bg-white border border-[#D8D5CB] p-6 sm:p-8 rounded-lg shadow-subtle space-y-6">
            <div className="border-b border-[#E6E4DD] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#246B45]">
                Step 3 of 3
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#252A27]">
                Custom Printing & Additional Notes
              </h3>
            </div>

            {/* Custom Brand Printing Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#252A27] mb-2">
                Brand Printing Preference
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'no', title: 'Plain Nylon', desc: 'Standard unprinted packaging' },
                  { value: 'yes', title: 'Custom Printing', desc: 'Flexographic brand logo & design' },
                  { value: 'guidance', title: 'Need Guidance', desc: 'Discuss plate & cylinder options' },
                ].map((option) => {
                  const isSelected = formData.customPrinting === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#246B45] bg-[#EAF3ED] ring-1 ring-[#246B45]'
                          : 'border-[#D8D5CB] bg-white hover:border-[#88918C]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="customPrinting"
                          value={option.value}
                          checked={isSelected}
                          onChange={(e) => handleTextChange('customPrinting', e.target.value)}
                          className="text-[#246B45] focus:ring-[#246B45]"
                        />
                        <span className="text-xs font-bold text-[#252A27]">{option.title}</span>
                      </div>
                      <span className="mt-1 text-[11px] text-[#5C635F] pl-5">{option.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Additional Requirements */}
            <Textarea
              label="Additional Specifications or Delivery Notes"
              placeholder="Mention any delivery timelines, specific packaging seals, reinforced gussets, or polymer density preferences..."
              rows={4}
              value={formData.additionalRequirements}
              onChange={(e) => handleTextChange('additionalRequirements', e.target.value)}
              helperText="Optional notes to assist our team with preparing your estimate."
            />

            {/* Privacy notice and WhatsApp disclosure */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-xs space-y-2 text-[#5C635F]">
              <div className="flex items-center gap-1.5 font-bold text-[#252A27]">
                <ShieldCheck className="w-4 h-4 text-[#246B45]" />
                <span>Privacy Notice & Enquiry Policy</span>
              </div>
              <p className="leading-relaxed">
                Your specifications are transmitted directly to our order desk and assigned a verified reference number. We do not sell or distribute your contact details. Once submitted, you can also hand off your reference directly to WhatsApp for rapid conversation.
              </p>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Recording Enquiry...' : 'Submit Quotation Request'}
              </Button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#5C635F] hover:text-[#252A27] py-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
