import React, { useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Calculator, 
  HelpCircle, 
  PhoneCall, 
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { QuoteRequestForm } from '@/components/quote';
import { Product } from '@/types';
import { fetchPublicProducts } from '@/services/productService';
import { useBusinessSettings } from '@/context/BusinessSettingsContext';

export const RequestQuotePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productParam = (searchParams.get('product') || '').trim();
  const isCustomParam = searchParams.get('custom') === 'true';
  const { settings } = useBusinessSettings();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState<boolean>(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);

  const loadProducts = React.useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await fetchPublicProducts({ limit: 100 });
      setProducts(res.products || []);
    } catch (err: any) {
      setProductsError('Unable to load product list. Please check your network and try again.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    document.title = `Request a Quote | ${settings.businessName} - Packaging Quotation Builder`;
  }, [settings.businessName]);

  // Validate if query parameter matches a real product
  const { matchedSlug, unknownAttempt } = useMemo(() => {
    if (!productParam) {
      return { matchedSlug: '', unknownAttempt: null };
    }
    if (loadingProducts) {
      return { matchedSlug: productParam, unknownAttempt: null };
    }
    const found = products.find((p) => p.slug === productParam);
    if (found) {
      return { matchedSlug: found.slug, unknownAttempt: null };
    }
    return { matchedSlug: '', unknownAttempt: productParam };
  }, [productParam, products, loadingProducts]);

  return (
    <div className="py-8 sm:py-12 space-y-10">
      <Container size="xl">
        {/* =========================================================================
            1. BREADCRUMBS & PAGE HEADER
            ========================================================================= */}
        <div className="space-y-4 border-b border-[#E6E4DD] pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5C635F]">
            <Link
              to="/"
              className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-[#88918C]" aria-hidden="true" />
            <Link
              to="/products"
              className="hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              Products
            </Link>
            <ChevronRight className="w-3 h-3 text-[#88918C]" aria-hidden="true" />
            <span className="font-semibold text-[#252A27]" aria-current="page">
              Request a Quote
            </span>
          </nav>

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-0.5 rounded-sm">
              COMMERCIAL ENQUIRY & ESTIMATES
            </span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#252A27]">
              Request a Quote
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#5C635F] leading-relaxed">
              Tell us what you need, and our team can follow up to discuss product options, quantities, and pricing.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. MAIN CONTENT GRID (FORM & COMMERCIAL GUIDANCE)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {settings.quoteInstructions && (
              <div className="p-4 rounded-lg bg-[#EAF3ED] border border-[#BADBC5] text-[#252A27] text-xs sm:text-sm flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#246B45] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#246B45] block uppercase tracking-wider text-[11px]">
                    Quotation Instructions
                  </span>
                  <p className="whitespace-pre-line text-[#3A403C] leading-relaxed">
                    {settings.quoteInstructions}
                  </p>
                </div>
              </div>
            )}

            {loadingProducts ? (
              <div className="bg-white border border-[#D8D5CB] rounded-lg p-8 space-y-6 shadow-subtle animate-pulse" aria-label="Loading quotation form">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
                <div className="h-24 bg-gray-200 rounded w-full" />
                <div className="h-12 bg-gray-200 rounded w-36" />
              </div>
            ) : productsError && products.length === 0 ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-700 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>{productsError}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadProducts}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Retry Loading Form
                </Button>
              </div>
            ) : (
              <QuoteRequestForm
                products={products}
                initialProductSlug={matchedSlug}
                initialMode={isCustomParam ? 'custom' : 'standard'}
                unknownSlugAttempt={unknownAttempt}
              />
            )}
          </div>

          {/* Right Explanatory Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Custom Order Guidance Card */}
            <div className="bg-[#FAF9F6] border border-[#D8D5CB] p-6 rounded-lg space-y-3 text-xs text-[#5C635F]">
              <div className="flex items-center gap-2 text-[#246B45]">
                <Sliders className="w-4 h-4 shrink-0" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                  Custom Packaging Requirements
                </h2>
              </div>
              <p className="leading-relaxed">
                Looking for unlisted bag dimensions, specific micron thicknesses, or specialized liner seals? Select <strong className="text-[#252A27]">&quot;Discuss a Custom Packaging Requirement&quot;</strong> in the form to describe your intended application without needing technical measurements.
              </p>
            </div>

            {/* Commercial Pricing Guidance */}
            <div className="bg-white border border-[#D8D5CB] p-6 rounded-lg shadow-subtle space-y-4 text-xs text-[#5C635F]">
              <div className="flex items-center gap-2 text-[#246B45]">
                <Calculator className="w-5 h-5 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                  Pricing & Turnaround Principles
                </h3>
              </div>
              <p className="leading-relaxed">
                Wholesale nylon quotations are calibrated based on current virgin polymer resin indices, order quantity brackets, and extrusion cylinder scheduling.
              </p>
              
              <ul className="space-y-2.5 pt-3 border-t border-[#E6E4DD]">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#246B45] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-[#252A27]">Volume Brackets:</strong> Progressive wholesale rate reductions apply to bulk commercial batches.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#246B45] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-[#252A27]">Quality Testing:</strong> Production swatches and dimension verification prior to mass production.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#246B45] mt-1.5 shrink-0" />
                  <span>
                    <strong className="text-[#252A27]">Custom Specs:</strong> Precise micron gauges, perforations, and handle cuts manufactured on demand.
                  </span>
                </li>
              </ul>
            </div>

            {/* Custom Brand Printing Callout */}
            <div className="bg-[#FAF9F6] border border-[#D8D5CB] p-6 rounded-lg space-y-3 text-xs text-[#5C635F]">
              <div className="flex items-center gap-2 text-[#246B45]">
                <Sparkles className="w-4 h-4 shrink-0" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#252A27]">
                  Flexographic Printing
                </h3>
              </div>
              <p className="leading-relaxed">
                Need branded carrier bags or printed film? Provide your artwork or colour count in the additional notes. Our team will verify printing plate cylinder dimensions with you.
              </p>
            </div>

            {/* Direct Support Card */}
            <div className="p-6 bg-white border border-[#D8D5CB] rounded-lg shadow-subtle space-y-3 text-xs text-[#5C635F]">
              <div className="flex items-center gap-2 text-[#252A27] font-bold">
                <HelpCircle className="w-4 h-4 text-[#246B45]" />
                <span>Prefer a General Enquiry?</span>
              </div>
              <p className="leading-relaxed">
                If you have a general non-product enquiry or want to discuss partnership agreements, you can reach out via our contact desk.
              </p>
              <div className="pt-2">
                <Link to="/contact">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<PhoneCall className="w-3.5 h-3.5 stroke-[2]" />}
                  >
                    Go to Contact Page
                  </Button>
                </Link>
              </div>
            </div>

            {/* Integration Transparency Notice */}
            <div className="p-4 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-[11px] text-[#88918C] space-y-1">
              <div className="flex items-center gap-1 font-semibold text-[#5C635F]">
                <Layers className="w-3 h-3 text-[#246B45]" />
                <span>Direct Client Handoff</span>
              </div>
              <p className="leading-relaxed">
                This quotation builder formats your packaging specifications for direct WhatsApp communication without requiring sensitive user account credentials.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
