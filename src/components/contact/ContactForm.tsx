import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  RotateCcw, 
  ShieldCheck, 
  ExternalLink,
  Phone,
  Mail,
  User,
  HelpCircle,
  Copy,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { ContactFormState, ContactFormErrors, ContactTopic } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { 
  generateContactMessage, 
  generateWhatsAppUrl, 
  isWhatsAppConfigured,
  formatContactTopicLabel
} from '@/lib/whatsapp';
import { enquiryService, PublicEnquiryConfirmation } from '@/services/enquiryService';

export const ContactForm: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [copiedRef, setCopiedRef] = useState(false);

  const [formData, setFormData] = useState<ContactFormState>({
    fullName: '',
    phone: '',
    email: '',
    topic: '',
    message: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<PublicEnquiryConfirmation | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitted-success' | 'submitted-unconfigured'>('idle');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const whatsAppReady = isWhatsAppConfigured();

  const handleTextChange = (field: keyof ContactFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {};

    // 1. Full name: required
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    // 2. Phone number: required, min 7 digits
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for follow-up communication.';
    } else if (cleanPhone.length < 7) {
      newErrors.phone = 'Please provide a valid phone number (minimum 7 digits).';
    }

    // 3. Email: optional, format validated if entered
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    }

    // 4. Topic: required
    if (!formData.topic) {
      newErrors.topic = 'Please select an enquiry topic.';
    }

    // 5. Message: required
    if (!formData.message.trim()) {
      newErrors.message = 'Please provide details about your enquiry or requirement.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a brief description (at least 10 characters).';
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
      const confirmation = await enquiryService.submitPublicEnquiry({
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || undefined,
        customerType: 'individual',
        enquiryType: 'contact_general',
        subject: formatContactTopicLabel(formData.topic),
        customerMessage: formData.message.trim(),
        source: 'Contact Us Page',
      });

      setConfirmationData(confirmation);
      try {
        sessionStorage.setItem('df_last_enquiry_confirmation', JSON.stringify(confirmation));
      } catch {}

      const baseMsg = generateContactMessage(formData);
      const enrichedMsg = `*Enquiry Reference: ${confirmation.reference}*\n\n${baseMsg}`;
      setGeneratedMessage(enrichedMsg);

      if (whatsAppReady) {
        const url = generateWhatsAppUrl(enrichedMsg);
        setWhatsappUrl(url);
      }

      setSubmitState('submitted-success');
      navigate('/enquiry-confirmation', { state: { confirmation } });
    } catch (err: any) {
      setSubmitError(err.message || 'We could not submit your enquiry right now. Please verify your connection and try again.');
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

  const handleCopy = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      topic: '',
      message: '',
    });
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
      {/* SUCCESS CONFIRMATION STATE */}
      {submitState === 'submitted-success' && confirmationData && (
        <div className="bg-white border border-[#D8D5CB] rounded-lg p-6 sm:p-10 shadow-subtle text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-[#EAF3ED] text-[#246B45] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 stroke-[2]" />
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

            <h3 className="text-xl sm:text-2xl font-bold text-[#252A27]">
              Message Received
            </h3>
            <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
              {confirmationData.message || 'Thank you for reaching out to Divine Favour. Your enquiry has been received and routed to our team.'}
            </p>
          </div>

          <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md max-w-md mx-auto text-left text-xs space-y-1.5">
            <span className="font-bold text-[#252A27] block mb-1">Enquiry Summary:</span>
            <div><span className="text-[#5C635F]">Reference:</span> <span className="font-mono font-bold text-[#246B45]">{confirmationData.reference}</span></div>
            <div><span className="text-[#5C635F]">Name:</span> {formData.fullName}</div>
            <div><span className="text-[#5C635F]">Topic:</span> {formatContactTopicLabel(formData.topic)}</div>
            <div><span className="text-[#5C635F]">Phone:</span> {formData.phone}</div>
          </div>

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
                  Continue Conversation on WhatsApp
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
                Send Another Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FORM INPUT STATE */}
      {submitState !== 'submitted-success' && (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Inline Error Alert */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-xs sm:text-sm">
              <HelpCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Could Not Send Enquiry</p>
                <p className="text-red-700 leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}
          {/* Unconfigured WhatsApp notice with Copy functionality */}
          {submitState === 'submitted-unconfigured' && (
            <div className="p-5 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-[#246B45] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-[#5C635F]">
                  <h4 className="font-bold text-sm text-[#252A27]">
                    Direct WhatsApp Line Pending Configuration
                  </h4>
                  <p className="leading-relaxed">
                    Our direct WhatsApp integration is currently awaiting administrative telephone line assignment. Your enquiry details have been compiled below so you can copy and preserve them.
                  </p>
                </div>
              </div>

              {/* Formatted message box */}
              <div className="bg-white p-3.5 rounded border border-[#E6E4DD] text-[11px] font-mono text-[#252A27] whitespace-pre-wrap max-h-48 overflow-y-auto">
                {generatedMessage}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSubmitState('idle')}
                >
                  Edit Message
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#D8D5CB] p-6 sm:p-8 rounded-lg shadow-subtle space-y-5">
            <div className="border-b border-[#E6E4DD] pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#246B45]">
                General Communication
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#252A27]">
                Send an Enquiry Message
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
                label="Phone Number"
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                required
                value={formData.phone}
                onChange={(e) => handleTextChange('phone', e.target.value)}
                error={errors.phone}
                helperText="Direct number for follow-up communication."
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. buyer@example.com (optional)"
                  value={formData.email}
                  onChange={(e) => handleTextChange('email', e.target.value)}
                  error={errors.email}
                  helperText="Optional email address if you prefer written email correspondence."
                  leftIcon={<Mail className="w-4 h-4" />}
                />
              </div>

              <div className="sm:col-span-2">
                <Select
                  label="Enquiry Topic"
                  required
                  placeholder="Select what you are inquiring about"
                  options={[
                    { value: 'product-info', label: 'Product Information & Standard Sizes' },
                    { value: 'bulk-orders', label: 'Bulk Order & Wholesale Supply' },
                    { value: 'custom-packaging', label: 'Custom Packaging & Extrusion Consultation' },
                    { value: 'general', label: 'General Business & Operations Enquiry' },
                  ]}
                  value={formData.topic}
                  onChange={(e) => handleTextChange('topic', e.target.value as ContactTopic)}
                  error={errors.topic}
                />
              </div>
            </div>

            <Textarea
              label="Your Message"
              placeholder="Tell us what packaging you are looking for, order questions, or any specific requirements..."
              rows={5}
              required
              value={formData.message}
              onChange={(e) => handleTextChange('message', e.target.value)}
              error={errors.message}
              helperText="Please include any helpful context such as intended bag use or general location."
            />

            {/* Privacy note */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-xs text-[#5C635F] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Your enquiry is securely transmitted and assigned an official tracking reference. We protect your privacy and will only use your contact details to respond to your request.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {isSubmitting ? 'Sending Enquiry...' : 'Send Enquiry'}
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
