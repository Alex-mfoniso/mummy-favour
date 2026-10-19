import React from 'react';
import { ProductCategory } from '@/types';

export interface CategoryNavProps {
  categories: ProductCategory[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts?: Record<string, number>;
  totalCount?: number;
  className?: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryCounts = {},
  totalCount = 0,
  className = '',
}) => {
  return (
    <nav
      aria-label="Product categories"
      className={`overflow-x-auto no-scrollbar py-1 ${className}`}
    >
      <div className="flex items-center gap-2 min-w-max">
        {/* All Products Option */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          aria-pressed={selectedCategoryId === 'all'}
          className={`text-xs font-semibold px-3.5 py-2 rounded-md transition-all duration-150 flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-2 ${
            selectedCategoryId === 'all'
              ? 'bg-[#246B45] text-white shadow-xs'
              : 'bg-white border border-[#D8D5CB] text-[#5C635F] hover:text-[#252A27] hover:border-[#246B45]/50'
          }`}
        >
          <span>All Products</span>
          {totalCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategoryId === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F5F4EF] text-[#5C635F]'
              }`}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Dynamic Category List */}
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const count = categoryCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              aria-pressed={isSelected}
              className={`text-xs font-semibold px-3.5 py-2 rounded-md transition-all duration-150 flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-2 ${
                isSelected
                  ? 'bg-[#246B45] text-white shadow-xs'
                  : 'bg-white border border-[#D8D5CB] text-[#5C635F] hover:text-[#252A27] hover:border-[#246B45]/50'
              }`}
            >
              <span>{category.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F5F4EF] text-[#5C635F]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
