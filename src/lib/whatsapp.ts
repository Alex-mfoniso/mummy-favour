import { 
  QuoteFormState, 
  CustomerType, 
  ContactFormState, 
  ContactTopic 
} from '@/types';
import { SITE_CONFIG } from '@/config/site';

/**
 * Format customer type into human-readable label
 */
export function formatCustomerTypeLabel(type: CustomerType | ''): string {
  switch (type) {
    case 'individual':
      return 'Individual Customer';
    case 'retailer':
      return 'Retailer / Storefront';
    case 'wholesaler':
      return 'Wholesaler / Stockist';
    case 'commercial':
      return 'Commercial / Industrial Enterprise';
    default:
      return 'Not specified';
  }
}

/**
 * Format contact enquiry topic into human-readable label
 */
export function formatContactTopicLabel(topic: ContactTopic | ''): string {
  switch (topic) {
    case 'product-info':
      return 'Product Information & Availability';
    case 'bulk-orders':
      return 'Bulk Order & Wholesale Supply';
    case 'custom-packaging':
      return 'Custom Packaging & Extrusion Consultation';
    case 'general':
      return 'General Business Enquiry';
    default:
      return 'General Enquiry';
  }
}

/**
 * Format packaging type into readable label for custom orders
 */
export function formatPackagingTypeLabel(type?: string): string {
  switch (type) {
    case 'carrier-bags':
      return 'Retail Carrier Bags (Punch-Hole, Vest, Loop)';
    case 'packaging-bags':
      return 'Heavy-Duty Packaging Bags & Liners';
    case 'nylon-rolls-and-film':
      return 'Nylon Continuous Sheeting / Shrink Bundling Film';
    case 'custom-printed-nylon':
      return 'Custom Printed Brand Nylon Bags';
    case 'agricultural-film':
      return 'Agricultural Mulch & Greenhouse Sheeting';
    case 'other':
      return 'Specialty / Other Nylon Packaging';
    default:
      return type || 'Bespoke Nylon Packaging';
  }
}

/**
 * Format custom printing preference into readable string
 */
export function formatCustomPrintingLabel(printing: 'no' | 'yes' | 'guidance'): string {
  switch (printing) {
    case 'no':
      return 'No — Standard / Plain nylon';
    case 'yes':
      return 'Yes — Custom flexographic brand printing';
    case 'guidance':
      return 'Need guidance / Discuss with team';
    default:
      return 'Standard / Plain nylon';
  }
}

/**
 * Format unit into readable label
 */
export function formatUnitLabel(unit: string): string {
  switch (unit) {
    case 'pieces':
      return 'Pieces / Bags';
    case 'rolls':
      return 'Rolls';
    case 'packs':
      return 'Packs / Bundles';
    case 'kg':
      return 'Kilograms (kg)';
    case 'other':
      return 'Custom units';
    default:
      return unit || 'Units';
  }
}

/**
 * Construct professional contact enquiry message for WhatsApp handoff
 */
export function generateContactMessage(form: ContactFormState, businessName?: string): string {
  const brand = (businessName || SITE_CONFIG.name || 'Divine Favour').toUpperCase();
  const brandNormal = businessName || SITE_CONFIG.name || 'Divine Favour';
  const parts: string[] = [];

  parts.push(`*${brand} | GENERAL BUSINESS ENQUIRY*`);
  parts.push('----------------------------------------');
  parts.push(`• Topic: ${formatContactTopicLabel(form.topic)}`);
  parts.push(`• From: ${form.fullName.trim()}`);
  parts.push(`• Phone: ${form.phone.trim()}`);
  if (form.email.trim()) {
    parts.push(`• Email: ${form.email.trim()}`);
  }
  parts.push('');
  parts.push('*Message / Enquiry Details:*');
  parts.push(form.message.trim());
  parts.push('----------------------------------------');
  parts.push(`_Sent via ${brandNormal} Website Contact Form_`);

  return parts.join('\n');
}

/**
 * Construct professional, structured quotation enquiry text for WhatsApp handoff
 */
