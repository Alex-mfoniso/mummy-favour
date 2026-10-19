import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  PhoneCall, 
  FileQuestion,
  Layers
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  ProductGallery, 
  ProductSpecifications, 
  RelatedProducts 
} from '@/components/products';
import { PRODUCTS } from '@/data/products';
import { fetchPublicProductBySlug } from '@/services/productService';
import { Product } from '@/types';
import { formatProductStatus } from '@/lib/utils';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Lookup product from centralized data source with initial static match
  const [product, setProduct] = useState<Product | null>(() => {
    return PRODUCTS.find((p) => p.slug === slug) || null;
  });
  const [loading, setLoading] = useState<boolean>(!product);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    fetchPublicProductBySlug(slug)
      .then((apiProduct) => {
        if (isMounted && apiProduct) {
          setProduct(apiProduct);
        }
      })
      .catch((err) => {
        console.warn('[ProductDetailPage] Failed to fetch product from API:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="py-20 sm:py-28">
        <Container size="md">
          <div className="text-center py-12 text-[#5C635F]">
            Loading product specifications...
          </div>
        </Container>
      </div>
    );
  }

  // Invalid Product Slug: Clean, helpful not-found state
  if (!product) {
    return (
      <div className="py-20 sm:py-28">
        <Container size="md">
          <div className="bg-white border border-[#D8D5CB] rounded-lg p-8 sm:p-12 text-center shadow-subtle max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#E6E4DD] text-[#5C635F] mx-auto flex items-center justify-center">
              <FileQuestion className="w-8 h-8 stroke-[1.8]" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#252A27]">
                Product Not Found
              </h1>
              <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
                The product specification you requested (<code className="text-[#246B45] font-mono bg-[#EAF3ED] px-1.5 py-0.5 rounded text-xs">{slug || 'unknown'}</code>) could not be located in our current manufacturing catalogue.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/products" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Product Catalogue
                </Button>
              </Link>
              <Link to="/" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const statusInfo = formatProductStatus(product.status);
  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : (product.image ? [product.image] : []);

  return (
    <div className="py-8 sm:py-12 space-y-12">
      <Container size="xl">
        {/* =========================================================================
            1. BREADCRUMB NAVIGATION & BACK LINK
            ========================================================================= */}
        <div className="space-y-3 border-b border-[#E6E4DD] pb-5">
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
            <span className="font-semibold text-[#252A27] truncate max-w-xs sm:max-w-md" aria-current="page">
              {product.title}
            </span>
          </nav>

          <div className="flex items-center justify-between">
            <Link
              to="/products"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C635F] hover:text-[#246B45] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2] transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to All Products</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            2. PRODUCT HERO / MAIN DETAIL CARD
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-[#D8D5CB] rounded-lg p-6 sm:p-10 shadow-subtle">
          {/* Left Column: Image Gallery & Quality Assurance */}
          <div className="lg:col-span-5 space-y-6">
            <ProductGallery
              images={galleryImages}
              alt={product.imageAlt || product.title}
              fallbackLabel={product.title}
              category={product.category}
              provisionalNote={product.isProvisional ? 'Representative Specimen' : undefined}
            />

            {/* Commercial Quality Assurance Note */}
            <div className="p-4 rounded-md bg-[#FAF9F6] border border-[#E6E4DD] text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#252A27]">
                <ShieldCheck className="w-4 h-4 text-[#246B45]" />
                <span>Extrusion Quality & Tolerance Standard</span>
              </div>
              <p className="text-[#5C635F] leading-relaxed">
                Extruded from virgin polymers under regulated gauge tolerance standards. Production swatches and dimension verification are coordinated prior to full commercial batch runs.
              </p>
            </div>
          </div>

          {/* Right Column: Title, Description, Specifications & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Category & Status Eyebrow */}
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge variant={statusInfo.variant} size="md">
                  {statusInfo.label}
                </StatusBadge>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C635F] bg-[#FAF9F6] border border-[#E6E4DD] px-2.5 py-0.5 rounded-sm">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-0.5 rounded-sm">
                    Featured Item
                  </span>
                )}
              </div>

              {/* Main Heading & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#252A27]">
                  {product.title}
                </h1>
                <p className="mt-2 text-sm sm:text-base font-medium text-[#246B45]">
                  {product.tagline}
                </p>
              </div>

              {/* Product Narrative / Description */}
              <div className="text-xs sm:text-sm text-[#5C635F] leading-relaxed space-y-3">
                <p>{product.description}</p>
              </div>

              {/* Specifications Table Component */}
              <div className="pt-2">
                <ProductSpecifications product={product} />
              </div>
            </div>

            {/* Primary Action Bar */}
            <div className="pt-6 border-t border-[#E6E4DD] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#5C635F] w-full sm:w-auto">
                <span className="font-semibold text-[#252A27] block">Ready to order or customize?</span>
                <span>Enquire with your quantities for a production estimate.</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Link 
                  to={`/request-quote?product=${product.slug}`} 
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    rightIcon={<ArrowRight className="w-4 h-4 stroke-[2]" />}
                  >
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. RELATED PRODUCTS SECTION
            ========================================================================= */}
        <RelatedProducts currentProduct={product} allProducts={PRODUCTS} />

        {/* =========================================================================
            4. FINAL ENQUIRY CTA
            ========================================================================= */}
        <div className="bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-subtle">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2 text-[#246B45] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Tailored Production Solutions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#252A27]">
              Have Specific Requirements for this Product?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
              Our team assists wholesale and commercial clients with bespoke micron gauges, custom dimensions, roll widths, and flexographic brand printing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <Link to={`/request-quote?product=${product.slug}`} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4 stroke-[2]" />}
              >
                Request a Quote
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<PhoneCall className="w-3.5 h-3.5 stroke-[2]" />}
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
