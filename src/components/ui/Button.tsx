import React from 'react';
import { cn } from '@/lib/utils';
import { ButtonVariant, ButtonSize } from '@/types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:active:scale-100 rounded-md select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-[#246B45] text-white hover:bg-[#1D5838] active:bg-[#17472D] shadow-subtle',
      secondary:
        'bg-[#252A27] text-white hover:bg-[#3A403C] active:bg-[#1B1F1C] shadow-subtle',
      outline:
        'border-2 border-[#246B45] text-[#17472D] bg-transparent hover:bg-[#EAF3ED] active:bg-[#D3E6DA] font-semibold',
      ghost:
        'text-[#252A27] bg-transparent hover:bg-[#EFECE3] active:bg-[#E3E0D6]',
      white:
        'bg-white text-[#1B1F1C] hover:bg-[#F5F4EF] active:bg-[#EBE9DF] shadow-md font-semibold border border-transparent',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}

        <span>{children}</span>

        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
