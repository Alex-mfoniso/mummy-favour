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
      'Continuous plastic sheeting, shrink bundling films, pure water rolls, and protective films for industrial packaging.',
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
      'Bespoke bakery bags, branded shopping carriers, and tailored poly films with precision flexographic printing.',
    imageUrl: '/images/categories/custom-printed-nylon.jpg',
    displayOrder: 4,
    visibility: CategoryVisibility.VISIBLE,
  },
  {
    id: 'other-nylon-products',
    name: 'Other Nylon Products',
    slug: 'other-nylon-products',
    description:
      'Specialty agricultural mulch sheeting, protective drop films, and heavy-gauge construction membranes.',
    imageUrl: '/images/categories/other-nylon-products.jpg',
    displayOrder: 5,
    visibility: CategoryVisibility.VISIBLE,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: 'df-prod-001',
    name: 'Pharmacy bag',
    slug: 'retail-shopping-carrier-bags',
    categoryId: 'carrier-bags',
    shortDescription:
      'Reliable, tear-resistant punch-handle and loop-handle carrier bags for storefronts.',
    description:
      'Precision-extruded low-density carrier bags offering dependable tensile strength and neat presentation for retail shops, supermarkets, and boutique outlets. Engineered to carry diverse merchandise without bottom seam splitting.',
    mainImageUrl: '/images/products/carrier-bag-white-stack.jpg',
    galleryImageUrls: [
      '/images/products/wholesale-blue-carrier-bundles.jpg',
      '/images/products/wholesale-blue-bundles-dispatch.jpg',
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
      isProvisional: false,
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
    name: 'Flat white',
    slug: 'heavy-duty-industrial-sacks',
    categoryId: 'packaging-bags',
    shortDescription:
      'High-impact, puncture-resistant sacks for bulk materials, animal feed, and chemical packaging.',
    description:
      'Tough, co-extruded heavy-duty sacks formulated to endure abrasive grains, powders, fertilizers, and building materials. Built with enhanced seal security and drop resistance during warehouse staging and long-haul transit.',
    mainImageUrl: '/images/products/wholesale-dispatch-sacks.jpg',
    galleryImageUrls: [
      '/images/products/factory-raw-materials-polymer-rolls.jpg',
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
      isProvisional: false,
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
    name: 'Bread wrapper',
    slug: 'heat-shrink-bundling-film',
    categoryId: 'nylon-rolls-and-film',
    shortDescription:
      'Uniform-gauge bundling rolls and wrapping film for transit stability and automated packaging.',
    description:
      'Extruded polyethylene film wound on heavy-duty cores for automated bundling lines or heat tunnels. Yields uniform stretch recovery and barrier protection against ambient moisture, dust accumulation, and surface scuffing.',
    mainImageUrl: '/images/products/flexo-printed-film-rolls-rich-tea.jpg',
    galleryImageUrls: [
      '/images/products/industrial-black-nylon-rolls.jpg',
      '/images/products/extrusion-jumbo-nylon-rolls.jpg',
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
      isProvisional: false,
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
    name: 'Food-Grade Gusseted Liners',
    slug: 'food-grade-gusseted-liners',
    categoryId: 'packaging-bags',
    shortDescription:
      'Sanitary, moisture-barrier box and carton liners for bulk food and produce.',
    description:
      'Produced using compliant virgin polymer grades, these deep-gusseted liners protect dry ingredients, grains, bakery mixes, and agricultural harvest from external dust and moisture migration.',
    mainImageUrl: '/images/products/packaging-bags-4x7-bundles.jpg',
    galleryImageUrls: [
      '/images/products/packaging-bags-clear-stacks.jpg',
    ],
    featured: true,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Virgin Polypropylene (PP) / High-Clarity LDPE',
      material: 'Virgin Polypropylene (PP) / High-Clarity LDPE',
      thickness: '25 – 40 Microns',
      dimensions: ['15 x 25 cm', '20 x 30 cm', '25 x 40 cm', 'Custom Box Liners'],
      availableColors: ['Ultra-Clear Natural'],
      minOrderQuantity: '2,500 units',
      targetAudience: ['retailer', 'commercial', 'individual'],
      customizationOptions: ['Side Gusset for Expansion', 'Ventilation Micro-Punches', 'Adhesive Strip Seal'],
      isProvisional: false,
      specifications: [
        { label: 'Clarity Rating', value: 'High Gloss Optical Transparency' },
        { label: 'Thickness Range', value: '25 – 40 Microns' },
        { label: 'Resin Compliance', value: 'Virgin Food-Contact Grade' },
        { label: 'Sealing Compatibility', value: 'Impulse Heat Seal, Twist Ties, Tape Dispenser' },
      ],
    },
  },
  {
    id: 'df-prod-005',
    name: 'Foreign glass',
    slug: 'agricultural-mulch-greenhouse-films',
    categoryId: 'other-nylon-products',
    shortDescription:
      'UV-stabilized extruded agricultural film designed for moisture retention and weed control.',
    description:
      'Engineered specifically for crop protection, soil temperature moderation, and moisture conservation. Treated with active ultraviolet stabilizers to prevent premature breakdown under intense tropical sunlight.',
    mainImageUrl: '/images/products/nylon-rolls-sheeting-bundles.jpg',
    galleryImageUrls: [
      '/images/products/industrial-black-nylon-rolls.jpg',
    ],
    featured: true,
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
      isProvisional: false,
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
    name: 'shopping Bag',
    slug: 'custom-printed-packaging-nylon',
    categoryId: 'custom-printed-nylon',
    shortDescription:
      'Tailored flexographic-printed carrier bags and custom branded sheeting with sharp logos.',
    description:
      'End-to-end bespoke packaging solution from polymer recipe selection to spot-color printing. Perfect for established retail brands, corporate distributors, and promotional campaigns seeking memorable shelf presence.',
    mainImageUrl: '/images/products/custom-printed-ziks-diner.jpg',
    galleryImageUrls: [
      '/images/products/custom-printed-ziks-detail.jpg',
      '/images/products/custom-printed-vest-bag.jpg',
      '/images/products/custom-printed-nwanne-bakery.jpg',
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
      isProvisional: false,
      specifications: [
        { label: 'Print Capabilities', value: '1 to 4 Colors Flexographic Print, Front & Back' },
        { label: 'Plate Setup', value: 'Custom Photopolymer Stereo Plates' },
        { label: 'Lead Time', value: 'Estimated 7 – 14 working days from plate approval' },
        { label: 'Minimum Batch', value: '5,000 bags or 250 kg extrusion run' },
      ],
    },
  },
  {
    id: 'df-prod-007',
    name: 'Santana white',
    slug: 'industrial-stretch-wrap-pallet-film',
    categoryId: 'nylon-rolls-and-film',
    shortDescription:
      'High-yield cast stretch wrap for tight warehouse pallet stabilization and containment.',
    description:
      'Multi-layer cast stretch film engineered with high cling retention and tear resistance. Ensures pallet loads remain securely bound throughout freight transport, protecting contents against dust, dirt, and moisture.',
    mainImageUrl: '/images/products/extrusion-jumbo-nylon-rolls.jpg',
    galleryImageUrls: [
      '/images/products/factory-raw-materials-polymer-rolls.jpg',
    ],
    featured: true,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Cast Linear Low-Density Polyethylene (LLDPE)',
      material: 'Cast Linear Low-Density Polyethylene (LLDPE)',
      thickness: '17 – 25 Microns',
      dimensions: ['500 mm Width x 300 m Length'],
      availableColors: ['Clear Transparent', 'Opaque Black Security Grade'],
      minOrderQuantity: '1 Carton (6 Rolls)',
      targetAudience: ['commercial', 'distributor'],
      customizationOptions: ['Hand Application Rolls', 'Machine Stretch Core (Extended)'],
      isProvisional: false,
      specifications: [
        { label: 'Roll Dimensions', value: '500mm x 300m' },
        { label: 'Elongation Yield', value: 'Up to 250% stretch recovery' },
        { label: 'Cling Properties', value: 'Single-sided or double-sided cling' },
        { label: 'Core Weight', value: 'Reinforced paper core' },
      ],
    },
  },
  {
    id: 'df-prod-008',
    name: 'shopping Bag',
    slug: 'reinforced-punch-hole-boutique-bags',
    categoryId: 'carrier-bags',
    shortDescription:
      'Thick-walled carrier bags with patch-reinforced handles for boutique retail and fashion.',
    description:
      'Sophisticated retail packaging featuring welded patch reinforcement around the handle opening. Delivers higher load-bearing capacity without handle stretching, offering a premium feel for fashion and gift retailers.',
    mainImageUrl: '/images/products/carrier-bag-punch-hole-yellow.jpg',
    galleryImageUrls: [
      '/images/products/carrier-bag-punch-hole-white-back.jpg',
    ],
    featured: true,
    status: ProductAvailability.MADE_TO_ORDER,
    specifications: {
      materialGrade: 'Heavy-Gauge Virgin LDPE',
      material: 'Heavy-Gauge Virgin LDPE',
      thickness: '50 – 80 Microns',
      dimensions: [
        '30 x 40 cm (+ 6 cm Bottom Gusset)',
        '40 x 50 cm (+ 8 cm Bottom Gusset)',
      ],
      availableColors: ['Glossy White', 'Matte Charcoal', 'Emerald Forest', 'Custom Tint'],
      minOrderQuantity: '2,000 units',
      targetAudience: ['retailer', 'individual'],
      customizationOptions: ['Patch-Reinforced Handle', 'Bottom Expansion Gusset', 'Custom Tint Batching'],
      isProvisional: false,
      specifications: [
        { label: 'Handle Construction', value: 'Welded internal patch reinforcement' },
        { label: 'Thickness Range', value: '50 – 80 Microns' },
        { label: 'Gusset Style', value: 'Bottom expanding gusset' },
        { label: 'Texture', value: 'Glossy or satin smooth finish' },
      ],
    },
  },
  {
    id: 'df-prod-009',
    name: 'Printed Sachet Water Rolls (Pure Water Film)',
    slug: 'printed-sachet-water-rolls',
    categoryId: 'nylon-rolls-and-film',
    shortDescription:
      'High-clarity, leak-proof printed polythene film rolls for automated sachet water packaging.',
    description:
      'Engineered specifically for commercial water packaging factories across Nigeria. Formulated from 100% prime virgin food-contact grade LDPE for high tensile yield, puncture resistance, and seamless sealing on automatic Form-Fill-Seal (FFS) machines.',
    mainImageUrl: '/images/products/sachet-water-printed-rolls.jpg',
    galleryImageUrls: [
      '/images/products/flexo-printed-film-rolls-rich-tea.jpg',
      '/images/products/flexo-printed-film-rolls-love-bite.jpg',
    ],
    featured: true,
    status: ProductAvailability.IN_STOCK,
    specifications: {
      materialGrade: 'Virgin Food-Grade Low-Density Polyethylene (LDPE)',
      material: 'Virgin Food-Grade Low-Density Polyethylene (LDPE)',
      thickness: '50 – 75 Microns',
      dimensions: [
        'Roll Width: 320 mm (Standard Sachet Width)',
        'Roll Width: 330 mm',
        'Custom Micron Gauges on Request',
      ],
      availableColors: ['High-Clarity Natural with Custom Flexo Branding', 'Sky Blue Print', 'Deep Blue Print'],
      minOrderQuantity: '10 Rolls / 100 kg Batch',
      targetAudience: ['commercial', 'wholesaler', 'distributor'],
      customizationOptions: ['Bespoke Brand Logo & NAFDAC Flexo Print', 'Custom Roll Weights', 'UV Treated Film'],
      isProvisional: false,
      specifications: [
        { label: 'Application', value: 'Automated Form-Fill-Seal Sachet Water (Pure Water) Production' },
        { label: 'Standard Film Width', value: '320 mm / 330 mm' },
        { label: 'Gauge Range', value: '50 – 75 Microns (Pin-hole resistant)' },
        { label: 'Polymer Compliance', value: 'Food & Beverage Grade Odorless Virgin LDPE' },
        { label: 'Core Diameter', value: '76 mm (3 inches) standard paper core' },
        { label: 'Sealing Integrity', value: 'High thermal bond strength, zero leakage' },
      ],
    },
  },
  {
    id: 'df-prod-010',
    name: 'Custom Printed Bread & Bakery Packaging Bags',
    slug: 'custom-printed-bread-bakery-bags',
    categoryId: 'custom-printed-nylon',
    shortDescription:
      'Vibrant, food-contact approved printed polythene bread wrappers and bakery packaging bags.',
    description:
      'Tailored for commercial bakeries, confectioners, and food distributors. Manufactured with high-adhesion flexographic printing inks that resist smear, heat, and moisture, keeping loaves soft and visually appealing on retail shelves.',
    mainImageUrl: '/images/products/printed-bread-packaging-bags-maybell.jpg',
    galleryImageUrls: [
      '/images/products/custom-printed-bakery-bags-ngozika.jpg',
      '/images/products/custom-printed-poly-bags-frio.jpg',
      '/images/products/flexo-printed-film-rolls-love-bite.jpg',
    ],
    featured: true,
    status: ProductAvailability.CUSTOM_ORDER,
    specifications: {
      materialGrade: 'High-Clarity Food-Contact Polypropylene (PP) / Virgin LDPE',
      material: 'High-Clarity Food-Contact Polypropylene (PP) / Virgin LDPE',
      thickness: '25 – 45 Microns',
      dimensions: [
        '500g Loaf (18 x 35 cm)',
        '800g / 900g Family Loaf (20 x 42 cm)',
        '1kg Jumbo Loaf (22 x 45 cm)',
      ],
      availableColors: ['Full Brand Multi-Color Flexographic Printing'],
      minOrderQuantity: '5,000 units',
      targetAudience: ['commercial', 'wholesaler', 'retailer'],
      customizationOptions: ['Side Gusset for Loaf Expansion', 'Micro-Vent Perforations', 'Wicketed for Fast Packing', 'Twist-Tie Lip Extension'],
      isProvisional: false,
      specifications: [
        { label: 'Primary Use', value: 'Sliced Bread, Unsliced Loaves, Rolls & Confectioneries' },
        { label: 'Printing Technology', value: 'High-Definition Flexographic Printing (Up to 4 Colors)' },
        { label: 'Ink Safety', value: 'Toxics in Packaging Compliant / Odor-Free Bakery Inks' },
        { label: 'Barrier Features', value: 'Moisture retention to prevent premature staling' },
        { label: 'Closure Compatibility', value: 'Heat Seal, Tape Dispenser, Twist Ties, Kwik Lok clips' },
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
