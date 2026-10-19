import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  Search, 
  Clock, 
  FileText, 
  ShieldCheck, 
  RotateCcw
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';
import { PublicEnquiryConfirmation } from '@/services/enquiryService';

export const EnquiryConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { settings, isWhatsAppConfigured, hasEmail } = useBusinessSettings();

  const [confirmation, setConfirmation] = useState<PublicEnquiryConfirmation | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    document.title = 'Enquiry Received | Divine Favour Packaging';

    // 1. Try to read from location.state
    const stateData = (location.state as { confirmation?: PublicEnquiryConfirmation })?.confirmation;
    if (stateData && stateData.reference) {
      setConfirmation(stateData);
      try {
        sessionStorage.setItem('df_last_enquiry_confirmation', JSON.stringify(stateData));
      } catch {
        // Ignore session storage errors
      }
      return;
    }

    // 2. Try to restore from sessionStorage on reload
    try {
      const stored = sessionStorage.getItem('df_last_enquiry_confirmation');
      if (stored) {
        setConfirmation(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, [location.state]);

  const handleCopyReference = () => {
    if (!confirmation?.reference) return;
    navigator.clipboard.writeText(confirmation.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleCopyTrackingLink = () => {
    if (!confirmation?.trackingToken) return;
    const url = `${window.location.origin}/track-enquiry?token=${confirmation.trackingToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Build WhatsApp follow-up URL
  const whatsAppMessage = confirmation
    ? encodeURIComponent(
        `Hello Divine Favour team, I submitted an enquiry with reference: ${confirmation.reference}.\nCustomer Name: ${confirmation.customerName}\nI would like to follow up on my quotation.`
      )
    : '';
  const cleanWhatsAppNumber = (settings.whatsAppNumber || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
  const whatsAppUrl = isWhatsAppConfigured && cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${whatsAppMessage}`
    : null;

  // Build Email follow-up mailto
  const contactEmail = settings.publicEmail || settings.email;
  const emailMailto = hasEmail && contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(
        `Follow-up: Packaging Enquiry [${confirmation?.reference || 'Divine Favour'}]`
      )}&body=${encodeURIComponent(
        `Dear Divine Favour Sales Team,\n\nI recently submitted a packaging enquiry with reference number ${confirmation?.reference || ''}.\n\nCustomer: ${confirmation?.customerName || ''}\n\nI would appreciate an update on my specifications and pricing estimate.\n\nThank you.`
      )}`
    : null;

  if (!confirmation) {
    return (
      <div className="py-16 sm:py-24 bg-[#FAF9F6]">
        <Container size="md">
          <div className="bg-white border border-[#D8D5CB] rounded-lg p-8 sm:p-12 text-center space-y-6 shadow-subtle">
            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#E6E4DD] text-[#5C635F] mx-auto flex items-center justify-center">
              <FileText className="w-8 h-8 stroke-[1.5]" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-2xl font-bold text-[#252A27]">
                No Active Enquiry Confirmation
              </h1>
              <p className="text-sm text-[#5C635F] leading-relaxed">
                If you recently submitted an enquiry, you can view your real-time status using your tracking link or access key.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/track-enquiry">
                <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
                  Track Existing Enquiry
                </Button>
              </Link>
              <Link to="/request-quote">
                <Button variant="outline" size="md">
                  Request New Quote
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <Container size="lg">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Main Success Hero Card */}
          <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-10 shadow-subtle text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#EAF3ED] border border-[#B8D7C2] text-[#246B45] mx-auto flex items-center justify-center animate-scale-up">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#246B45] bg-[#EAF3ED] px-3 py-1 rounded-full">
                Submission Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252A27] tracking-tight">
                Enquiry Successfully Received
              </h1>
              <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                Thank you, <strong className="text-[#252A27]">{confirmation.customerName}</strong>. Your packaging requirements have been recorded in our production system.
              </p>
            </div>

            {/* Reference Highlight Box */}
            <div className="p-5 sm:p-6 bg-[#FAF9F6] border-2 border-dashed border-[#246B45]/30 rounded-xl max-w-lg mx-auto text-center space-y-3">
              <p className="text-xs font-semibold text-[#5C635F] uppercase tracking-wider">
                Your Unique Enquiry Reference
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-[#246B45] tracking-wider select-all">
                  {confirmation.reference}
                </span>

                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#D8D5CB] bg-white text-[#252A27] hover:bg-[#FAF9F6] hover:border-[#246B45] transition-all duration-200 active:scale-95 shadow-2xs focus-visible:outline-2 focus-visible:outline-[#246B45] cursor-pointer"
                  title="Copy reference number to clipboard"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#246B45]" />
                      <span className="text-[#246B45]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#5C635F]" />
                      <span>Copy Ref</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#5C635F]">
                Please retain this reference number. Quote it whenever you follow up via phone, WhatsApp, or email.
              </p>
            </div>

            {/* Tracking Link Callout */}
            {confirmation.trackingToken && (
              <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to={`/track-enquiry?token=${confirmation.trackingToken}`}>
                  <Button 
                    variant="primary" 
                    size="md" 
                    leftIcon={<Search className="w-4 h-4" />}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Track Enquiry Status Live
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={handleCopyTrackingLink}
                  leftIcon={copiedLink ? <Check className="w-4 h-4 text-[#246B45]" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedLink ? 'Tracking Link Copied!' : 'Copy Tracking Link'}
                </Button>
              </div>
            )}
          </div>

          {/* Submitted Request Summary Card */}
          <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
              <h2 className="text-base font-bold text-[#252A27] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#246B45]" />
                <span>Submitted Enquiry Summary</span>
              </h2>
              <span className="text-xs text-[#5C635F] font-mono">
                {new Date(confirmation.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {confirmation.items && confirmation.items.length > 0 ? (
              <div className="divide-y divide-[#E6E4DD]">
                {confirmation.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#252A27] text-sm block">
                        {item.productName || 'Packaging Item'}
                      </span>
                      <div className="text-[11px] text-[#5C635F] mt-0.5 space-x-2">
                        {item.size && <span>Size: <strong>{item.size}</strong></span>}
                        {item.gauge && <span>• Gauge: <strong>{item.gauge}</strong></span>}
                        {item.color && <span>• Color: <strong>{item.color}</strong></span>}
                        {item.customPrinting && <span>• Printing: <strong>{item.customPrinting}</strong></span>}
                      </div>
                    </div>
                    {item.quantity && (
                      <div className="sm:text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 bg-[#FAF9F6] border border-[#E6E4DD] rounded font-mono font-bold text-[#246B45]">
                          {item.quantity.toLocaleString()} {item.unit || 'units'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#5C635F]">
                Standard quotation inquiry registered for evaluation.
              </div>
            )}

            {/* Production Notice */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg text-xs text-[#5C635F] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Notice:</strong> This is a confirmed enquiry submission. It does not constitute an approved quotation, invoice, or production guarantee until technical feasibility and pricing are finalized with our sales desk.
              </p>
            </div>
          </div>

          {/* What Happens Next Explainer */}
          <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
            <h2 className="text-base font-bold text-[#252A27] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#246B45]" />
              <span>What Happens Next?</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF3ED] text-[#246B45] font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-xs font-bold text-[#252A27]">
                  Specification Review
                </h3>
                <p className="text-[11px] text-[#5C635F] leading-relaxed">
                  Our manufacturing team evaluates your requested bag types, film gauge, dimensions, and order volume.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF3ED] text-[#246B45] font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-xs font-bold text-[#252A27]">
                  Quotation Formulation
                </h3>
                <p className="text-[11px] text-[#5C635F] leading-relaxed">
                  We calculate custom wholesale or retail manufacturing costs based on current resin and production parameters.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF3ED] text-[#246B45] font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="text-xs font-bold text-[#252A27]">
                  Direct Follow-Up
                </h3>
                <p className="text-[11px] text-[#5C635F] leading-relaxed">
                  A representative reaches out via your preferred phone number, email, or WhatsApp to share your quote.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Direct Follow-Up Actions */}
          {(whatsAppUrl || emailMailto) && (
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="text-base font-bold text-[#252A27] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#246B45]" />
                <span>Need Expedited Assistance?</span>
              </h2>
              <p className="text-xs text-[#5C635F] leading-relaxed">
                If your requirement is time-sensitive or you have additional technical diagrams or artwork to share, you can follow up directly quoting reference <strong className="text-[#246B45] font-mono">{confirmation.reference}</strong>.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                      rightIcon={<ExternalLink className="w-3.5 h-3.5 ml-1" />}
                    >
                      Follow up via WhatsApp
                    </Button>
                  </a>
                )}

                {emailMailto && (
                  <a
                    href={emailMailto}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      leftIcon={<Mail className="w-4 h-4" />}
                    >
                      Email Order Desk
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Navigation Options */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link to="/request-quote" className="w-full sm:w-auto">
              <Button variant="ghost" size="md" fullWidth leftIcon={<RotateCcw className="w-4 h-4" />}>
                Submit Another Enquiry
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="outline" size="md" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse Catalogue
              </Button>
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};
