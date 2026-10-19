import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      error,
      placeholder,
      required,
      id,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            className={cn(
              'w-full appearance-none bg-white text-[#252A27] text-sm rounded-md border border-[#D8D5CB] pl-3.5 pr-10 py-2.5 transition-colors cursor-pointer',
              'hover:border-[#B4B0A2]',
              'focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45] focus:outline-none',
              'disabled:bg-[#F5F4EF] disabled:cursor-not-allowed disabled:text-[#88918C]',
              error ? 'border-[#A43128] focus:border-[#A43128] focus:ring-[#A43128]' : '',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-[#5C635F]">
            <ChevronDown className="w-4 h-4 stroke-[2]" aria-hidden="true" />
          </div>
        </div>

        {error ? (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-[#A43128]">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-[#5C635F]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
