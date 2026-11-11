import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const { settings, isWhatsAppConfigured } = useBusinessSettings();
  const [showTooltip, setShowTooltip] = useState(true);

  if (!isWhatsAppConfigured) {
    return null;
  }

  const whatsAppNumber = settings.whatsAppNumber || '2348134726113';
  const brandName = settings.businessName || 'Divine Favour';
  const message = `Hello ${brandName}, I would like to place an order / request a price quotation for nylon packaging.`;
  const url = buildWhatsAppUrl(whatsAppNumber, message) || `https://wa.me/2348134726113`;

  return (
    <aside
      aria-label="Direct WhatsApp Ordering"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group print:hidden select-none"
    >
      {/* Small Dismissible Callout Bubble (Desktop & Mobile) */}
      {showTooltip && (
        <div className="relative hidden sm:flex items-center gap-2 bg-white text-[#252A27] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-[#D8D5CB] transition-opacity">
          <span>Order on WhatsApp</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-[#88918C] hover:text-[#252A27] p-0.5 rounded-full"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Action WhatsApp Button */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#246B45] hover:bg-[#1D5838] active:scale-95 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] relative"
        aria-label="Chat and order directly on WhatsApp"
      >
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
      </a>
    </aside>
  );
};
