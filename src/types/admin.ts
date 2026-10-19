import { Product, ProductCategory, CustomerType } from './index';

export type EnquiryStatus = 'new' | 'in_review' | 'contacted' | 'quoted' | 'closed';

export type EnquiryType = 'quote_standard' | 'quote_custom' | 'contact_general';

export interface EnquiryCustomSpecs {
  size?: string;
  thickness?: string;
  color?: string;
  printing?: string;
  intendedUse?: string;
}

export interface AdminEnquiryItem {
  id: string;
  enquiryId: string;
  productId?: string | null;
  productName: string;
  productSlug?: string | null;
  quantity?: number | null;
  unit?: string | null;
  size?: string | null;
  gauge?: string | null;
  color?: string | null;
  customPrinting?: string | null;
  specifications?: any;
}

export interface AdminEnquiryNote {
  id: string;
  enquiryId: string;
  authorId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface AdminEnquiry {
  id: string;
  reference?: string;
  customerName: string;
  businessName?: string;
  phone: string;
  email?: string;
  customerType: CustomerType | 'not_specified';
  type: EnquiryType;
  subject: string;
  productSlug?: string;
  requestedProductName?: string;
  quantity?: string;
  unit?: string;
  specifications?: EnquiryCustomSpecs;
  customerNotes: string;
  source: string;
  status: EnquiryStatus;
  internalNotes?: string;
  items?: AdminEnquiryItem[];
  notes?: AdminEnquiryNote[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory extends ProductCategory {
  displayOrder?: number;
  visibility?: 'visible' | 'hidden';
  description?: string; // alias for shortDescription
}

export interface AdminProduct extends Product {
  lastUpdated?: string;
}

export interface SocialMediaLinks {
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
}

export interface AdminBusinessSettings {
  businessName: string;
  tagline: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  description?: string | null; // backward compat alias
  phone?: string | null;
  publicPhone?: string | null;
  whatsAppNumber?: string | null;
  publicWhatsApp?: string | null;
  email?: string | null;
  publicEmail?: string | null;
  address?: string | null;
  businessAddress?: string | null;
  logoUrl?: string | null;
  businessHours?: any;
  socialLinks?: SocialMediaLinks | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  quoteInstructions?: string | null;
  publicAnnouncement?: string | null;
  primaryColor?: string | null;
  footerDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummaryMetrics {
  totalProducts: number;
  totalCategories: number;
  newEnquiries: number;
  enquiriesAwaitingFollowUp: number;
  activeProductsCount: number;
  visibleCategoriesCount: number;
}
