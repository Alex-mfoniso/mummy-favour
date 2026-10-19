import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImagePlaceholderProps {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  label?: string;
  category?: string;
  className?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  aspectRatio = 'landscape',
  label = 'Product Packaging Specimen',
  category,
  className,
}) => {
  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div
      className={cn(
        'w-full bg-[#EBE9DF] border border-[#DDD9CB] rounded-t-md relative overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none',
        aspectStyles[aspectRatio],
        className
      )}
      role="img"
      aria-label={`${label} preview placeholder`}
    >
      {/* Subtle geometric packaging grid texture */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#252A27 1px, transparent 1px), radial-gradient(#252A27 1px, #EBE9DF 1px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
        aria-hidden="true"
      />

      {/* Central packaging icon lockup */}
      <div className="relative z-10 flex flex-col items-center max-w-[85%]">
        <div className="w-12 h-12 rounded-full bg-white/80 border border-[#DDD9CB] flex items-center justify-center text-[#246B45] mb-2.5 shadow-subtle">
          <Package className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
        </div>
        {category && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#5C635F] mb-0.5">
            {category}
          </span>
        )}
        <span className="text-xs font-semibold text-[#252A27] line-clamp-1">
          {label}
        </span>
        <span className="text-[11px] text-[#88918C] mt-0.5">
          Manufactured Specimen
        </span>
      </div>
    </div>
  );
};
