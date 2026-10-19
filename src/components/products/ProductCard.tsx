import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatProductStatus } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export interface ProductCardProps {
  product: Product;
  className?: string;
  showRequestPrice?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  showRequestPrice = true,
}) => {
  const statusInfo = formatProductStatus(product.status);
  const title = product.name || product.title;
  const description = product.shortDescription || product.tagline;

  return (
    <article
      className={`group bg-white border border-[#D8D5CB] rounded-md overflow-hidden flex flex-col justify-between h-full transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-elevated hover:border-[#246B45] ${className}`}
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative overflow-hidden bg-[#FAF9F6]">
          <OptimizedImage
            src={product.image}
            alt={product.imageAlt || title}
            aspectRatio="landscape"
            fallbackLabel={title}
            category={product.category}
            provisionalNote={product.isProvisional ? 'Sample Specimen' : undefined}
            className="w-full h-48 sm:h-52 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Badges container */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
            <StatusBadge variant={statusInfo.variant} size="sm">
              {statusInfo.label}
            </StatusBadge>

            {product.featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#252A27]/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-sm">
                <Sparkles className="w-2.5 h-2.5 text-[#BADBC5]" aria-hidden="true" />
                <span>Featured</span>
              </span>
            )}
          </div>
        </div>

        {/* Product Body Information */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#246B45]">
              {product.category}
            </span>
            {product.thickness && (
              <span className="text-[11px] font-medium text-[#88918C]">
                {product.thickness}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#252A27] tracking-tight group-hover:text-[#246B45] transition-colors line-clamp-1">
            <Link
              to={`/products/${product.slug}`}
              className="focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-2 rounded"
            >
              {title}
            </Link>
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#5C635F] line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Specifications Snapshot */}
          <div className="mt-4 pt-3 border-t border-[#E6E4DD] space-y-1.5 text-[11px]">
            {product.material && (
              <div className="flex items-center justify-between">
                <span className="text-[#5C635F]">Material:</span>
                <span className="font-semibold text-[#252A27] text-right truncate max-w-[60%]">
                  {product.material.split('(')[0].trim()}
                </span>
              </div>
            )}

            {product.dimensions && product.dimensions.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[#5C635F]">Sizes:</span>
                <span className="font-semibold text-[#252A27] text-right truncate max-w-[60%]">
                  {product.dimensions[0]}
                  {product.dimensions.length > 1 ? ` +${product.dimensions.length - 1}` : ''}
                </span>
              </div>
            )}

            {product.minOrderQuantity && (
              <div className="flex items-center justify-between">
                <span className="text-[#5C635F]">Min. Order:</span>
                <span className="font-semibold text-[#246B45] text-right truncate max-w-[60%]">
                  {product.minOrderQuantity.split('(')[0].trim()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Bar */}
      <div className="p-5 pt-0">
        <div className="pt-3.5 border-t border-[#E6E4DD] flex items-center justify-between gap-2">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C635F] hover:text-[#252A27] transition-colors focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm py-1"
            aria-label={`View technical specifications for ${title}`}
          >
            <span>View Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
          </Link>

          {showRequestPrice && (
            <Link
              to={`/request-quote?product=${product.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:text-[#1D5838] transition-colors group-hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[#246B45] rounded-sm py-1 px-1.5"
              aria-label={`Request price quote for ${title}`}
            >
              <span>Request Price</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
