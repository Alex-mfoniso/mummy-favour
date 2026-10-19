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
    shortDescription: 'Punch-hole, loop-handle, and vest-style retail shopping bags engineered for dependable carrying strength.',
    image: '/images/categories/carrier-bags.jpg',
    imageAlt: 'Stacked retail carrier and packaging bags manufactured at Divine Favour',
    isProvisional: true,
    badge: 'Provisional Category',
  },
  {
    id: 'nylon-rolls-and-film',
    name: 'Nylon Rolls & Film',
    slug: 'nylon-rolls-and-film',
    shortDescription: 'Continuous plastic sheeting, shrink bundling films, and protective rolls for industrial wrapping and agriculture.',
    image: '/images/categories/nylon-rolls-and-film.jpg',
    imageAlt: 'High-clarity plastic film roll and continuous extruded packaging sheet',
    isProvisional: true,
    badge: 'Provisional Category',
  },
  {
    id: 'packaging-bags',
    name: 'Packaging Bags',
    slug: 'packaging-bags',
    shortDescription: 'Heavy-gauge sacks and gusseted container liners crafted to protect goods against dust, moisture, and abrasion.',
    image: '/images/categories/packaging-bags.jpg',
    imageAlt: 'Industrial packaging bags and moisture-resistant liner sacks',
    isProvisional: true,
    badge: 'Provisional Category',
  },
  {
    id: 'custom-printed-nylon',
    name: 'Custom Printed Nylon',
    slug: 'custom-printed-nylon',
    shortDescription: 'Custom brand artwork and tailored bag gauges for retailers and corporate distributors, subject to production setup.',
    image: '/images/categories/custom-printed-nylon.jpg',
    imageAlt: 'Custom printed packaging nylon sample with commercial branding',
    isProvisional: true,
    badge: 'Service Subject to Confirmation',
  },
  {
    id: 'other-nylon-products',
    name: 'Other Nylon Products',
    slug: 'other-nylon-products',
    shortDescription: 'Specialty poly liners, mulch sheeting, and specialty extruded films for agricultural and unique packing needs.',
    image: '/images/categories/other-nylon-products.jpg',
    imageAlt: 'Specialty extruded films and protective rolls',
    isProvisional: true,
    badge: 'Provisional Category',
  },
];

// Alias for backwards compatibility with Phase 1 & 2 imports
export const PROVISIONAL_CATEGORIES = PRODUCT_CATEGORIES;
