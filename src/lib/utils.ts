/**
 * Utility functions
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatProductStatus(status: string): { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' | 'forest' } {
  switch (status) {
    case 'in-stock':
      return { label: 'In Stock', variant: 'success' };
    case 'made-to-order':
      return { label: 'Made to Order', variant: 'info' };
    case 'low-stock':
      return { label: 'Low Stock', variant: 'warning' };
    case 'custom-order':
      return { label: 'Custom Production', variant: 'forest' };
    case 'provisional-sample':
      return { label: 'Provisional Sample', variant: 'neutral' };
    default:
      return { label: status, variant: 'neutral' };
  }
}
