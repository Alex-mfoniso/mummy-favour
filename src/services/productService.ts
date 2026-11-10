import { apiClient } from './apiClient';
import { Product, ProductCategory } from '@/types';
import { PRODUCTS } from '@/data/products';
import { PRODUCT_CATEGORIES } from '@/data/categories';

// ─── Storage helpers ─────────────────────────────────────────────────────────
// Reads from localStorage (cross-tab persistent) with seamless sessionStorage migration.
// When the backend API is unavailable or offline, admin edits are persisted here,
// so the public catalogue immediately reflects product edits across all tabs and windows.

export const ADMIN_STORAGE_KEYS = {
  PRODUCTS: 'df_admin_products_demo',
  CATEGORIES: 'df_admin_categories_demo',
};

export const DATA_VERSION = 'df_data_v5_2026_11_10';

export function checkAndMigrateProductStorage(): void {
  try {
    if (typeof window !== 'undefined') {
      const currentVersion = window.localStorage?.getItem('df_data_version');
      if (currentVersion !== DATA_VERSION) {
        window.localStorage?.removeItem(ADMIN_STORAGE_KEYS.PRODUCTS);
        window.sessionStorage?.removeItem(ADMIN_STORAGE_KEYS.PRODUCTS);
        window.localStorage?.setItem('df_data_version', DATA_VERSION);
      }
    }
  } catch {
    // Storage unavailable
  }
}

checkAndMigrateProductStorage();

export function getStoredProducts(): Product[] | null {
  try {
    if (typeof window !== 'undefined') {
      const local = window.localStorage?.getItem(ADMIN_STORAGE_KEYS.PRODUCTS);
      if (local) {
        try {
          const parsed = JSON.parse(local) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // parse error
        }
      }
      const session = window.sessionStorage?.getItem(ADMIN_STORAGE_KEYS.PRODUCTS);
      if (session) {
        try {
          const parsed = JSON.parse(session) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.localStorage?.setItem(ADMIN_STORAGE_KEYS.PRODUCTS, session);
            return parsed;
          }
        } catch {
          // parse error
        }
      }
    }
  } catch {
    // Storage unavailable
  }
  return null;
}

export function getStoredCategories(): ProductCategory[] | null {
  try {
    if (typeof window !== 'undefined') {
      const local = window.localStorage?.getItem(ADMIN_STORAGE_KEYS.CATEGORIES);
      if (local) {
        try {
          const parsed = JSON.parse(local) as ProductCategory[];
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // parse error
        }
      }
      const session = window.sessionStorage?.getItem(ADMIN_STORAGE_KEYS.CATEGORIES);
      if (session) {
        try {
          const parsed = JSON.parse(session) as ProductCategory[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.localStorage?.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, session);
            return parsed;
          }
        } catch {
          // parse error
        }
      }
    }
  } catch {
    // Storage unavailable
  }
  return null;
}

// Backward compatibility aliases
export const getSessionProducts = getStoredProducts;
export const getSessionCategories = getStoredCategories;

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Maps an API product representation to the frontend Product interface.
 */
export function mapApiProductToFrontend(item: any): Product {
  return {
    id: item.id,
    title: item.title || item.name,
    name: item.name || item.title,
    slug: item.slug,
    categoryId: item.categoryId,
    category: item.category || item.categoryDetails?.name || 'Packaging',
    tagline: item.tagline || item.shortDescription || '',
    shortDescription: item.shortDescription || item.tagline || '',
    description: item.description || item.fullDescription || '',
    fullDescription: item.fullDescription || item.description || '',
    specifications: item.specifications || [],
    minOrderQuantity: item.minOrderQuantity || '1,000 units',
    status: item.status || 'in-stock',
    targetAudience: item.targetAudience || ['retailer', 'wholesaler', 'commercial'],
    materialGrade: item.materialGrade || item.material || 'Polyethylene',
    material: item.material || item.materialGrade || 'Polyethylene',
    thickness: item.thickness,
    dimensions: item.dimensions,
    availableColors: item.availableColors,
    customizationOptions: item.customizationOptions,
    featured: Boolean(item.featured),
    image: item.image || item.mainImageUrl,
    imageAlt: `${item.title || item.name} industrial packaging sample`,
    gallery: item.gallery || item.galleryImageUrls || [],
    isProvisional: item.isProvisional,
  };
}

