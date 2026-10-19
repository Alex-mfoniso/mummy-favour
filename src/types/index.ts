/**
 * Core type definitions for Divine Favour packaging frontend
 */

export type TargetAudience = 
  | 'individual' 
  | 'retailer' 
  | 'wholesaler' 
  | 'distributor' 
  | 'commercial';

export type ProductStatus = 'in-stock' | 'made-to-order' | 'low-stock' | 'custom-order' | 'provisional-sample';

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  title: string;
  name?: string; // Alias for title
  slug: string;
  categoryId: string;
  category: string;
  tagline: string;
  shortDescription?: string; // Alias for tagline
  description: string;
  fullDescription?: string; // Alias for description
  specifications: ProductSpecification[];
  minOrderQuantity: string;
  status: ProductStatus;
  targetAudience: TargetAudience[];
  materialGrade: string;
  material?: string; // Material info
  thickness?: string; // Gauge / Micron thickness
  dimensions?: string[]; // Sizes / Dimensions
  availableColors?: string[]; // Colors when known
  customizationOptions?: string[]; // Customization options
  featured?: boolean;
  image?: string;
  imageAlt?: string;
  gallery?: string[];
  isProvisional?: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image?: string;
  imageAlt?: string;
  isProvisional?: boolean;
  badge?: string;
}

export type ProductSortOption = 'featured' | 'name-asc' | 'name-desc';

export interface ProductFiltersState {
  category: string;
  search: string;
  status: string;
  customization: string;
  sortBy: ProductSortOption;
}

export interface AudienceSegment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyBenefits: string[];
  actionLabel: string;
  actionHref: string;
}

export interface ValuePillar {
  id: string;
  title: string;
  description: string;
  context: string;
}

export interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface NavItem {
  label: string;
  path: string;
  isCta?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'success' | 'neutral' | 'warning' | 'info' | 'forest';
export type CustomerType = 'individual' | 'retailer' | 'wholesaler' | 'commercial';

export type QuoteMode = 'standard' | 'custom';

export interface QuoteFormState {
  mode?: QuoteMode;
  fullName: string;
  businessName: string;
  phone: string;
  email: string;
  customerType: CustomerType | '';
  // Standard product flow
  productSlug: string;
  // Custom packaging flow
  customPackagingType?: string;
  intendedUse?: string;
  // Specifications (optional/customizable)
  quantity: string;
  unit: string;
  preferredSize: string;
  preferredThickness: string;
  preferredColor: string;
  customPrinting: 'no' | 'yes' | 'guidance';
  additionalRequirements: string;
}

export interface QuoteFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  customerType?: string;
  productSlug?: string;
  customPackagingType?: string;
  quantity?: string;
}

export type ContactTopic = 'product-info' | 'bulk-orders' | 'custom-packaging' | 'general';

export interface ContactFormState {
  fullName: string;
  phone: string;
  email: string;
  topic: ContactTopic | '';
  message: string;
}

export interface ContactFormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  topic?: string;
  message?: string;
}

export type {
  EnquiryStatus,
  EnquiryType,
  EnquiryCustomSpecs,
  AdminEnquiry,
  AdminCategory,
  AdminProduct,
  AdminBusinessSettings,
  DashboardSummaryMetrics,
} from './admin';


