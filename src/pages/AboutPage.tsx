import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Store, 
  Boxes, 
  Factory, 
  User, 
  Search, 
  FileText, 
  Sliders, 
  MessageSquare,
  Sparkles,
  Info,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ProductCategory } from '@/types';
import { fetchPublicCategories } from '@/services/categoryService';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useBusinessSettings();
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState<boolean>(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);

  const loadCategories = React.useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError(null);
    try {
      const data = await fetchPublicCategories();
      setCategories(data);
    } catch (err: any) {
      setCategoriesError('Unable to load categories. Please check your connection and try again.');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Page SEO title
  useEffect(() => {
    document.title = `About Us | ${settings.businessName} - Nylon Manufacturing & Packaging`;
  }, [settings.businessName]);

  // Audience Profiles
  const audiences = [
    {
      title: 'Individual Buyers',
      icon: <User className="w-5 h-5 text-[#246B45]" />,
      description: 'Individuals requiring dependable plastic bags, home packaging supplies, or small-quantity carrier bags for events and personal use.',
      howToEnquire: 'Browse standard sizes in our catalogue or submit a simple enquiry to confirm available stock.',
      link: '/products',
      ctaText: 'Browse Standard Products',
    },
    {
      title: 'Retailers & Shop Owners',
      icon: <Store className="w-5 h-5 text-[#246B45]" />,
      description: 'Supermarkets, boutiques, food vendors, and retail shops looking for consistent day-to-day shopping bags with dependable carry strength.',
      howToEnquire: 'Review handle styles (punch-hole, loop, vest) and enquire about recurring store supply or custom logo printing.',
      link: '/products?category=carrier-bags',
      ctaText: 'Explore Retail Bags',
    },
    {
      title: 'Wholesalers & Distributors',
      icon: <Boxes className="w-5 h-5 text-[#246B45]" />,
      description: 'Stockists, packaging depots, and regional distributors purchasing bundled cartons, high-volume bales, and commercial rolls.',
      howToEnquire: 'Use our quotation form to specify target volume brackets and discuss delivery arrangements.',
      link: '/request-quote',
      ctaText: 'Request Wholesale Quote',
    },
    {
      title: 'Commercial & Industrial Enterprises',
      icon: <Factory className="w-5 h-5 text-[#246B45]" />,
      description: 'Manufacturing plants, agricultural farms, and logistics hubs requiring heavy-gauge sacks, liner films, mulch sheeting, or pallet stretch wraps.',
      howToEnquire: 'Provide required micron thickness, dimensions, or barrier properties to explore suitable extrusion formulations.',
      link: '/request-quote?custom=true',
      ctaText: 'Discuss Industrial Specs',
    },
  ];

  // Our Grounded Approach
  const approachPillars = [
    {
      icon: <Search className="w-5 h-5 text-[#246B45]" />,
      title: 'Helping Customers Explore Packaging Options',
      description: 'We organize our nylon packaging into clear product categories and technical dimensions so you can identify suitable options for your products.',
    },
    {
      icon: <FileText className="w-5 h-5 text-[#246B45]" />,
      title: 'Providing Clear Quantity & Specification Enquiries',
      description: 'Through our quotation builder, you can submit estimated quantities, sizes, and thicknesses without navigating complicated checkout forms.',
    },
    {
      icon: <Sliders className="w-5 h-5 text-[#246B45]" />,
      title: 'Supporting Custom Requirements Where Available',
      description: 'If standard sizes do not fit your exact goods, we evaluate custom roll widths, gauge specifications, and flexographic brand printing possibilities.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-[#246B45]" />,
      title: 'Making Direct Communication Straightforward',
      description: 'We prioritize prompt, direct communication through WhatsApp and telephone channels to confirm availability and discuss pricing transparently.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* =========================================================================
          1. BREADCRUMBS & HERO SECTION
          ========================================================================= */}
      <section aria-labelledby="about-hero-heading">
        <Container size="xl">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5C635F] mb-6">
            <Link
              to="/"
              className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#88918C]" aria-hidden="true" />
            <span className="font-semibold text-[#252A27]" aria-current="page">
              About Us
            </span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-3 py-1 rounded-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ABOUT {settings.businessName.toUpperCase()}</span>
            </span>

            <h1
              id="about-hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#252A27] leading-[1.15]"
            >
              Packaging Solutions for Everyday Business Needs
            </h1>

            <p className="text-base sm:text-lg text-[#5C635F] leading-relaxed pt-2">
              {settings.shortDescription || `${settings.businessName} provides nylon packaging options for individuals and businesses seeking practical solutions for their packaging needs.`}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3.5">
              <Link to="/products">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Our Products
                </Button>
              </Link>

              <Link to="/request-quote">
                <Button variant="outline" size="md">
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. BUSINESS INTRODUCTION & INDUSTRY CONTEXT
          ========================================================================= */}
      <section aria-labelledby="business-intro-heading" className="bg-[#FAF9F6] border-y border-[#E6E4DD] py-14 sm:py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
                Who We Are
              </span>
              <h2
                id="business-intro-heading"
                className="text-2xl sm:text-3xl font-bold text-[#252A27] tracking-tight leading-snug"
              >
                Practical, Reliable Flexible Packaging for Modern Commerce
              </h2>
              
              <div className="space-y-4 text-sm sm:text-base text-[#3A403C] leading-relaxed">
                {settings.fullDescription ? (
                  <p className="whitespace-pre-line">{settings.fullDescription}</p>
                ) : (
                  <>
                    <p>
                      At {settings.businessName}, we focus on producing and supplying polyethylene nylon packaging materials designed for everyday resilience. In everyday retail, commercial warehousing, and regional distribution, dependable packaging is essential. It protects merchandise from moisture and dust, prevents accidental punctures, and ensures goods reach customers in good condition.
                    </p>
                    <p>
                      Choosing the right packaging specification makes a meaningful difference to operational efficiency. A retail shopping bag requires comfortable handles and balanced tear resistance, while an industrial liner or agricultural mulch film demands specific polymer thickness and barrier protection.
                    </p>
                    <p>
                      We aim to make packaging sourcing clear and straightforward. Whether you are an independent shopkeeper purchasing regular carrier bags or a commercial buyer planning a bulk shipment, we work to provide reliable specifications and accessible customer communication.
                    </p>
                  </>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#5C635F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
                  <span>Verified Material Specifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
                  <span>Direct Communication via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#246B45] shrink-0" />
                  <span>Tailored Orders for Retail & Bulk Buyers</span>
                </div>
              </div>
            </div>

            {/* Right Industrial Specimen Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-lg overflow-hidden border border-[#D8D5CB] shadow-subtle bg-white">
                <OptimizedImage
                  src="/images/products/nylon-rolls-sheeting-bundles.jpg"
                  alt="Continuous nylon sheeting rolls and retail carrier bag bundles manufactured at Divine Favour"
                  aspectRatio="landscape"
                  className="w-full object-cover"
                />
                <div className="p-4 sm:p-5 bg-white border-t border-[#E6E4DD] space-y-1">
                  <span className="text-xs font-bold text-[#252A27] block">
                    Quality Packaging. Reliable Supply.
                  </span>
                  <p className="text-xs text-[#5C635F]">
                    Extruded polyethylene films and finished bags tailored for durable commercial handling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. WHAT WE OFFER (CENTRALIZED PRODUCT CATEGORIES)
          ========================================================================= */}
      <section aria-labelledby="what-we-offer-heading">
        <Container size="xl">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Product Offering
            </span>
            <h2
              id="what-we-offer-heading"
              className="text-2xl sm:text-3xl font-bold text-[#252A27] tracking-tight"
            >
              What We Offer
            </h2>
            <p className="text-sm sm:text-base text-[#5C635F]">
              Explore our primary nylon packaging lines. Specifications and availability can be confirmed directly with our team.
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading categories">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-[#D8D5CB] rounded-lg p-5 h-72 flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-gray-200 rounded w-full mb-3" />
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesError && categories.length === 0 ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
                <AlertCircle className="w-5 h-5" />
                <span>{categoriesError}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCategories}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry Loading Categories
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg text-center">
              <p className="text-sm text-[#5C635F]">No categories available at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-[#D8D5CB] rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#246B45] hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 ease-out shadow-subtle group"
                >
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF9F6]">
                      <OptimizedImage
                        src={category.image}
                        alt={category.imageAlt}
                        aspectRatio="wide"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {category.isProvisional && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#5C635F] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-[#D8D5CB]">
                          {category.badge || 'Provisional Category'}
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 space-y-2.5">
                      <h3 className="text-lg font-bold text-[#252A27] group-hover:text-[#246B45] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                        {category.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-[#F5F4EF]">
                    <Link
                      to={`/products?category=${category.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                    >
                      <span>Explore {category.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Transparent note about category confirmation */}
          <div className="mt-8 p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-xs text-[#5C635F] flex items-start gap-2.5 max-w-2xl">
            <Info className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Product lines marked as provisional represent standard manufacturing classifications currently offered or scheduled for initial production runs. Please confirm current batch availability with our sales desk.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. WHO WE SERVE (AUDIENCE SEGMENTS)
          ========================================================================= */}
      <section aria-labelledby="who-we-serve-heading" className="bg-[#FAF9F6] border-y border-[#E6E4DD] py-14 sm:py-20">
        <Container size="xl">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Customer Types
            </span>
            <h2
              id="who-we-serve-heading"
              className="text-2xl sm:text-3xl font-bold text-[#252A27] tracking-tight"
            >
              Who We Serve
            </h2>
            <p className="text-sm sm:text-base text-[#5C635F]">
              Different packaging requirements require different approaches. Here is how we support various customer categories:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audiences.map((aud) => (
              <div
                key={aud.title}
                className="bg-white border border-[#D8D5CB] p-6 sm:p-8 rounded-lg shadow-subtle flex flex-col justify-between space-y-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-md bg-[#EAF3ED] flex items-center justify-center">
                    {aud.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#252A27]">
                    {aud.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3A403C] leading-relaxed">
                    {aud.description}
                  </p>
                  <div className="pt-2 text-xs text-[#5C635F] border-t border-[#E6E4DD]">
                    <strong className="text-[#252A27]">How to enquire: </strong>
                    {aud.howToEnquire}
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={aud.link}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {aud.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. OUR APPROACH (GROUNDED STATEMENTS)
          ========================================================================= */}
      <section aria-labelledby="our-approach-heading">
        <Container size="xl">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45]">
              Core Principles
            </span>
            <h2
              id="our-approach-heading"
              className="text-2xl sm:text-3xl font-bold text-[#252A27] tracking-tight"
            >
              Our Customer-Facing Approach
            </h2>
            <p className="text-sm sm:text-base text-[#5C635F]">
              We keep our service straightforward, practical, and focused on clear communication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {approachPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45]"
              >
                <div className="w-10 h-10 rounded-md bg-[#EAF3ED] flex items-center justify-center mb-1">
                  {pillar.icon}
                </div>
                <h3 className="text-sm font-bold text-[#252A27] leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#5C635F] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          6. CLOSING CALL-TO-ACTION (CTA)
          ========================================================================= */}
      <section aria-labelledby="closing-cta-heading" className="bg-[#246B45] text-white py-14 sm:py-16">
        <Container size="xl">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D3E6DA]">
              GET IN TOUCH
            </span>
            <h2
              id="closing-cta-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white"
            >
              Looking for the Right Packaging?
            </h2>
            <p className="text-sm sm:text-base text-[#D3E6DA] leading-relaxed max-w-2xl">
              Explore our available products or contact {settings.businessName} to discuss what you need.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3.5">
              <Link to="/products">
                <Button
                  variant="white"
                  size="md"
                  className="text-[#1B1F1C] font-bold shadow-md hover:bg-[#F5F4EF]"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Products
                </Button>
              </Link>

              <Link to="/request-quote">
                <Button
                  variant="outline"
                  size="md"
                  className="border-white text-white hover:bg-[#1B5335]"
                >
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
