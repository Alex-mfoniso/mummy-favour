import { prisma, disconnectDatabase } from '../lib/prisma.js';
import { CategoryVisibility, ProductAvailability, Prisma } from '@prisma/client';
import { businessSettingsRepository } from '../repositories/businessSettings.repository.js';

export const INITIAL_CATEGORIES = [
  {
    id: 'carrier-bags',
    name: 'Carrier Bags',
    slug: 'carrier-bags',
    description:
      'Punch-hole, loop-handle, and vest-style retail shopping bags engineered for dependable carrying strength.',
    imageUrl: '/images/categories/carrier-bags.jpg',
    displayOrder: 1,
    visibility: CategoryVisibility.VISIBLE,
  },
  {
    id: 'nylon-rolls-and-film',
    name: 'Nylon Rolls & Film',
    slug: 'nylon-rolls-and-film',
    description:
      'Continuous plastic sheeting, shrink bundling films, and protective rolls for industrial wrapping and agriculture.',
    imageUrl: '/images/categories/nylon-rolls-and-film.jpg',
    displayOrder: 2,
    visibility: CategoryVisibility.VISIBLE,
  },
  {
    id: 'packaging-bags',
    name: 'Packaging Bags',
    slug: 'packaging-bags',
    description:
      'Heavy-gauge sacks and gusseted container liners crafted to protect goods against dust, moisture, and abrasion.',
    imageUrl: '/images/categories/packaging-bags.jpg',
    displayOrder: 3,
    visibility: CategoryVisibility.VISIBLE,
  },
  {
    id: 'custom-printed-nylon',
    name: 'Custom Printed Nylon',
    slug: 'custom-printed-nylon',
    description:
      'Custom brand artwork and tailored bag gauges for retailers and corporate distributors, subject to production setup.',
    imageUrl: '/images/categories/custom-printed-nylon.jpg',
    displayOrder: 4,
    visibility: CategoryVisibility.VISIBLE,
  },
  {
    id: 'other-nylon-products',
    name: 'Other Nylon Products',
    slug: 'other-nylon-products',
    description:
      'Specialty poly liners, mulch sheeting, and specialty extruded films for agricultural and unique packing needs.',
    imageUrl: '/images/categories/other-nylon-products.jpg',
    displayOrder: 5,
    visibility: CategoryVisibility.VISIBLE,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'df-prod-001',
    name: 'Retail Shopping & Carrier Bags',
    slug: 'retail-shopping-carrier-bags',
    categoryId: 'carrier-bags',
    shortDescription:
      'Reliable, tear-resistant punch-handle and loop-handle carrier bags for storefronts.',
    description:
      'Precision-extruded low-density carrier bags offering dependable tensile strength and neat presentation for retail shops, supermarkets, and boutique outlets. Engineered to carry diverse merchandise without bottom seam splitting.',
    mainImageUrl: '/images/products/carrier-bag-white-stack.jpg',
    galleryImageUrls: [
      '/images/products/carrier-bag-punch-hole-yellow.jpg',
      '/images/products/wholesale-blue-carrier-bundles.jpg',
      '/images/products/carrier-bag-punch-hole-white-back.jpg',
    ],
    featured: true,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Virgin Low-Density Polyethylene (LDPE)',
      material: 'Virgin Low-Density Polyethylene (LDPE)',
      thickness: '35 – 65 Microns',
      dimensions: [
        'Small (25 x 35 cm)',
        'Medium (38 x 45 cm)',
        'Large (45 x 60 cm)',
      ],
      availableColors: ['Natural Translucent', 'Milky White', 'Custom Tint'],
      minOrderQuantity: '1,000 units',
      targetAudience: ['retailer', 'individual', 'wholesaler'],
      customizationOptions: ['Punch Hole Handle', 'Loop Handle', 'Vest Style', 'Flexo Print Option'],
      isProvisional: true,
      specifications: [
        { label: 'Handle Styles', value: 'Punch Hole, Loop Handle, Vest Carrier' },
        { label: 'Thickness Range', value: '35 – 65 Microns' },
        { label: 'Standard Sizes', value: 'Small (25x35cm), Medium (38x45cm), Large (45x60cm)' },
        { label: 'Color Formats', value: 'Natural Translucent, Milky White, Custom Tint' },
        { label: 'Polymer Type', value: '100% Recyclable LDPE Category 4' },
      ],
    },
  },
  {
    id: 'df-prod-002',
    name: 'Heavy-Duty Industrial Sacks',
    slug: 'heavy-duty-industrial-sacks',
    categoryId: 'packaging-bags',
    shortDescription:
      'High-impact, puncture-resistant sacks for bulk materials, animal feed, and chemical packaging.',
    description:
      'Tough, co-extruded heavy-duty sacks formulated to endure abrasive grains, powders, fertilizers, and building materials. Built with enhanced seal security and drop resistance during warehouse staging and long-haul transit.',
    mainImageUrl: '/images/products/wholesale-dispatch-sacks.jpg',
    galleryImageUrls: [
      '/images/products/raw-materials-indorama-polymer.jpg',
      '/images/products/wholesale-white-bag-stacks.jpg',
    ],
    featured: true,
    status: ProductAvailability.MADE_TO_ORDER,
    specifications: {
      materialGrade: 'High-Density Polyethylene (HDPE) Blend',
      material: 'High-Density Polyethylene (HDPE) Blend',
      thickness: '80 – 150 Microns',
      dimensions: ['50 x 80 cm', '60 x 90 cm', '65 x 105 cm'],
      availableColors: ['Opaque White', 'Black (UV Inhibited)', 'Yellow'],
      minOrderQuantity: '500 units',
      targetAudience: ['commercial', 'wholesaler', 'distributor'],
      customizationOptions: ['Gusseted Sides', 'Anti-Static Additive', 'UV Stabilizer', 'Micro-Perforation'],
      isProvisional: true,
      specifications: [
        { label: 'Load Capacity', value: 'Up to 50 kg per sack' },
        { label: 'Thickness Range', value: '80 – 150 Microns' },
        { label: 'Closure Method', value: 'Heat Sealable / Industrial Stitching' },
        { label: 'Additives Available', value: 'UV Stabilizers, Anti-Slip Surface Coating' },
      ],
    },
  },
  {
    id: 'df-prod-003',
    name: 'Industrial Shrink & Packaging Film Rolls',
    slug: 'industrial-shrink-packaging-film-rolls',
    categoryId: 'nylon-rolls-and-film',
    shortDescription:
      'Uniform-gauge bundling rolls and pallet wrapping film for transit stability and warehouse hygiene.',
    description:
      'Extruded polyethylene film wound on heavy-duty cores for automated bundling lines or manual pallet wrap. Yields uniform stretch recovery and barrier protection against ambient moisture, dust accumulation, and surface scuffing.',
    mainImageUrl: '/images/products/industrial-black-nylon-rolls.jpg',
    galleryImageUrls: [
      '/images/products/nylon-rolls-sheeting-bundles.jpg',
      '/images/products/wholesale-dispatch-sacks.jpg',
    ],
    featured: true,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Linear Low-Density Polyethylene (LLDPE)',
      material: 'Linear Low-Density Polyethylene (LLDPE)',
      thickness: '20 – 50 Microns',
      dimensions: ['Width: 450 mm', 'Width: 500 mm', 'Width: 1000 mm'],
      availableColors: ['Clear Transparent', 'Black Opaque'],
      minOrderQuantity: '10 rolls',
      targetAudience: ['commercial', 'wholesaler', 'distributor'],
      customizationOptions: ['Core Diameter Sizing', 'Machine Grade High-Elongation', 'Corona Treated Surface'],
      isProvisional: true,
      specifications: [
        { label: 'Film Widths', value: '450mm, 500mm, 1000mm, 1200mm' },
        { label: 'Gauge Range', value: '20 – 50 Microns' },
        { label: 'Core Diameter', value: '50mm / 76mm Industrial Paper Core' },
        { label: 'Cling Type', value: 'One-side cling / Two-side cling' },
      ],
    },
  },
  {
    id: 'df-prod-004',
    name: 'High-Clarity Bakery & Food Grade Bags',
    slug: 'high-clarity-bakery-food-grade-bags',
    categoryId: 'packaging-bags',
    shortDescription:
      'Odor-free, ultra-clear poly bags tailored for baked loaves, snacks, and dry foodstuff presentation.',
    description:
      'Manufactured from food-contact-approved prime virgin resin. These crystal-clear poly bags keep crusts crisp and display foodstuffs cleanly on retail shelving while shielding content from airborne contamination.',
    mainImageUrl: '/images/products/packaging-bags-4x7-bundles.jpg',
    galleryImageUrls: [
      '/images/products/packaging-bags-clear-stacks.jpg',
      '/images/products/custom-printed-nwanne-bakery.jpg',
    ],
    featured: false,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Virgin Polypropylene (PP) / High-Clarity LDPE',
      material: 'Virgin Polypropylene (PP) / High-Clarity LDPE',
      thickness: '25 – 40 Microns',
      dimensions: ['15 x 25 cm', '20 x 30 cm', '25 x 40 cm', 'Custom Loaf Size'],
      availableColors: ['Ultra-Clear Natural'],
      minOrderQuantity: '2,500 units',
      targetAudience: ['retailer', 'commercial', 'individual'],
      customizationOptions: ['Side Gusset for Loaf Expansion', 'Ventilation Micro-Punches', 'Adhesive Strip Seal'],
      isProvisional: true,
      specifications: [
        { label: 'Clarity Rating', value: 'High Gloss Optical Transparency' },
        { label: 'Thickness Range', value: '25 – 40 Microns' },
        { label: 'Resin Compliance', value: 'Virgin FDA Food-Contact Grade Equivalent' },
        { label: 'Sealing Compatibility', value: 'Impulse Heat Seal, Twist Ties, Tape Dispenser' },
      ],
    },
  },
  {
    id: 'df-prod-005',
    name: 'Agricultural Mulch & Greenhouse Sheeting',
    slug: 'agricultural-mulch-greenhouse-sheeting',
    categoryId: 'other-nylon-products',
    shortDescription:
      'UV-stabilized extruded agricultural film designed for moisture retention and weed control.',
    description:
      'Engineered specifically for crop protection, soil temperature moderation, and moisture conservation. Treated with active ultraviolet stabilizers to prevent premature breakdown under intense tropical sunlight.',
    mainImageUrl: '/images/products/nylon-rolls-sheeting-bundles.jpg',
    galleryImageUrls: [
      '/images/products/industrial-black-nylon-rolls.jpg',
      '/images/products/raw-materials-indorama-polymer.jpg',
    ],
    featured: false,
    status: ProductAvailability.MADE_TO_ORDER,
    specifications: {
      materialGrade: 'LLDPE / LDPE Agricultural Grade Blend',
      material: 'LLDPE / LDPE Agricultural Grade Blend',
      thickness: '40 – 120 Microns',
      dimensions: ['Width: 1.0 m', 'Width: 1.2 m', 'Width: 2.0 m', 'Roll Length: 200 – 500 m'],
      availableColors: ['Black / Silver Reflective', 'Solid Black', 'Transparent Clear'],
      minOrderQuantity: '5 rolls',
      targetAudience: ['commercial', 'distributor'],
      customizationOptions: ['Pre-Punched Planting Holes', 'UV Exposure Rating (6 - 12 Months)', 'Center Fold Sheeting'],
      isProvisional: true,
      specifications: [
        { label: 'UV Lifespan Rating', value: 'Up to 12 Months Continuous Tropical Exposure' },
        { label: 'Standard Widths', value: '1.0m, 1.2m, 1.5m, 2.0m' },
        { label: 'Thickness Range', value: '40 – 120 Microns' },
        { label: 'Opacity', value: 'Total Block (Black) / High PAR Transmission (Clear)' },
      ],
    },
  },
  {
    id: 'df-prod-006',
    name: 'Bespoke Branded Packaging Nylon',
    slug: 'bespoke-branded-packaging-nylon',
    categoryId: 'custom-printed-nylon',
    shortDescription:
      'Tailored flexographic-printed carrier bags and custom branded sheeting with sharp logos.',
    description:
      'End-to-end bespoke packaging solution from polymer recipe selection to spot-color printing. Perfect for established retail brands, corporate distributors, and promotional campaigns seeking memorable shelf presence.',
    mainImageUrl: '/images/products/custom-printed-ziks-diner.jpg',
    galleryImageUrls: [
      '/images/products/custom-printed-ziks-detail.jpg',
      '/images/products/custom-printed-nwanne-bakery.jpg',
      '/images/products/custom-printed-vest-bag.jpg',
    ],
    featured: true,
    status: ProductAvailability.CUSTOM_ORDER,
    specifications: {
      materialGrade: 'Virgin LDPE or HDPE depending on strength requirements',
      material: 'Virgin LDPE or HDPE depending on strength requirements',
      thickness: 'Tailored 40 – 100 Microns',
      dimensions: ['Customized to client merchandise specifications'],
      availableColors: ['Custom Base Tint + 1 to 4 Spot Printing Colors'],
      minOrderQuantity: '5,000 units / 250 kg production batch minimum',
      targetAudience: ['commercial', 'wholesaler', 'retailer'],
      customizationOptions: ['Flexographic Print up to 4 Colors', 'Custom Die-Cut Handle', 'Reinforced Patch Handle'],
      isProvisional: true,
      specifications: [
        { label: 'Print Capabilities', value: '1 to 4 Colors Flexographic Print, Front & Back' },
        { label: 'Plate Setup', value: 'Custom Photopolymer Stereo Plates' },
        { label: 'Lead Time', value: 'Estimated 7 – 14 working days from plate approval' },
        { label: 'Minimum Batch', value: '5,000 bags or 250 kg extrusion run' },
      ],
    },
  },
];

