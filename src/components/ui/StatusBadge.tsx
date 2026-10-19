import React from 'react';
import { cn } from '@/lib/utils';
import { BadgeVariant } from '@/types';

export interface StatusBadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  withDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  children,
  size = 'md',
  className,
  withDot = true,
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    forest: {
      container: 'bg-[#EAF3ED] text-[#1D5838] border-[#BADBC5]',
      dot: 'bg-[#246B45]',
    },
    success: {
      container: 'bg-[#EDF7EE] text-[#1C5B28] border-[#BDE5C5]',
      dot: 'bg-[#2E7D32]',
    },
    warning: {
      container: 'bg-[#FFF8E6] text-[#7A5100] border-[#FFE4A3]',
      dot: 'bg-[#B27800]',
    },
    info: {
      container: 'bg-[#F0F5FA] text-[#1D4A6E] border-[#CFDFEF]',
      dot: 'bg-[#286090]',
    },
    neutral: {
      container: 'bg-[#EDEDEC] text-[#3A403C] border-[#DBDCDB]',
      dot: 'bg-[#5C635F]',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide font-medium',
    md: 'text-xs px-2.5 py-1 tracking-wide font-medium',
  };

  const selected = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border leading-none select-none',
        selected.container,
        sizeStyles[size],
        className
      )}
    >
      {withDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', selected.dot)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
