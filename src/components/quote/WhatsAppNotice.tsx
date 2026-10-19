import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, MessageSquare, AlertCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface WhatsAppNoticeProps {
  isConfigured: boolean;
  formattedMessage?: string;
  className?: string;
}

export const WhatsAppNotice: React.FC<WhatsAppNoticeProps> = ({
  isConfigured,
  formattedMessage = '',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!formattedMessage) return;
    try {
      await navigator.clipboard.writeText(formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API unavailable
      setCopied(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className={`p-5 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg space-y-3.5 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#A65B00] flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
              WhatsApp Direct Channel Pending Business Line Configuration
            </h4>
            <p className="text-xs text-[#5C635F] leading-relaxed">
              Divine Favour has not yet published an automated business WhatsApp number for direct web dispatch in this environment. To ensure you do not lose your entered specifications, you can copy your formatted enquiry text below or contact us through our official channels.
            </p>
          </div>
        </div>

        {formattedMessage && (
          <div className="space-y-2 pt-2 border-t border-[#E6E4DD]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C635F]">
                Generated Enquiry Summary:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#246B45]" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied to Clipboard' : 'Copy Formatted Text'}
              </Button>
            </div>
            <pre className="p-3 bg-white border border-[#E6E4DD] rounded text-[11px] text-[#252A27] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {formattedMessage}
            </pre>
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <Link to="/contact">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<PhoneCall className="w-3.5 h-3.5" />}
            >
              View Official Contact Information
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-[#EAF3ED] border border-[#C2E0CC] rounded-lg flex items-start gap-3 text-xs text-[#246B45] ${className}`}>
      <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-bold text-[#252A27] block">
          Direct WhatsApp Commercial Dispatch
        </span>
        <p className="text-[#365342] leading-relaxed">
          Submitting this quotation launches a formatted message directly in your WhatsApp application. The website itself does not store your details in an external database or require account creation.
        </p>
      </div>
    </div>
  );
};
