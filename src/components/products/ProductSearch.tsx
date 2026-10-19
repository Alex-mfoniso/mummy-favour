import React from 'react';
import { Search, X } from 'lucide-react';

export interface ProductSearchProps {
  value: string;
  onChange: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search nylon products...',
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5C635F]">
        <Search className="w-4 h-4 stroke-[2]" aria-hidden="true" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search nylon products"
        className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D8D5CB] rounded-md text-sm text-[#252A27] placeholder:text-[#88918C] transition-colors focus:outline-none focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45]"
      />

      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search query"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#88918C] hover:text-[#252A27] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246B45] rounded-r-md"
        >
          <X className="w-4 h-4 stroke-[2]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