export function generateQuotationMessage(
  form: QuoteFormState,
  productTitle?: string,
  productCategory?: string,
  reference?: string,
  businessName?: string
): string {
  const brand = (businessName || SITE_CONFIG.name || 'Divine Favour').toUpperCase();
  const brandNormal = businessName || SITE_CONFIG.name || 'Divine Favour';
  const parts: string[] = [];
  const isCustomMode = form.mode === 'custom';

  if (isCustomMode) {
    parts.push(`*${brand} | CUSTOM PACKAGING REQUIREMENT*`);
  } else {
    parts.push(`*${brand} | PACKAGING QUOTATION ENQUIRY*`);
  }
  if (reference) {
    parts.push(`*Enquiry Reference:* ${reference}`);
  }
  parts.push('----------------------------------------');
  
  // Customer Profile
  parts.push('*1. Customer Information:*');
  parts.push(`• Name: ${form.fullName.trim()}`);
  if (form.businessName.trim()) {
    parts.push(`• Business / Entity: ${form.businessName.trim()}`);
  }
  parts.push(`• Customer Type: ${formatCustomerTypeLabel(form.customerType)}`);
  parts.push(`• Phone Number: ${form.phone.trim()}`);
  if (form.email.trim()) {
    parts.push(`• Email Address: ${form.email.trim()}`);
  }
  
  parts.push('');

  // Product Requirements
  if (isCustomMode) {
    parts.push('*2. Custom Packaging Requirements:*');
    parts.push(`• Packaging Type: ${formatPackagingTypeLabel(form.customPackagingType)}`);
    if (form.intendedUse?.trim()) {
      parts.push(`• Intended Application / Use: ${form.intendedUse.trim()}`);
    }
  } else {
    parts.push('*2. Product Requirements:*');
    const resolvedProduct = productTitle 
      ? `${productTitle}${productCategory ? ` (${productCategory})` : ''}` 
      : (form.productSlug || 'General Packaging Consultation');
    parts.push(`• Selected Product: ${resolvedProduct}`);
  }

  if (form.quantity.trim()) {
    parts.push(`• Estimated Quantity: ${form.quantity.trim()} ${formatUnitLabel(form.unit)}`);
  } else {
    parts.push('• Estimated Quantity: To be discussed upon consultation');
  }

  if (form.preferredSize.trim()) {
    parts.push(`• Preferred Size: ${form.preferredSize.trim()}`);
  } else if (isCustomMode) {
    parts.push('• Preferred Size: Guidance requested / Discuss suitable dimensions');
  }

  if (form.preferredThickness.trim()) {
    parts.push(`• Preferred Gauge / Thickness: ${form.preferredThickness.trim()}`);
  } else if (isCustomMode) {
    parts.push('• Preferred Thickness: Guidance requested / Discuss gauge options');
  }

  if (form.preferredColor.trim()) {
    parts.push(`• Preferred Colour: ${form.preferredColor.trim()}`);
  }

  parts.push(`• Custom Printing: ${formatCustomPrintingLabel(form.customPrinting)}`);

  // Additional Requirements
  if (form.additionalRequirements.trim()) {
    parts.push('');
    parts.push('*3. Additional Specifications / Notes:*');
    parts.push(form.additionalRequirements.trim());
  }

  parts.push('----------------------------------------');
  parts.push(`Hello ${brandNormal} sales desk, please review my specifications above for quotation.`);
  parts.push(`_Sent via ${brandNormal} Website Quotation Builder_`);

  return parts.join('\n');
}

/**
 * Generate complete structured quotation message from confirmation record
 */
export function generateConfirmationWhatsAppMessage(
  confirmation: {
    reference: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerMessage?: string;
    items?: Array<{
      productName?: string;
      quantity?: number;
      unit?: string;
      size?: string;
      gauge?: string;
      color?: string;
      customPrinting?: string;
    }>;
  },
  businessName?: string
): string {
  const brand = (businessName || SITE_CONFIG.name || 'Divine Favour').toUpperCase();
  const brandNormal = businessName || SITE_CONFIG.name || 'Divine Favour';
  const parts: string[] = [];
  parts.push(`*${brand} | OFFICIAL QUOTATION REQUEST*`);
  parts.push(`*Enquiry Reference:* ${confirmation.reference}`);
  parts.push('----------------------------------------');
  parts.push('*1. Customer Details:*');
  parts.push(`• Name: ${confirmation.customerName}`);
  if (confirmation.customerPhone) {
    parts.push(`• Phone: ${confirmation.customerPhone}`);
  }
  if (confirmation.customerEmail) {
    parts.push(`• Email: ${confirmation.customerEmail}`);
  }

  if (confirmation.items && confirmation.items.length > 0) {
    parts.push('');
    parts.push('*2. Quotation Specifications:*');
    confirmation.items.forEach((item, index) => {
      const prefix = confirmation.items && confirmation.items.length > 1 ? `Item ${index + 1}: ` : '';
      parts.push(`• ${prefix}${item.productName || 'Bespoke Nylon Packaging'}`);
      if (item.quantity) {
        parts.push(`  - Quantity: ${item.quantity.toLocaleString()} ${item.unit || 'units'}`);
      }
      if (item.size) {
        parts.push(`  - Dimensions: ${item.size}`);
      }
      if (item.gauge) {
        parts.push(`  - Gauge/Microns: ${item.gauge}`);
      }
      if (item.color) {
        parts.push(`  - Colour: ${item.color}`);
      }
      if (item.customPrinting) {
        parts.push(`  - Custom Printing: ${formatCustomPrintingLabel(item.customPrinting as any)}`);
      }
    });
  }

  if (confirmation.customerMessage) {
    parts.push('');
    parts.push('*3. Additional Requirements:*');
    parts.push(confirmation.customerMessage);
  }

  parts.push('----------------------------------------');
  parts.push(`Hello ${brandNormal} sales desk, I submitted this quotation enquiry on your website and would like to finalize pricing and delivery.`);
  parts.push(`_Sent via ${brandNormal} Quotation Portal_`);

  return parts.join('\n');
}

