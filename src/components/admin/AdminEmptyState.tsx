import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PackageOpen } from 'lucide-react';

export interface AdminEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    linkTo?: string;
  };
  className?: string;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-dashed border-[#D8D5CB] rounded-lg p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto ${className}`}
      role="status"
    >
      <div className="w-12 h-12 rounded-full bg-[#F5F4EF] text-[#5C635F] mx-auto flex items-center justify-center">
        {icon || <PackageOpen className="w-6 h-6 stroke-[1.8]" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#252A27]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#5C635F] leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <div className="pt-2">
          {action.linkTo ? (
            <Link to={action.linkTo}>
              <Button variant="primary" size="sm">
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
