import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EnquiryStatus, ProductStatus } from '@/types';

export const EnquiryStatusBadge: React.FC<{ status: EnquiryStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'new':
      return <StatusBadge variant="warning" size={size}>New</StatusBadge>;
    case 'in_review':
      return <StatusBadge variant="info" size={size}>In Review</StatusBadge>;
    case 'contacted':
      return <StatusBadge variant="forest" size={size}>Contacted</StatusBadge>;
    case 'quoted':
      return <StatusBadge variant="success" size={size}>Quoted</StatusBadge>;
    case 'closed':
      return <StatusBadge variant="neutral" size={size}>Closed</StatusBadge>;
    default:
      return <StatusBadge variant="neutral" size={size}>{status}</StatusBadge>;
  }
};

export const ProductStatusBadge: React.FC<{ status: ProductStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  switch (status) {
    case 'in-stock':
      return <StatusBadge variant="success" size={size}>In Stock</StatusBadge>;
    case 'made-to-order':
      return <StatusBadge variant="forest" size={size}>Made to Order</StatusBadge>;
    case 'low-stock':
      return <StatusBadge variant="warning" size={size}>Low Stock</StatusBadge>;
    case 'custom-order':
      return <StatusBadge variant="info" size={size}>Custom Order</StatusBadge>;
    case 'provisional-sample':
      return <StatusBadge variant="neutral" size={size}>Provisional Sample</StatusBadge>;
    default:
      return <StatusBadge variant="neutral" size={size}>{status}</StatusBadge>;
  }
};

export const CategoryVisibilityBadge: React.FC<{ visibility?: 'visible' | 'hidden'; size?: 'sm' | 'md' }> = ({
  visibility = 'visible',
  size = 'sm',
}) => {
  if (visibility === 'visible') {
    return <StatusBadge variant="success" size={size}>Visible</StatusBadge>;
  }
  return <StatusBadge variant="neutral" size={size}>Hidden</StatusBadge>;
};
