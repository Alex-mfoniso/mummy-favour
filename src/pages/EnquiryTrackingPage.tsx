import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Copy, 
  Check, 
  AlertCircle, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  Loader2,
  HelpCircle,
  Package,
  Truck
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';
import { enquiryService, PublicEnquiryTracking } from '@/services/enquiryService';

export const EnquiryTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, isWhatsAppConfigured, hasEmail } = useBusinessSettings();

  const tokenFromUrl = (searchParams.get('token') || '').trim();
  const [inputToken, setInputToken] = useState(tokenFromUrl);
  const [trackingData, setTrackingData] = useState<PublicEnquiryTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const fetchTracking = useCallback(async (token: string) => {
    if (!token) {
      setTrackingData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await enquiryService.trackPublicEnquiry(token);
      setTrackingData(data);
    } catch (err: any) {
      setTrackingData(null);
      setError(
        err.message ||
        'Tracking information could not be found for the provided key. Please check your tracking link or contact our team with your reference code.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Track Enquiry Status | Divine Favour Packaging';
    if (tokenFromUrl) {
      setInputToken(tokenFromUrl);
      fetchTracking(tokenFromUrl);
    }
  }, [tokenFromUrl, fetchTracking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputToken.trim();
    if (!trimmed) return;
    setSearchParams({ token: trimmed }, { replace: true });
    fetchTracking(trimmed);
  };

  const handleCopyReference = () => {
    if (!trackingData?.reference) return;
    navigator.clipboard.writeText(trackingData.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  // Build WhatsApp follow-up URL
  const cleanWhatsAppNumber = (settings.whatsAppNumber || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
  const whatsAppMessage = trackingData
    ? encodeURIComponent(
        `Hello Divine Favour, I am tracking my packaging enquiry with reference: ${trackingData.reference}.\nCurrent status is: ${trackingData.statusTitle}.\nCould you please provide an update on this?`
      )
    : '';
  const whatsAppUrl = isWhatsAppConfigured && cleanWhatsAppNumber
    ? `https://wa.me/${cleanWhatsAppNumber}?text=${whatsAppMessage}`
    : null;

  // Build Email follow-up mailto
  const contactEmail = settings.publicEmail || settings.email;
  const emailMailto = hasEmail && contactEmail && trackingData
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(
        `Status Follow-up: Enquiry [${trackingData.reference}]`
      )}&body=${encodeURIComponent(
        `Dear Divine Favour Sales Desk,\n\nI am inquiring about the status of my enquiry reference ${trackingData.reference}.\n\nStatus displayed: ${trackingData.statusTitle}\n\nPlease let me know if any additional details are required.\n\nThank you.`
      )}`
    : null;

  const steps = [
    { num: 1, label: 'Received', key: 'received' },
    { num: 2, label: 'Technical Review', key: 'under_review' },
    { num: 3, label: 'Follow-up', key: 'follow_up_in_progress' },
    { num: 4, label: 'Quotation Ready', key: 'quotation_prepared' },
  ];

  const currentStep = trackingData?.stepNumber || 1;
  const isClosed = trackingData?.status === 'closed';

  return (
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[85vh]">
      <Container size="lg">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#246B45]">
              Real-Time Order Desk Tracking
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#252A27] tracking-tight">
              Track Enquiry Status
            </h1>
            <p className="text-xs sm:text-sm text-[#5C635F] max-w-lg mx-auto">
              Follow the progress of your custom or catalogue packaging enquiry from specification review to quotation formulation.
            </p>
          </div>

          {/* Access Key Input Card (Always accessible for manual token lookup) */}
          <div className="bg-white border border-[#D8D5CB] rounded-xl p-5 sm:p-6 shadow-subtle">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <label htmlFor="token-input" className="block text-xs font-bold uppercase tracking-wider text-[#5C635F]">
                Tracking Access Key
              </label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    id="token-input"
                    type="text"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="Paste your 64-character tracking access key..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-lg border border-[#D8D5CB] focus:outline-none focus:ring-2 focus:ring-[#246B45] focus:border-[#246B45] font-mono"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading || !inputToken.trim()}
                  leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                >
                  {loading ? 'Verifying...' : 'Check Status'}
                </Button>
              </div>

              <p className="text-[11px] text-[#88918C] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#5C635F] shrink-0" />
                <span>Your tracking access key is provided on your enquiry confirmation page upon submission.</span>
              </p>
            </form>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-12 text-center space-y-3 shadow-subtle">
              <Loader2 className="w-8 h-8 animate-spin text-[#246B45] mx-auto" />
              <p className="text-sm font-semibold text-[#252A27]">
                Retrieving enquiry tracking details...
              </p>
              <p className="text-xs text-[#5C635F]">
                Validating cryptographic access credential with Divine Favour records.
              </p>
            </div>
          )}

          {/* Error / Not Found State */}
          {!loading && error && (
            <div className="bg-white border border-red-200 rounded-xl p-6 sm:p-8 shadow-subtle space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#252A27]">
                  Tracking Information Unavailable
                </h3>
                <p className="text-xs text-[#5C635F] leading-relaxed">
                  {error}
                </p>
              </div>
              
              <div className="pt-2 text-xs text-[#5C635F] border-t border-[#E6E4DD] max-w-md mx-auto">
                <p>
                  If you do not have your tracking key, you can reach out directly to Divine Favour quoting your customer reference number (e.g. <code>DF-XXXXXX</code>).
                </p>
              </div>
            </div>
          )}

          {/* Tracking Result View */}
          {!loading && trackingData && (
            <div className="space-y-6 animate-fade-slide-up animation-fill-both">
              
              {/* Status Header Banner */}
              <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
                
                {/* Reference & Meta Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C635F]">
                      Enquiry Reference
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-black text-[#246B45] tracking-wider select-all">
                        {trackingData.reference}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded border border-[#D8D5CB] bg-[#FAF9F6] text-[#252A27] hover:bg-white hover:border-[#246B45] transition-all duration-200 active:scale-95 cursor-pointer"
                        title="Copy reference code"
                      >
                        {copiedRef ? (
                          <>
                            <Check className="w-3 h-3 text-[#246B45]" />
                            <span className="text-[#246B45]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#5C635F]" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1 text-xs">
                    <div className="text-[#5C635F]">
                      Submitted: <strong className="text-[#252A27]">{new Date(trackingData.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                    </div>
                    <div className="text-[11px] text-[#88918C]">
                      Last updated: {new Date(trackingData.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Progress Tracker (4 Steps) */}
                {!isClosed ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {steps.map((st) => {
                        const isDone = currentStep > st.num;
                        const isCurrent = currentStep === st.num;
                        return (
                          <div key={st.key} className="text-center space-y-2">
                            <div 
                              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all duration-300 ease-out ${
                                isDone 
                                  ? 'bg-[#246B45] text-white shadow-xs' 
                                  : isCurrent 
                                  ? 'bg-[#EAF3ED] border-2 border-[#246B45] text-[#246B45] ring-4 ring-[#246B45]/15' 
                                  : 'bg-[#FAF9F6] border border-[#D8D5CB] text-[#88918C]'
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : st.num}
                            </div>
                            <div className={`text-[11px] font-semibold leading-tight ${isCurrent ? 'text-[#246B45]' : isDone ? 'text-[#252A27]' : 'text-[#88918C]'}`}>
                              {st.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>This enquiry has been marked as <strong>Closed</strong> or archived.</span>
                  </div>
                )}

                {/* Status Detail Card */}
                <div className="p-4 sm:p-5 bg-[#FAF9F6] border border-[#E6E4DD] rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#246B45] animate-pulse" />
                    <h2 className="text-base font-bold text-[#252A27]">
                      {trackingData.statusTitle}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                    {trackingData.statusDescription}
                  </p>
                </div>

              </div>

              {/* Specifications & Items Breakdown */}
              <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-5">
                <div className="flex items-center justify-between border-b border-[#E6E4DD] pb-4">
                  <h3 className="text-base font-bold text-[#252A27] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#246B45]" />
                    <span>Requested Packaging Specifications</span>
                  </h3>
                  <span className="text-xs text-[#5C635F]">
                    Customer: <strong>{trackingData.customerName}</strong>
                  </span>
                </div>

                {trackingData.items && trackingData.items.length > 0 ? (
                  <div className="divide-y divide-[#E6E4DD]">
                    {trackingData.items.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-[#252A27] text-sm block">
                            {item.productName}
                          </span>
                          <div className="flex flex-wrap gap-2 text-[11px] text-[#5C635F]">
                            {item.size && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded">
                                Size: <strong>{item.size}</strong>
                              </span>
                            )}
                            {item.gauge && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded">
                                Gauge: <strong>{item.gauge}</strong>
                              </span>
                            )}
                            {item.color && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded">
                                Color: <strong>{item.color}</strong>
                              </span>
                            )}
                            {item.customPrinting && (
                              <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#E6E4DD] rounded">
                                Printing: <strong>{item.customPrinting}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {item.quantity && (
                          <div className="sm:text-right shrink-0">
                            <span className="inline-block px-3 py-1 bg-[#EAF3ED] border border-[#B8D7C2] text-[#246B45] rounded-md font-mono font-bold text-xs">
                              {item.quantity.toLocaleString()} {item.unit || 'units'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#5C635F]">
                    Standard product or packaging inquiry submitted.
                  </div>
                )}

                {trackingData.customerMessage && (
                  <div className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg text-xs space-y-1">
                    <span className="font-bold text-[#252A27]">Your Stated Requirements:</span>
                    <p className="text-[#5C635F] italic">"{trackingData.customerMessage}"</p>
                  </div>
                )}

                {/* Important Safeguard Reminder */}
                <div className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg text-xs text-[#5C635F] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Note:</strong> A quotation in preparation is an engineering estimate and not a confirmed production invoice. Final pricing and delivery schedules will be formally communicated by Divine Favour representatives.
                  </p>
                </div>
              </div>

              {/* Confirmed Order Workflow Card */}
              {trackingData.order && (
                <div className="bg-white border-2 border-[#246B45]/40 rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DD] pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EAF3ED] text-[#246B45] text-xs font-bold uppercase tracking-wide">
                        <Package className="w-3.5 h-3.5" />
                        <span>Confirmed Production Order</span>
                      </div>
                      <div className="font-mono text-xl font-black text-[#252A27] mt-1">
                        {trackingData.order.orderNumber}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F5F4EF] text-[#252A27] border border-[#D8D5CB]">
                        Status: {trackingData.order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* 50/50 Payments & Production Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C635F]">
                        Production Progress
                      </span>
                      <div className="text-sm font-bold text-[#252A27]">
                        {trackingData.order.productionStatus.replace(/_/g, ' ')}
                      </div>
                      <p className="text-[11px] text-[#5C635F]">
                        {trackingData.order.productionStatus === 'IN_PRODUCTION'
                          ? 'Factory production is actively ongoing for your order.'
                          : trackingData.order.productionStatus === 'PRODUCTION_COMPLETED' || trackingData.order.productionStatus === 'READY_FOR_DISPATCH'
                          ? 'Manufacturing completed and packaging quality inspection passed.'
                          : 'Awaiting deposit verification before factory production begins.'}
                      </p>
                    </div>

                    <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C635F]">
                        Payment Status (50/50 Terms)
                      </span>
                      <div className="text-sm font-bold text-[#246B45]">
                        {trackingData.order.paymentStatus.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-[#5C635F] space-y-0.5">
                        <div>
                          50% Initial Deposit: ₦{Number(trackingData.order.depositPaid).toLocaleString()} / ₦{Number(trackingData.order.depositRequired).toLocaleString()}
                        </div>
                        <div>
                          50% Balance (Due upon arrival at park): ₦{Number(trackingData.order.balancePaid).toLocaleString()} / ₦{Number(trackingData.order.balanceRequired).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Waybill / Dispatch Info */}
                  {trackingData.order.dispatch && (
                    <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#246B45]">
                        <Truck className="w-4 h-4" />
                        <span>Waybill & Transport Park Dispatch</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-[#88918C] block text-[11px]">Dispatch Status</span>
                          <span className="font-bold text-[#252A27]">
                            {trackingData.order.dispatch.dispatchStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#88918C] block text-[11px]">Transporter / Park</span>
                          <span className="font-medium text-[#252A27]">
                            {trackingData.order.dispatch.transportCompany || 'Park Waybill'} {trackingData.order.dispatch.parkDestination ? `— ${trackingData.order.dispatch.parkDestination}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#88918C] block text-[11px]">Waybill Tracking #</span>
                          <span className="font-mono font-bold text-[#246B45]">
                            {trackingData.order.dispatch.waybillNumber || 'Pending Waybill #'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#5C635F] pt-1 italic">
                        * In accordance with Divine Favour transport policy, goods held at destination park will be cleared for release once the 50% final balance is verified.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Direct Follow-up Contacts */}
              {(whatsAppUrl || emailMailto) && (
                <div className="bg-white border border-[#D8D5CB] rounded-xl p-6 sm:p-8 shadow-subtle space-y-4">
                  <h3 className="text-base font-bold text-[#252A27] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#246B45]" />
                    <span>Have Questions Regarding this Enquiry?</span>
                  </h3>
                  <p className="text-xs text-[#5C635F] leading-relaxed">
                    Our sales desk can assist you faster if you provide reference <strong className="text-[#246B45] font-mono">{trackingData.reference}</strong> in your message.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
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
                          Chat on WhatsApp
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
                          Email Sales Desk
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Fallback info when no token provided yet */}
          {!loading && !trackingData && !error && (
            <div className="bg-white border border-[#D8D5CB] rounded-xl p-8 sm:p-10 shadow-subtle text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF3ED] text-[#246B45] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-[#252A27]">
                  Ready to Check Your Request
                </h3>
                <p className="text-xs text-[#5C635F] leading-relaxed">
                  Enter your tracking access key above or click the direct tracking link provided when you submitted your quote request.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link to="/request-quote">
              <Button variant="ghost" size="sm">
                Request a New Quotation
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="sm">
                General Contact Form
              </Button>
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};
