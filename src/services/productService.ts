import { apiClient } from './apiClient';
import { Product, ProductCategory } from '@/types';
import { PRODUCTS } from '@/data/products';
import { PRODUCT_CATEGORIES } from '@/data/categories';

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

    const mappedProducts = (res.data || []).map(mapApiProductToFrontend);
    return {
      products: mappedProducts,
      total: res.meta?.total ?? mappedProducts.length,
      page: res.meta?.page ?? 1,
      totalPages: res.meta?.totalPages ?? 1,
    };
  } catch (err) {
    console.warn('[ProductService] Backend products fetch failed, using fallback static data:', err);
    // Graceful fallback to static catalogue
    let filtered = [...PRODUCTS];
    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === filters.category);
    }
    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (typeof filters?.featured === 'boolean') {
      filtered = filtered.filter((p) => Boolean(p.featured) === filters.featured);
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
    return mapApiProductToFrontend(res.data);
  } catch (err: any) {
    if (err?.status === 404) {
      return null;
    }
    console.warn(`[ProductService] Fetch product by slug "${slug}" failed, checking fallback:`, err);
    const fallback = PRODUCTS.find((p) => p.slug === slug);
    return fallback || null;
  }
}

/**
 * Fetch visible categories from the API.
 */
export async function fetchPublicCategories(): Promise<ProductCategory[]> {
  try {
    const res = await apiClient.get<any[]>('/categories?includeProductCounts=true');
    return (res.data || []).map(mapApiCategoryToFrontend);
  } catch (err) {
    console.warn('[ProductService] Backend categories fetch failed, using fallback static data:', err);
    return PRODUCT_CATEGORIES;
  }
}
