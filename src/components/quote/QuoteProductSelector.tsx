import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, PackageCheck, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export interface QuoteProductSelectorProps {
  products: Product[];
  selectedSlug: string;
  onChange: (slug: string) => void;
  error?: string;
  unknownSlugAttempt?: string | null;
}

export const QuoteProductSelector: React.FC<QuoteProductSelectorProps> = ({
  products,
  selectedSlug,
  onChange,
  error,
  unknownSlugAttempt,
}) => {
  const selectedProduct = products.find((p) => p.slug === selectedSlug);

  return (
    <div className="space-y-3">
      <label 
        htmlFor="quote-product-select" 
        className="block text-xs font-semibold uppercase tracking-wider text-[#252A27]"
      >
        Select Packaging Product <span className="text-red-600">*</span>
      </label>

      {/* Unknown Slug Notice (if user navigated with ?product=invalid-slug) */}
      {unknownSlugAttempt && !selectedProduct && (
        <div className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md flex items-start gap-2.5 text-xs text-[#5C635F]">
          <AlertCircle className="w-4 h-4 text-[#C27803] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#252A27]">Unrecognized Product Reference:</span>{' '}
            The requested reference <code className="font-mono bg-[#EAF3ED] px-1 py-0.5 rounded text-[11px] text-[#246B45]">{unknownSlugAttempt}</code> could not be matched. Please choose from our catalogue below.
          </div>
        </div>
      )}

      {/* Dropdown Select */}
      <div className="relative">
        <select
          id="quote-product-select"
          value={selectedSlug}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-md transition-colors focus:outline-none focus:ring-1 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-[#D8D5CB] hover:border-[#88918C] focus:border-[#246B45] focus:ring-[#246B45]'
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? 'quote-product-error' : undefined}
          required
        >
          <option value="">-- Choose a packaging product line --</option>
          {products.map((prod) => (
            <option key={prod.id} value={prod.slug}>
              {prod.title} — [{prod.category}]
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id="quote-product-error" className="text-xs text-red-600 font-medium flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {/* Selected Product Snapshot Card */}
      {selectedProduct && (
        <div className="mt-3 p-4 bg-[#FAF9F6] border border-[#D8D5CB] rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-md overflow-hidden border border-[#E6E4DD] bg-white shrink-0">
              <OptimizedImage
                src={selectedProduct.image}
                alt={selectedProduct.imageAlt || selectedProduct.title}
                aspectRatio="square"
                fallbackLabel={selectedProduct.title}
                category={selectedProduct.category}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#252A27]">
                  {selectedProduct.title}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2 py-0.5 rounded-sm">
                  {selectedProduct.category}
                </span>
              </div>
              <p className="text-xs text-[#5C635F] line-clamp-1">
                {selectedProduct.materialGrade} • MOQ: {selectedProduct.minOrderQuantity}
              </p>
            </div>
          </div>

          <Link
            to={`/products/${selectedProduct.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#246B45] hover:underline shrink-0"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>View Full Specs</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
