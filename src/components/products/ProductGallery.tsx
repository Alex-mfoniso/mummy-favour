import React, { useState } from 'react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ShieldAlert } from 'lucide-react';

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  fallbackLabel: string;
  category?: string;
  provisionalNote?: string;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  alt,
  fallbackLabel,
  category,
  provisionalNote = 'Representative Sample',
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fallback to single placeholder if no images provided
  const activeImage = images[selectedIndex] || images[0] || '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Hero Image */}
      <div className="relative overflow-hidden rounded-lg border border-[#D8D5CB] bg-white shadow-subtle group">
        <OptimizedImage
          src={activeImage}
          alt={`${alt} - View ${selectedIndex + 1}`}
          aspectRatio="square"
          fallbackLabel={fallbackLabel}
          category={category}
          provisionalNote={provisionalNote}
          className="w-full h-[340px] sm:h-[420px] object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Thumbnails Row (only if more than 1 image exists) */}
      {images.length > 1 && (
        <div 
          className="flex items-center gap-3 overflow-x-auto pb-1"
          role="region"
          aria-label="Product thumbnail gallery"
        >
          {images.map((imgUrl, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-[#246B45] ${
                  isSelected
                    ? 'border-[#246B45] ring-2 ring-[#246B45] ring-offset-2 opacity-100'
                    : 'border-[#D8D5CB] hover:border-[#88918C] opacity-70 hover:opacity-100'
                }`}
                aria-label={`Select product image view ${idx + 1}`}
                aria-pressed={isSelected}
              >
                <img
                  src={imgUrl}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Transparent Specimen Notice */}
      <div className="flex items-start gap-2 p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-md text-[11px] text-[#5C635F]">
        <ShieldAlert className="w-3.5 h-3.5 text-[#246B45] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Product imagery depicts representative polymer packaging specimens. Factory plant photographs and batch swatches are confirmed upon production scheduling.
        </p>
      </div>
    </div>
  );
};
