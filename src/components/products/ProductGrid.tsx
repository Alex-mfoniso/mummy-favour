import React from 'react';
import { PackageSearch, RotateCcw } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';

export interface ProductGridProps {
  products: Product[];
  totalAvailableCount?: number;
  onResetFilters?: () => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  totalAvailableCount,
  onResetFilters,
  className = '',
}) => {
  // Empty State Handling
  if (products.length === 0) {
    return (
      <div className="py-16 px-6 bg-white border border-[#D8D5CB] rounded-lg text-center max-w-xl mx-auto shadow-subtle">
        <div className="w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#E6E4DD] text-[#5C635F] mx-auto flex items-center justify-center mb-4">
          <PackageSearch className="w-7 h-7 stroke-[1.8]" aria-hidden="true" />
        </div>

        <h3 className="text-xl font-bold text-[#252A27]">
          No products found
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-[#5C635F] max-w-md mx-auto leading-relaxed">
          Try another search term or clear your filters to explore the available products.
        </p>

        {onResetFilters && (
          <div className="mt-6">
            <Button
              variant="primary"
              size="sm"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Result Count Summary */}
      <div className="flex items-center justify-between text-xs text-[#5C635F]">
        <div>
          Showing <span className="font-bold text-[#252A27]">{products.length}</span>{' '}
          {products.length === 1 ? 'product' : 'products'}
          {totalAvailableCount && totalAvailableCount > products.length && (
            <span> of {totalAvailableCount} total packaging items</span>
          )}
        </div>
      </div>

      {/* Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {products.map((product, idx) => {
          const delayClass =
            idx % 6 === 1
              ? 'delay-75'
              : idx % 6 === 2
              ? 'delay-100'
              : idx % 6 === 3
              ? 'delay-150'
              : idx % 6 === 4
              ? 'delay-200'
              : idx % 6 === 5
              ? 'delay-300'
              : '';
          return (
            <div
              key={product.id}
              className={`animate-fade-slide-up animation-fill-both ${delayClass}`}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
