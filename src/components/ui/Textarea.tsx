import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './Label';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      required,
      id,
      className,
      rows = 4,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helperText
              ? `${textareaId}-helper`
              : undefined
          }
          className={cn(
            'w-full bg-white text-[#252A27] text-sm rounded-md border border-[#D8D5CB] px-3.5 py-2.5 transition-colors placeholder:text-[#88918C] resize-y',
            'hover:border-[#B4B0A2]',
            'focus:border-[#246B45] focus:ring-1 focus:ring-[#246B45] focus:outline-none',
            'disabled:bg-[#F5F4EF] disabled:cursor-not-allowed disabled:text-[#88918C]',
            error ? 'border-[#A43128] focus:border-[#A43128] focus:ring-[#A43128]' : '',
            className
          )}
          {...props}
        />

        {error ? (
          <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-[#A43128]">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${textareaId}-helper`} className="mt-1.5 text-xs text-[#5C635F]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
