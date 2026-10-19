import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageTransition applies a smooth fade-and-lift entrance transition to all pages
 * triggered whenever the route pathname changes.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className={`animate-fade-slide-up animation-fill-both ${className}`}
    >
      {children}
    </div>
  );
};
