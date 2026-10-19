import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Layers, 
  MessageSquare, 
  PackageCheck, 
  PhoneCall, 
  CheckCircle, 
  HelpCircle, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductCard } from '@/components/ui/ProductCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';
import { ProductCategory, Product } from '@/types';
import { fetchPublicCategories } from '@/services/categoryService';
import { fetchPublicProducts } from '@/services/productService';

import { AUDIENCE_SEGMENTS } from '@/data/audience';
import { WHY_DIVINE_FAVOUR_PILLARS } from '@/data/whyUs';
import { GET_STARTED_STEPS } from '@/data/processSteps';

export const HomePage: React.FC = () => {
  const { settings } = useBusinessSettings();
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(true);
  const [categoriesError, setCategoriesError] = React.useState<string | null>(null);
  const [productsError, setProductsError] = React.useState<string | null>(null);

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

  const loadFeaturedProducts = React.useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      // First try fetching featured products
      const res = await fetchPublicProducts({ featured: true, limit: 6 });
      if (res.products && res.products.length > 0) {
        setFeaturedProducts(res.products);
      } else {
        // Fallback to recent products if none marked featured
        const allRes = await fetchPublicProducts({ limit: 6 });
        setFeaturedProducts(allRes.products || []);
      }
    } catch (err: any) {
      setProductsError('Unable to load featured products. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
    loadFeaturedProducts();
  }, [loadCategories, loadFeaturedProducts]);

  useEffect(() => {
    document.title = settings.metaTitle || `${settings.businessName} - Quality Packaging. Reliable Supply.`;
    if (settings.metaDescription) {
      let metaDescTag = document.querySelector('meta[name="description"]');
      if (!metaDescTag) {
        metaDescTag = document.createElement('meta');
        metaDescTag.setAttribute('name', 'description');
        document.head.appendChild(metaDescTag);
      }
      metaDescTag.setAttribute('content', settings.metaDescription);
    }
  }, [settings.metaTitle, settings.metaDescription, settings.businessName]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 sm:pb-24">
      {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
      <section aria-labelledby="hero-heading" className="pt-6 sm:pt-10">
        <Container size="xl">
          <div className="bg-white border border-[#D8D5CB] rounded-lg overflow-hidden shadow-subtle grid grid-cols-1 lg:grid-cols-12 items-stretch animate-fade-slide-up">
            {/* Left Content Column */}
            <div className="p-8 sm:p-12 lg:p-14 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <StatusBadge variant="forest" size="sm">
                    Nylon Manufacturing & Packaging
                  </StatusBadge>
                  <span className="text-xs font-semibold text-[#5C635F] tracking-wide">
                    {settings.businessName}
                  </span>
                </div>

                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#252A27] leading-[1.12]"
                >
                  Packaging Solutions Made for Your Business.
                </h1>

                <p className="mt-5 text-base sm:text-lg text-[#5C635F] leading-relaxed max-w-xl">
                  {settings.shortDescription || `Discover nylon packaging solutions for everyday needs and commercial orders. Explore our product range and contact ${settings.businessName} for pricing and availability.`}
                </p>

                {/* Tagline reassurance badge */}
                <div className="mt-6 pt-6 border-t border-[#E6E4DD] flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                    Brand Promise:
                  </span>
                  <span className="text-xs font-medium text-[#246B45] bg-[#EAF3ED] px-3 py-1 rounded-sm border border-[#BADBC5]">
                    {settings.tagline}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link to="/products">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.2]" />}
                  >
                    Explore Products
                  </Button>
                </Link>

                <Link to="/request-quote">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    className="border-2 border-[#246B45] text-[#17472D] font-bold bg-[#EAF3ED]/60 hover:bg-[#EAF3ED] hover:text-[#0F301E] shadow-2xs"
                    rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.2]" />}
                  >
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="lg:col-span-5 bg-[#FAF9F6] border-t lg:border-t-0 lg:border-l border-[#D8D5CB] relative flex flex-col justify-between p-6 sm:p-8">
              <Link to="/products/heavy-duty-industrial-sacks" className="group block relative rounded-md overflow-hidden border border-[#D8D5CB] shadow-subtle hover:border-[#246B45] transition-colors">
                <OptimizedImage
                  src="/images/products/wholesale-dispatch-sacks.jpg"
                  alt="Heavy-Duty Industrial Sacks manufactured and staged by Divine Favour"
                  aspectRatio="portrait"
                  fallbackLabel="Heavy-Duty Industrial Sacks"
                  category="Heavy-Duty Sacks"
                  provisionalNote="Authentic Factory Production"
                  className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Editorial Caption / Clarification Note */}
              <div className="mt-4 p-3 bg-white border border-[#E6E4DD] rounded text-[11px] text-[#5C635F] leading-relaxed flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#246B45] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Featured Product: <strong className="text-[#252A27]">Heavy-Duty Industrial Sacks</strong> — high-gauge reinforced nylon sacks engineered for bulk dispatch and heavy transit.
                  </span>
                </div>
                <Link
                  to="/products/heavy-duty-industrial-sacks"
                  className="shrink-0 text-xs font-semibold text-[#246B45] hover:underline flex items-center gap-1 mt-0.5"
                >
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          2. PRODUCT CATEGORY SHOWCASE
          ========================================================================= */}
      <section aria-labelledby="category-showcase-heading">
        <Container size="xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <SectionHeading
              eyebrow="Range Overview"
              title="Explore Our Product Range"
              description="Find packaging options for different needs, from everyday use to commercial supply."
              className="mb-0"
            />

            <Link to="/products" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2]" />}
              >
                View Full Catalogue
              </Button>
            </Link>
          </div>

          {/* Asymmetric / Balanced Editorial Category Grid */}
          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Loading categories">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg p-6 h-64 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-28" />
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
              <p className="text-sm text-[#5C635F]">No product categories currently published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  featured={index === 0}
                />
              ))}
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-[#88918C]">
              Note: Explore our verified product lines structured for catalog browsing. Final product specs are confirmed on quote request.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          3. COMPANY INTRODUCTION
          ========================================================================= */}
      <section aria-labelledby="company-intro-heading">
        <Container size="xl">
          <div className="bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg p-8 sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Editorial Photo */}
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="relative rounded-md overflow-hidden border border-[#D8D5CB] shadow-subtle">
                  <OptimizedImage
                    src="/images/products/packaging-bags-4x7-bundles.jpg"
                    alt="Divine Favour commercial packaging poly bags bundled for retail distribution"
                    aspectRatio="portrait"
                    fallbackLabel="Manufacturing Operation"
                    category="Operation"
                    provisionalNote="Authentic Factory Staging"
                    className="w-full h-[320px] sm:h-[380px] object-cover"
                  />
                </div>
              </div>

              {/* Right Column: Introduction Narrative */}
              <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-1 rounded-sm">
                    About {settings.businessName}
                  </span>
                  <h2
                    id="company-intro-heading"
                    className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-[#252A27]"
                  >
                    Packaging That Works for Your Business
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-[#3A403C] leading-relaxed">
                  <p>
                    {settings.businessName} provides nylon packaging solutions for customers with different needs. Whether you are purchasing for everyday use or sourcing for a business, our team is available to help you explore suitable options and request pricing.
                  </p>
                  <p className="text-xs sm:text-sm text-[#5C635F]">
                    From retail store carrier bags to heavy-duty industrial sacks, packaging is fundamental to keeping products protected, clean, and ready for transit. We focus on practical, consistent nylon production with direct, accessible customer communication.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link to="/about">
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4 stroke-[2]" />}
                    >
                      Read Company Overview
                    </Button>
                  </Link>

                  <Link to="/contact">
                    <Button variant="ghost" size="md">
                      Speak With Our Team
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          4. WHO WE SERVE
          ========================================================================= */}
      <section aria-labelledby="who-we-serve-heading">
        <Container size="xl">
          <SectionHeading
            eyebrow="Target Audience"
            title="Who We Serve"
            description="Our product range is organized to assist distinct types of buyers, from storefront retailers to volume distributors."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AUDIENCE_SEGMENTS.map((segment) => (
              <div
                key={segment.id}
                className="bg-white border border-[#D8D5CB] rounded-md p-6 flex flex-col justify-between hover:border-[#246B45] hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#246B45]">
                    {segment.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-[#252A27] mt-1 mb-2.5">
                    {segment.title}
                  </h3>
                  <p className="text-xs text-[#5C635F] leading-relaxed mb-4">
                    {segment.description}
                  </p>

                  <ul className="space-y-2 pt-3 border-t border-[#E6E4DD] text-[11px] text-[#3A403C]">
                    {segment.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#246B45] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E4DD]">
                  <Link
                    to={segment.actionHref}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#246B45] hover:text-[#1D5838] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                  >
                    <span>{segment.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          5. WHY DIVINE FAVOUR
          ========================================================================= */}
      <section aria-labelledby="why-us-heading">
        <Container size="xl">
          <SectionHeading
            eyebrow="Customer Experience"
            title={`Why Contact ${settings.businessName}`}
            description="Our service approach is built around clarity, direct communication, and flexible enquiry support."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_DIVINE_FAVOUR_PILLARS.map((pillar, index) => {
              const icons = [
                <Layers key="layers" className="w-5 h-5 text-[#246B45]" />,
                <MessageSquare key="msg" className="w-5 h-5 text-[#246B45]" />,
                <PackageCheck key="pkg" className="w-5 h-5 text-[#246B45]" />,
                <PhoneCall key="phone" className="w-5 h-5 text-[#246B45]" />,
              ];

              return (
                <div
                  key={pillar.id}
                  className="bg-white border border-[#D8D5CB] rounded-md p-6 flex flex-col justify-between hover:border-[#246B45] hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div>
                    <div className="w-10 h-10 rounded-md bg-[#EAF3ED] flex items-center justify-center mb-4">
                      {icons[index % icons.length]}
                    </div>
                    <h3 className="text-base font-bold text-[#252A27] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E6E4DD] text-[11px] text-[#88918C]">
                    {pillar.context}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          6. HOW TO GET STARTED
          ========================================================================= */}
      <section aria-labelledby="how-it-works-heading">
        <Container size="xl">
          <div className="bg-white border border-[#D8D5CB] rounded-lg p-8 sm:p-12 shadow-subtle">
            <SectionHeading
              eyebrow="Order Sequence"
              title="How to Get Started"
              description="A straightforward three-step process to explore products and initiate a quotation request."
              className="mb-10"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {GET_STARTED_STEPS.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  className="relative flex flex-col justify-between p-6 rounded-md bg-[#FAF9F6] border border-[#E6E4DD]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-extrabold text-[#246B45] font-mono">
                        {step.stepNumber}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#88918C]">
                        Step {idx + 1}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#252A27] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#5C635F] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {step.actionHref && step.actionLabel && (
                    <div className="mt-6 pt-4 border-t border-[#E6E4DD]">
                      <Link
                        to={step.actionHref}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:text-[#1D5838] hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
                      >
                        <span>{step.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#E6E4DD] flex items-center gap-2 text-xs text-[#5C635F]">
              <HelpCircle className="w-4 h-4 text-[#246B45] shrink-0" aria-hidden="true" />
              <span>
                Need guidance on bag thicknesses or sizes? Our quotation form includes fields to describe your exact use case.
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          7. FEATURED PRODUCTS OR PRODUCT PREVIEW
          ========================================================================= */}
      <section aria-labelledby="featured-preview-heading">
        <Container size="xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <SectionHeading
              eyebrow="Sample Preview"
              title="Featured Packaging Items"
              description="Preview select nylon items to inspect typical formats and submit price inquiries."
              className="mb-0"
            />

            <Link to="/products" className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 stroke-[2]" />}
              >
                Browse All Products
              </Button>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading featured products">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg p-6 h-80 flex flex-col justify-between">
                  <div className="h-44 bg-gray-200 rounded-md w-full mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : productsError && featuredProducts.length === 0 ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
                <AlertCircle className="w-5 h-5" />
                <span>{productsError}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadFeaturedProducts}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry Loading Products
              </Button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="p-8 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg text-center space-y-3">
              <p className="text-sm text-[#5C635F]">No featured products available at this time.</p>
              <Link to="/products">
                <Button variant="outline" size="sm">
                  Browse All Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showRequestPrice={true}
                />
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <span className="text-xs text-[#88918C]">
              Product specifications shown above are representative samples. Exact order minimums, thicknesses, and availability will be quoted upon enquiry.
            </span>
          </div>
        </Container>
      </section>

      {/* =========================================================================
          8. FINAL CALL TO ACTION
          ========================================================================= */}
      <section aria-labelledby="final-cta-heading">
        <Container size="xl">
          <div className="bg-[#246B45] text-white rounded-lg p-8 sm:p-14 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-card">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#BADBC5] bg-white/10 px-3 py-1 rounded-sm mb-3">
                Get in Touch
              </span>
              <h2
                id="final-cta-heading"
                className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-snug"
              >
                Looking for the Right Nylon for Your Business?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#D3E6DA] leading-relaxed">
                Tell us what you need and let us help you explore the available options. Submit a quote request or contact our team to discuss your packaging schedule.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full sm:w-auto">
              <Link to="/request-quote" className="w-full sm:w-auto">
                <Button
                  variant="white"
                  size="lg"
                  fullWidth
                  className="text-[#1B1F1C] font-bold shadow-md hover:bg-[#F5F4EF]"
                  rightIcon={<ArrowRight className="w-4 h-4 stroke-[2.2]" />}
                >
                  Request a Quote
                </Button>
              </Link>

              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="border-2 border-white text-white hover:bg-white/15 font-semibold"
                >
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
