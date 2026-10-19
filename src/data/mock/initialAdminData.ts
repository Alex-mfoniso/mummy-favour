import { PRODUCTS } from '@/data/products';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { SITE_CONFIG } from '@/config/site';
import { 
  AdminProduct, 
  AdminCategory, 
  AdminEnquiry, 
  AdminBusinessSettings 
} from '@/types/admin';

/**
 * Initial mock products for admin demonstration.
 * Compatible with centralized public catalogue data.
 */
export const INITIAL_ADMIN_PRODUCTS: AdminProduct[] = PRODUCTS.map((product) => ({
  ...product,
  lastUpdated: '2026-10-14',
}));

/**
 * Initial mock categories for admin demonstration.
 * Compatible with centralized public category data.
 */
export const INITIAL_ADMIN_CATEGORIES: AdminCategory[] = PRODUCT_CATEGORIES.map((cat, index) => ({
  ...cat,
  displayOrder: index + 1,
  visibility: 'visible',
  description: cat.shortDescription,
}));

/**
 * Realistic demonstration customer enquiries for internal admin interface.
 * NOTE: These are fictional demonstration records. In this frontend phase,
 * customer enquiries submitted via the public website WhatsApp flow are not
 * stored automatically on a server.
 */
export const INITIAL_ADMIN_ENQUIRIES: AdminEnquiry[] = [
  {
    id: 'enq-001',
    customerName: 'Emmanuel Okafor',
    businessName: 'Apex Supermarkets Ltd',
    phone: '+234 802 111 2233',
    email: 'e.okafor@apexmarkets.ng',
    customerType: 'retailer',
    type: 'quote_standard',
    subject: 'Retail Shopping Carrier Bags (Punch-Hole)',
    productSlug: 'retail-shopping-carrier-bags',
    quantity: '10000',
    unit: 'pieces',
    specifications: {
      size: '40cm x 50cm',
      thickness: '45 microns',
      color: 'Milky White',
      printing: 'Yes — 2-colour brand logo',
      intendedUse: 'Supermarket checkout carrier bags',
    },
    customerNotes: 'Need regular recurring monthly supply for 3 supermarket branches in Lagos. Requesting initial price quotation.',
    source: 'WhatsApp Flow',
    status: 'new',
    internalNotes: 'Staff demo note: High-volume opportunity. Check printing plate cylinder availability for 40x50cm.',
    createdAt: '2026-10-14T09:30:00Z',
    updatedAt: '2026-10-14T09:30:00Z',
  },
  {
    id: 'enq-002',
    customerName: 'Folake Adeleke',
    businessName: 'Adeleke Grain Mills',
    phone: '+234 803 444 5566',
    email: 'procurement@adelekegrains.com',
    customerType: 'commercial',
    type: 'quote_custom',
    subject: 'Heavy-Duty Sacks for Grain & Flour Storage',
    quantity: '2500',
    unit: 'pieces',
    specifications: {
      size: '60cm x 100cm',
      thickness: '80 microns',
      color: 'Natural Translucent',
      printing: 'No — Plain standard',
      intendedUse: 'Dry maize, grain, and cassava flour storage with moisture barrier',
    },
    customerNotes: 'Requires reinforced bottom heat seal to prevent bag bursting during warehouse pallet stacking.',
    source: 'WhatsApp Flow',
    status: 'in_review',
    internalNotes: 'Staff demo note: Reviewing extruder schedule for 80-micron virgin LDPE formulation.',
    createdAt: '2026-10-13T14:15:00Z',
    updatedAt: '2026-10-13T15:00:00Z',
  },
  {
    id: 'enq-003',
    customerName: 'Chidi Nnamdi',
    businessName: 'Sunrise Agro Ventures',
    phone: '+234 809 777 8899',
    email: 'chidi@sunriseagro.org',
    customerType: 'wholesaler',
    type: 'quote_standard',
    subject: 'Agricultural Mulch & Greenhouse Sheeting',
    productSlug: 'agricultural-mulch-greenhouse-film',
    quantity: '50',
    unit: 'rolls',
    specifications: {
      size: '1.2m x 500m rolls',
      thickness: '30 microns',
      color: 'Black / Silver UV-treated',
      printing: 'No — Plain standard',
      intendedUse: 'Seasonal farm bed weed suppression and moisture conservation',
    },
    customerNotes: 'Please confirm lead time for dispatch to Ibadan depot.',
    source: 'WhatsApp Flow',
    status: 'quoted',
    internalNotes: 'Staff demo note: Wholesale volume discount bracket applied. Quotation sent via WhatsApp on 2026-10-13.',
    createdAt: '2026-10-12T11:00:00Z',
    updatedAt: '2026-10-13T08:30:00Z',
  },
  {
    id: 'enq-004',
    customerName: 'Grace Danjuma',
    phone: '+234 805 333 4455',
    email: 'grace.danjuma@gmail.com',
    customerType: 'individual',
    type: 'contact_general',
    subject: 'General Enquiry — Small Event Packaging',
    customerNotes: 'Do you supply smaller quantities (around 500 carrier bags) for private family anniversary gift packages?',
    source: 'Contact Form',
    status: 'contacted',
    internalNotes: 'Staff demo note: Contacted customer via phone. Explained standard pack minimums and provided retail stockist contacts.',
    createdAt: '2026-10-11T16:20:00Z',
    updatedAt: '2026-10-12T09:45:00Z',
  },
  {
    id: 'enq-005',
    customerName: 'Babatunde Alabi',
    businessName: 'Express Logistics Hub',
    phone: '+234 806 888 9900',
    email: 'ops@expresslogistics.ng',
    customerType: 'commercial',
    type: 'quote_standard',
    subject: 'Industrial Pallet Stretch Film Rolls',
    productSlug: 'industrial-pallet-stretch-film',
    quantity: '100',
    unit: 'rolls',
    specifications: {
      size: '500mm x 300m',
      thickness: '23 microns',
      color: 'High Clarity',
      printing: 'No — Plain',
      intendedUse: 'Pallet load stabilization for inter-state road haulage',
    },
    customerNotes: 'Batch completed and picked up from depot.',
    source: 'Direct Consultation',
    status: 'closed',
    internalNotes: 'Staff demo note: Order completed and paid via commercial bank transfer. Batch DF-2026-09 fulfilled.',
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-10T17:00:00Z',
  },
];

/**
 * Initial business settings mock data
 */
export const INITIAL_ADMIN_BUSINESS_SETTINGS: AdminBusinessSettings = {
  businessName: SITE_CONFIG.name,
  tagline: SITE_CONFIG.tagline,
  description: 'Manufacturer and supplier of durable nylon packaging films, commercial sacks, and custom retail bags engineered for reliability, barrier protection, and high-tensile strength.',
  phone: SITE_CONFIG.phone || '',
  whatsAppNumber: SITE_CONFIG.whatsAppNumber || '',
  email: SITE_CONFIG.email || '',
  address: SITE_CONFIG.address || '',
  logoUrl: '',
  primaryColor: '#246B45',
  footerDescription: 'Manufacturer and supplier of durable nylon packaging films, commercial sacks, and custom retail bags engineered for reliability, barrier protection, and high-tensile strength.',
};
