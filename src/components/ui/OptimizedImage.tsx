import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImagePlaceholder } from './ImagePlaceholder';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide' | 'hero';
  fallbackLabel?: string;
  category?: string;
  provisionalNote?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'landscape',
  fallbackLabel,
  category,
  provisionalNote,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    hero: 'aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/11]',
  };

  if (!src || hasError) {
    return (
      <ImagePlaceholder
        aspectRatio={aspectRatio === 'hero' ? 'landscape' : aspectRatio === 'wide' ? 'video' : aspectRatio}
        label={fallbackLabel || alt || 'Packaging Specimen'}
        category={category}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#EBE9DF] border border-[#DDD9CB]',
        aspectStyles[aspectRatio],
        className
      )}
    >
      {/* Background skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#E6E4DD] animate-pulse" aria-hidden="true" />
      )}

      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />

      {/* Optional subtle provisional disclaimer tag */}
      {provisionalNote && (
        <div className="absolute bottom-2 left-2 z-10">
          <span className="text-[10px] font-medium tracking-wide bg-[#252A27]/80 text-[#FAF9F6] backdrop-blur-xs px-2 py-0.5 rounded-sm">
            {provisionalNote}
          </span>
        </div>
      )}
    </div>
  );
};
