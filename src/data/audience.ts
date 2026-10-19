import { AudienceSegment } from '@/types';

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: 'audience-individual',
    title: 'Individual Buyers',
    subtitle: 'Everyday Packaging Needs',
    description: 'Looking for reliable nylon bags, liners, or rolls for domestic storage, events, or small projects? Browse available sizes and enquire about direct purchase options.',
    keyBenefits: [
      'Simple product browsing by type and size',
      'Accessible packaging options without complex minimums',
      'Direct enquiry channel to ask questions before ordering',
    ],
    actionLabel: 'Explore Everyday Bags',
    actionHref: '/products',
  },
  {
    id: 'audience-retailers',
    title: 'Retailers & Shops',
    subtitle: 'Storefront & Carrier Supplies',
    description: 'Ensure your checkout counter never runs short of durable carrier bags. Discover punch-handle, loop-handle, and counter bags that hold customer purchases reliably.',
    keyBenefits: [
      'Standard bag formats suited for diverse retail goods',
      'Options to explore custom print branding for your store',
      'Straightforward reordering enquiries as your store grows',
    ],
    actionLabel: 'View Retail Carrier Bags',
    actionHref: '/products',
  },
  {
    id: 'audience-wholesalers',
    title: 'Wholesalers & Distributors',
    subtitle: 'Bulk Supply & Volume Orders',
    description: 'Source steady inventory of bundled bags, sacks, and film rolls for distribution to regional shops and local markets. Request pricing based on expected volume.',
    keyBenefits: [
      'Structured bulk enquiries to discuss volume requirements',
      'Transparent communication regarding batch availability',
      'Consistently extruded packaging lines for resale confidence',
    ],
    actionLabel: 'Inquire About Bulk Orders',
    actionHref: '/request-quote',
  },
  {
    id: 'audience-commercial',
    title: 'Commercial Businesses',
    subtitle: 'Industrial Sacks & Protective Films',
    description: 'Packaging for manufacturing plants, agricultural setups, and logistics operations. Find heavy-duty sacks, pallet wrapping film, and protective box liners.',
    keyBenefits: [
      'Heavy-gauge options designed for transit and moisture resistance',
      'Custom specification discussions for exact dimensions',
      'Dedicated quotation workflow for enterprise operations',
    ],
    actionLabel: 'Request Commercial Pricing',
    actionHref: '/request-quote',
  },
];