export async function seedDatabase(): Promise<{
  categoriesCount: number;
  productsCount: number;
}> {
  console.log('[Seed] Seeding categories...');
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
        visibility: cat.visibility,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        displayOrder: cat.displayOrder,
        visibility: cat.visibility,
      },
    });
  }

  console.log('[Seed] Seeding products...');
  for (const prod of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        categoryId: prod.categoryId,
        shortDescription: prod.shortDescription,
        description: prod.description,
        mainImageUrl: prod.mainImageUrl,
        galleryImageUrls: prod.galleryImageUrls,
        featured: prod.featured,
        status: prod.status,
        specifications: prod.specifications as Prisma.InputJsonValue,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        categoryId: prod.categoryId,
        shortDescription: prod.shortDescription,
        description: prod.description,
        mainImageUrl: prod.mainImageUrl,
        galleryImageUrls: prod.galleryImageUrls,
        featured: prod.featured,
        status: prod.status,
        specifications: prod.specifications as Prisma.InputJsonValue,
      },
    });
  }

  console.log('[Seed] Seeding business settings singleton...');
  await businessSettingsRepository.getSettings();

  const categoriesCount = await prisma.category.count();
  const productsCount = await prisma.product.count();

  console.log(`[Seed] Completed. Total Categories: ${categoriesCount}, Total Products: ${productsCount}, Settings: Ready`);
  return { categoriesCount, productsCount };
}

// Direct execution when run via `node` or `tsx`
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await disconnectDatabase();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Seed Error]', err);
      await disconnectDatabase();
      process.exit(1);
    });
}
