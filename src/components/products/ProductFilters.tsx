import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { ProductFiltersState } from '@/types';

export interface ProductFiltersProps {
  filters: ProductFiltersState;
  onChange: (updatedFilters: Partial<ProductFiltersState>) => void;
  onReset: () => void;
  activeFilterCount: number;
  className?: string;
  isOpenMobile?: boolean;
  onToggleMobile?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  activeFilterCount,
  className = '',
  isOpenMobile = false,
  onToggleMobile,
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mobile Toggle Button */}
      <div className="flex md:hidden items-center justify-between">
        <button
          type="button"
          onClick={onToggleMobile}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#D8D5CB] rounded-md text-xs font-semibold text-[#252A27] focus-visible:outline-2 focus-visible:outline-[#246B45]"
          aria-expanded={isOpenMobile}
        >
          <Filter className="w-3.5 h-3.5 text-[#246B45]" aria-hidden="true" />
          <span>Filters & Options</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-[#246B45] text-white rounded-full text-[10px] font-bold inline-flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-[#246B45] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Controls Panel (always visible on md+, collapsible on mobile) */}
      <div
        className={`${
          isOpenMobile ? 'block' : 'hidden md:flex'
        } flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-[#D8D5CB] rounded-md shadow-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          {/* Availability Status Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-status"
              className="text-xs font-semibold text-[#5C635F] shrink-0"
            >
              Availability:
            </label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className="text-xs font-medium bg-[#FAF9F6] border border-[#D8D5CB] text-[#252A27] rounded-md py-1.5 px-2.5 focus:outline-none focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45]"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">In Stock (Standard Runs)</option>
              <option value="made-to-order">Made to Order</option>
              <option value="custom-order">Custom Production</option>
            </select>
          </div>

          {/* Customization Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-customization"
              className="text-xs font-semibold text-[#5C635F] shrink-0"
            >
              Customization:
            </label>
            <select
              id="filter-customization"
              value={filters.customization}
              onChange={(e) => onChange({ customization: e.target.value })}
              className="text-xs font-medium bg-[#FAF9F6] border border-[#D8D5CB] text-[#252A27] rounded-md py-1.5 px-2.5 focus:outline-none focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45]"
            >
              <option value="all">All Formats</option>
              <option value="customizable">Custom Printing & Sizing</option>
              <option value="standard">Standard Plain Formats</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Action */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E6E4DD]">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#246B45] hover:text-[#1D5838] transition-colors py-1 px-2.5 rounded bg-[#EAF3ED] hover:bg-[#D9EBE0] focus-visible:outline-2 focus-visible:outline-[#246B45]"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Filters ({activeFilterCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-semibold text-[#88918C]">Active filters:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D8D5CB] px-2 py-0.5 rounded-full text-xs text-[#252A27]">
              <span>Search: "{filters.search}"</span>
              <button
                type="button"
                onClick={() => onChange({ search: '' })}
                className="hover:text-[#246B45]"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D8D5CB] px-2 py-0.5 rounded-full text-xs text-[#252A27]">
              <span>Category: {filters.category}</span>
              <button
                type="button"
                onClick={() => onChange({ category: 'all' })}
                className="hover:text-[#246B45]"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.status !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D8D5CB] px-2 py-0.5 rounded-full text-xs text-[#252A27]">
              <span>Status: {filters.status}</span>
              <button
                type="button"
                onClick={() => onChange({ status: 'all' })}
                className="hover:text-[#246B45]"
                aria-label="Remove status filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.customization !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-white border border-[#D8D5CB] px-2 py-0.5 rounded-full text-xs text-[#252A27]">
              <span>Custom: {filters.customization}</span>
              <button
                type="button"
                onClick={() => onChange({ customization: 'all' })}
                className="hover:text-[#246B45]"
                aria-label="Remove customization filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
