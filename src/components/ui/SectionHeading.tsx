import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}) => {
  return (
    <div
      className={cn(
        'max-w-2xl mb-8',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#246B45] bg-[#EAF3ED] px-2.5 py-1 rounded-sm mb-2.5">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#252A27]">
        {title}
      </h2>
      {description && (
        <p className="mt-2.5 text-sm sm:text-base text-[#5C635F] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
