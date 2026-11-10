import { apiClient } from './apiClient';
import { ProductCategory } from '@/types';
import { PRODUCT_CATEGORIES } from '@/data/categories';
import { mapApiCategoryToFrontend, getStoredCategories, ADMIN_STORAGE_KEYS } from './productService';

/**
 * Fetch visible public categories with error handling.
 */
export async function fetchPublicCategories(): Promise<ProductCategory[]> {
  try {
    const res = await apiClient.get<any[]>('/categories?includeProductCounts=true');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      const mapped = res.data.map(mapApiCategoryToFrontend);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
          window.sessionStorage?.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
        } catch {
          // ignore
        }
      }
      return mapped;
    }
    const stored = getStoredCategories();
    return stored ?? PRODUCT_CATEGORIES;
  } catch (err) {
    console.warn('[CategoryService] Failed to fetch categories from API, using storage/fallback data:', err);
    const stored = getStoredCategories();
    return stored ?? PRODUCT_CATEGORIES;
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
  } catch (err) {
    console.warn(`[CategoryService] Failed to fetch category "${slug}", using fallback:`, err);
  }

  const stored = getStoredCategories();
  if (stored) {
    const found = stored.find((c) => c.slug === slug || c.id === slug);
    if (found) return found;
  }
  return PRODUCT_CATEGORIES.find((c) => c.slug === slug || c.id === slug) || null;
}
