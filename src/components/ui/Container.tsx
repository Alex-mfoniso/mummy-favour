import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  as: Component = 'div',
  className,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-[1400px]',
    full: 'max-w-full',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
