import { apiClient } from './apiClient';
import { ProductCategory } from '@/types';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { mapApiCategoryToFrontend } from './productService';

/**
 * Fetch visible public categories with error handling.
 */
export async function fetchPublicCategories(): Promise<ProductCategory[]> {
  try {
    const res = await apiClient.get<any[]>('/categories?includeProductCounts=true');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map(mapApiCategoryToFrontend);
    }
    // If backend returns empty array or null, fallback safely
    return PRODUCT_CATEGORIES;
  } catch (err) {
    console.warn('[CategoryService] Failed to fetch categories from API, using fallback data:', err);
    return PRODUCT_CATEGORIES;
  }
}

/**
 * Fetch a single category by slug.
 */
export async function fetchPublicCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  try {
    const res = await apiClient.get<any>(`/categories/${encodeURIComponent(slug)}`);
    if (res.data) {
      return mapApiCategoryToFrontend(res.data);
    }
    return PRODUCT_CATEGORIES.find((c) => c.slug === slug) || null;
  } catch (err) {
    console.warn(`[CategoryService] Failed to fetch category "${slug}", using fallback:`, err);
    return PRODUCT_CATEGORIES.find((c) => c.slug === slug) || null;
  }
}
