import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading packaging specifications...',
  variant = 'spinner',
  className,
}) => {
  if (variant === 'skeleton') {
    return (
      <div
        className={cn('w-full space-y-4 animate-pulse', className)}
        role="status"
        aria-label={message}
      >
        <div className="h-6 bg-[#E6E4DD] rounded w-1/3" />
        <div className="h-4 bg-[#E6E4DD] rounded w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-64 bg-[#E6E4DD] rounded-md" />
          <div className="h-64 bg-[#E6E4DD] rounded-md" />
          <div className="h-64 bg-[#E6E4DD] rounded-md" />
        </div>
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full py-16 flex flex-col items-center justify-center text-center',
        className
      )}
      role="status"
      aria-label={message}
    >
      <div className="w-10 h-10 border-2 border-[#D3E6DA] border-t-[#246B45] rounded-full animate-spin mb-3.5" />
      <p className="text-xs font-medium text-[#5C635F] tracking-wide">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};
