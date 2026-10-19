import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full py-14 px-6 text-center border border-dashed border-[#D8D5CB] rounded-md bg-white/60 flex flex-col items-center justify-center max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#EAF3ED] text-[#246B45] flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-6 h-6 stroke-[1.75]" aria-hidden="true" />}
      </div>

      <h3 className="text-base font-bold text-[#252A27]">{title}</h3>
      <p className="mt-1.5 text-xs text-[#5C635F] leading-relaxed max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
