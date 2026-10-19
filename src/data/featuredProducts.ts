import { Product } from '@/types';
import { PRODUCTS } from './products';

/**
 * Provisional Featured Products for Divine Favour Homepage Preview.
 * Sourced directly from centralized PRODUCTS dataset to maintain
 * absolute consistency across all views.
 */
export const PROVISIONAL_FEATURED_PRODUCTS: Product[] = PRODUCTS.filter(
  (product) => product.featured
);
