import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className,
  required,
  optional,
  ...props
}) => {
  return (
    <label
      className={cn(
        'block text-xs font-semibold uppercase tracking-wider text-[#3A403C] mb-1.5',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && (
        <span className="text-[#A43128] ml-1" aria-hidden="true">
          *
        </span>
      )}
      {optional && (
        <span className="text-[#88918C] normal-case text-xs font-normal ml-1.5">
          (optional)
        </span>
      )}
    </label>
  );
};
