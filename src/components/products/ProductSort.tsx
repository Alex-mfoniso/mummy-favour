import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ProductSortOption } from '@/types';

export interface ProductSortProps {
  value: ProductSortOption;
  onChange: (sort: ProductSortOption) => void;
  className?: string;
}

export const ProductSort: React.FC<ProductSortProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <label
        htmlFor="catalogue-sort"
        className="text-xs font-semibold text-[#5C635F] shrink-0 flex items-center gap-1.5"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-[#246B45]" aria-hidden="true" />
        <span>Sort By:</span>
      </label>

      <select
        id="catalogue-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        className="text-xs font-medium bg-white border border-[#D8D5CB] text-[#252A27] rounded-md py-2 px-3 focus:outline-none focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45] transition-colors"
      >
        <option value="featured">Featured First</option>
        <option value="name-asc">Name (A to Z)</option>
        <option value="name-desc">Name (Z to A)</option>
      </select>
    </div>
  );
};
