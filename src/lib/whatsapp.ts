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
export function generateContactMessage(form: ContactFormState): string {
  const parts: string[] = [];

  parts.push('*DIVINE FAVOUR | GENERAL BUSINESS ENQUIRY*');
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
  parts.push('_Sent via Divine Favour Website Contact Form_');

  return parts.join('\n');
}

/**
 * Construct professional, structured quotation enquiry text for WhatsApp handoff
 */
export function generateQuotationMessage(
  form: QuoteFormState,
  productTitle?: string,
  productCategory?: string
): string {
  const parts: string[] = [];
  const isCustomMode = form.mode === 'custom';

  if (isCustomMode) {
    parts.push('*DIVINE FAVOUR | CUSTOM PACKAGING REQUIREMENT*');
  } else {
    parts.push('*DIVINE FAVOUR | PACKAGING QUOTATION ENQUIRY*');
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
  parts.push('_Sent via Divine Favour Website Quotation Builder_');

  return parts.join('\n');
}

/**
 * Sanitize a phone number for wa.me format (numeric characters only)
 */
export function sanitizeWhatsAppNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[^0-9]/g, '');
}

/**
 * Check if the business WhatsApp number is configured
 */
export function isWhatsAppConfigured(): boolean {
  return sanitizeWhatsAppNumber(SITE_CONFIG.whatsAppNumber).length >= 7;
}

/**
 * Generate safe wa.me URL with encoded quotation message
 */
export function generateWhatsAppUrl(message: string): string | null {
  const sanitized = sanitizeWhatsAppNumber(SITE_CONFIG.whatsAppNumber);
  if (sanitized.length < 7) {
    return null;
  }
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
