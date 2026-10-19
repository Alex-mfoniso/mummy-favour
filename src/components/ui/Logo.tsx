import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withLink?: boolean;
  withSubtitle?: boolean;
  className?: string;
  businessName?: string;
  logoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  withLink = true,
  withSubtitle = true,
  className,
  businessName = 'DIVINE FAVOUR',
  logoUrl,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-wider',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-widest',
  };

  const Content = (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={businessName}
          className={cn('object-contain rounded', iconSizes[size])}
        />
      ) : (
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center rounded bg-[#246B45] text-white transition-colors duration-150',
            iconSizes[size]
          )}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-3/5 h-3/5"
          >
            {/* Packaging fold prism and layered structural seam */}
            <path
              d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M12 3V21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M4 7.5L12 12L20 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 12L12 21"
              stroke="#BADBC5"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Brand Wordmark */}
      <div className="flex flex-col text-left">
        <span
          className={cn(
            'font-bold tracking-tight text-[#252A27] leading-tight font-sans uppercase',
            titleSizes[size]
          )}
        >
          {businessName}
        </span>
        {withSubtitle && (
          <span
            className={cn(
              'font-semibold uppercase text-[#5C635F] leading-none mt-0.5',
              subtitleSizes[size]
            )}
          >
            Nylon & Packaging
          </span>
        )}
      </div>
    </div>
  );

  if (withLink) {
    return (
      <Link
        to="/"
        className="inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#246B45] focus-visible:outline-offset-4 rounded-md"
        aria-label="Divine Favour - Home"
      >
        {Content}
      </Link>
    );
  }

  return Content;
};