/**
 * Generate quick product enquiry message for WhatsApp
 */
export function generateProductWhatsAppQuoteMessage(
  productTitle: string, 
  category?: string, 
  businessName?: string
): string {
  const brand = (businessName || SITE_CONFIG.name || 'Divine Favour').toUpperCase();
  const brandNormal = businessName || SITE_CONFIG.name || 'Divine Favour';
  const parts: string[] = [];
  parts.push(`*${brand} | PRODUCT QUOTATION ENQUIRY*`);
  parts.push('----------------------------------------');
  parts.push(`• Selected Product: ${productTitle}${category ? ` (${category})` : ''}`);
  parts.push('');
  parts.push(`Hello ${brandNormal} sales team, I would like to request an official quotation for this product. Please share current bulk pricing, gauge options, and delivery timelines.`);
  parts.push('----------------------------------------');
  parts.push(`_Sent via ${brandNormal} Website Catalogue_`);
  return parts.join('\n');
}

/**
 * Sanitize a phone number for wa.me format (numeric characters only, with Nigerian international code)
 * Handles "0813 472 6113" -> "2348134726113", "+234..." -> "234..."
 */
export function sanitizeWhatsAppNumber(phoneNumber?: string | null): string {
  if (!phoneNumber) return '';
  let cleaned = phoneNumber.replace(/[^0-9]/g, '');
  // Normalize Nigerian local 11-digit numbers starting with 0 (e.g. 08134726113 -> 2348134726113)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '234' + cleaned.substring(1);
  } else if (cleaned.length === 10 && (cleaned.startsWith('8') || cleaned.startsWith('7') || cleaned.startsWith('9'))) {
    cleaned = '234' + cleaned;
  }
  return cleaned;
}

/**
 * Format phone number for clean human-readable display
 * e.g. "2348134726113" or "08134726113" -> "+234 813 472 6113"
 */
export function formatWhatsAppDisplay(phoneNumber?: string | null): string {
  const raw = phoneNumber || SITE_CONFIG.whatsAppNumber || '2348134726113';
  const sanitized = sanitizeWhatsAppNumber(raw);
  if (sanitized.startsWith('234') && sanitized.length === 13) {
    return `+234 ${sanitized.slice(3, 6)} ${sanitized.slice(6, 9)} ${sanitized.slice(9)}`;
  }
  return raw;
}

/**
 * Check if the business WhatsApp number is configured
 */
export function isWhatsAppConfigured(phoneNumber?: string | null): boolean {
  const num = phoneNumber !== undefined ? phoneNumber : SITE_CONFIG.whatsAppNumber;
  return sanitizeWhatsAppNumber(num).length >= 7;
}

/**
 * Build safe wa.me URL with phone number and optional message
 */
export function buildWhatsAppUrl(phoneNumber?: string | null, message?: string): string | null {
  const target = sanitizeWhatsAppNumber(phoneNumber || SITE_CONFIG.whatsAppNumber);
  if (target.length < 7) {
    return null;
  }
  if (!message) {
    return `https://wa.me/${target}`;
  }
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate safe wa.me URL with encoded message
 */
export function generateWhatsAppUrl(message: string, customNumber?: string): string | null {
  return buildWhatsAppUrl(customNumber, message);
}
