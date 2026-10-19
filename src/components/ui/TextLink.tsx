import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextLinkProps extends Omit<LinkProps, 'to'> {
  to?: string;
  href?: string;
  variant?: 'primary' | 'muted' | 'charcoal';
  showArrow?: boolean;
  external?: boolean;
  children: React.ReactNode;
}

export const TextLink: React.FC<TextLinkProps> = ({
  to,
  href,
  variant = 'primary',
  showArrow = false,
  external = false,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'text-[#246B45] hover:text-[#1D5838] underline-offset-4 decoration-[#8EC3A2] hover:underline',
    muted: 'text-[#5C635F] hover:text-[#252A27] underline-offset-4 hover:underline',
    charcoal: 'text-[#252A27] hover:text-[#246B45] underline-offset-4 hover:underline',
  };

  const classes = cn(
    'inline-flex items-center gap-1 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246B45] rounded-sm',
    variantStyles[variant],
    className
  );

  const iconElement = external ? (
    <ExternalLink className="w-3.5 h-3.5 stroke-[2] opacity-80" aria-hidden="true" />
  ) : showArrow ? (
    <ArrowRight className="w-4 h-4 stroke-[2] transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
  ) : null;

  if (href || external) {
    return (
      <a
        href={href || to}
        className={cn('group', classes)}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        <span>{children}</span>
        {iconElement}
      </a>
    );
  }

  return (
    <Link to={to || '#'} className={cn('group', classes)} {...props}>
      <span>{children}</span>
      {iconElement}
    </Link>
  );
};