/**
 * Maps an API category representation to the frontend ProductCategory interface.
 */
export function mapApiCategoryToFrontend(item: any): ProductCategory {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    shortDescription: item.shortDescription || item.description || '',
    image: item.image || item.imageUrl,
    imageAlt: `${item.name} packaging sample`,
    isProvisional: false,
    badge: item.badge,
  };
}

/**
 * Fetch publicly visible products with search, category filtering, and sorting.
 */
export async function fetchPublicProducts(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  status?: string;
  sort?: string;
}): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.search?.trim()) params.append('search', filters.search.trim());
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (typeof filters?.featured === 'boolean') params.append('featured', String(filters.featured));
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.sort) params.append('sort', filters.sort);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<any[]>(`/products${queryStr}`);

    if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('API returned empty or non-array product data');
    }

    const mappedProducts = res.data.map(mapApiProductToFrontend);

    // Cache fresh backend products to local storage
    if (mappedProducts.length > 0 && typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(ADMIN_STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProducts));
        window.sessionStorage?.setItem(ADMIN_STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProducts));
      } catch {
        // Storage write ignored
      }
    }

    return {
      products: mappedProducts,
      total: res.meta?.total ?? mappedProducts.length,
      page: res.meta?.page ?? 1,
      totalPages: res.meta?.totalPages ?? 1,
    };
  } catch (err) {
    console.warn('[ProductService] Backend products fetch failed, checking local storage then static fallback:', err);

    // 1. Prefer admin-edited products from storage — these reflect recent admin saves
    const storedProducts = getStoredProducts();
    let filtered = (storedProducts && storedProducts.length > 0) ? [...storedProducts] : [...PRODUCTS];

    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === filters.category || p.category === filters.category);
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => (p.title || p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
      );
    }
    if (typeof filters?.featured === 'boolean') {
      const featuredMatches = filtered.filter((p) => Boolean(p.featured) === filters.featured);
      if (featuredMatches.length > 0) {
        filtered = featuredMatches;
      }
    }
    if (filters?.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }
    return {
      products: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  }
}

/**
 * Fetch a single product by slug from the API.
 */
export async function fetchPublicProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await apiClient.get<any>(`/products/${encodeURIComponent(slug)}`);
    if (res.data && typeof res.data === 'object' && res.data.id) {
      return mapApiProductToFrontend(res.data);
    }
  } catch (err: any) {
    console.warn(`[ProductService] Fetch product by slug "${slug}" failed, checking local storage then static fallback:`, err);
  }

  // 1. Check local storage products first (reflects admin edits, even offline or if slug/id was modified)
  const storedProducts = getStoredProducts();
  if (storedProducts && storedProducts.length > 0) {
    const found = storedProducts.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;
  }

  // 2. Final fallback: hardcoded static product data
  const fallback = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  return fallback || null;
}

/**
 * Fetch visible categories from the API.
 */
export async function fetchPublicCategories(): Promise<ProductCategory[]> {
  try {
    const res = await apiClient.get<any[]>('/categories?includeProductCounts=true');
    if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
      throw new Error('API returned empty or non-array categories data');
    }
    const mapped = res.data.map(mapApiCategoryToFrontend);
    if (mapped.length > 0 && typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
        window.sessionStorage?.setItem(ADMIN_STORAGE_KEYS.CATEGORIES, JSON.stringify(mapped));
      } catch {
        // Storage write ignored
      }
    }
    return mapped;
  } catch (err) {
    console.warn('[ProductService] Backend categories fetch failed, checking local storage then static fallback:', err);

    // Prefer admin-edited categories from storage
    const storedCategories = getStoredCategories();
    return (storedCategories && storedCategories.length > 0) ? storedCategories : PRODUCT_CATEGORIES;
  }
}
