import { ProductCategory } from '@/types';

/**
 * Provisional Product Categories for Divine Favour.
 * Note: These categories represent sample operational classifications
 * to be verified and finalized prior to commercial deployment.
 */
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'carrier-bags',
    name: 'Carrier Bags',
    slug: 'carrier-bags',
    shortDescription: 'High-tensile pharmacy bags, retail shopping bags, and punch-hole carrier bags engineered for dependable carrying strength.',
    image: '/images/categories/carrier-bags.jpg',
    imageAlt: 'Stacked retail carrier and packaging bags manufactured at Divine Favour',
    isProvisional: false,
    badge: 'In Stock',
  },
  {
    id: 'nylon-rolls-and-film',
    name: 'Nylon Rolls & Film',
    slug: 'nylon-rolls-and-film',
    shortDescription: 'Bread wrapper films, Santana white stretch wrap, pure water sachet film rolls, and continuous protective extruded films.',
    image: '/images/categories/nylon-rolls-and-film.jpg',
    imageAlt: 'High-clarity plastic film roll and continuous extruded packaging sheet',
    isProvisional: false,
    badge: 'In Stock',
  },
  {
    id: 'packaging-bags',
    name: 'Packaging Bags',
    slug: 'packaging-bags',
    shortDescription: 'Flat white packaging sacks and food-grade gusseted container liners crafted to protect goods against dust, moisture, and abrasion.',
    image: '/images/categories/packaging-bags.jpg',
    imageAlt: 'Industrial packaging bags and moisture-resistant liner sacks',
    isProvisional: false,
    badge: 'In Stock',
  },
  {
    id: 'custom-printed-nylon',
    name: 'Custom Printed Nylon',
    slug: 'custom-printed-nylon',
    shortDescription: 'Custom printed shopping bags and custom printed bread & bakery packaging bags tailored with high-definition flexographic branding.',
    image: '/images/categories/custom-printed-nylon.jpg',
    imageAlt: 'Custom printed packaging nylon sample with commercial branding',
    isProvisional: false,
    badge: 'Custom Order',
  },
  {
    id: 'other-nylon-products',
    name: 'Other Nylon Products',
    slug: 'other-nylon-products',
    shortDescription: 'Foreign glass protective sheeting, specialty poly liners, and durable extruded barrier films for agricultural and commercial applications.',
    image: '/images/categories/other-nylon-products.jpg',
    imageAlt: 'Specialty extruded films and protective rolls',
    isProvisional: false,
    badge: 'Made to Order',
  },
];

// Alias for backwards compatibility with Phase 1 & 2 imports
export const PROVISIONAL_CATEGORIES = PRODUCT_CATEGORIES;
