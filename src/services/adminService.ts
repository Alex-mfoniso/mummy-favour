/**
 * ============================================================================
 * DIVINE FAVOUR — ADMIN SERVICE
 * ============================================================================
 * 
 * Connected to live backend REST API for Products and Categories.
 * Retains Enquiry and Settings mock implementations until Phase 9.
 */

import { 
  AdminProduct, 
  AdminCategory, 
  AdminEnquiry, 
  AdminBusinessSettings, 
  DashboardSummaryMetrics,
  EnquiryStatus 
} from '@/types/admin';
import { 
  INITIAL_ADMIN_PRODUCTS, 
  INITIAL_ADMIN_CATEGORIES, 
  INITIAL_ADMIN_ENQUIRIES, 
  INITIAL_ADMIN_BUSINESS_SETTINGS 
} from '@/data/mock/initialAdminData';
import { apiClient, ApiClientError } from './apiClient';
import { mapApiProductToFrontend, mapApiCategoryToFrontend } from './productService';
import { enquiryService } from './enquiryService';
import { businessSettingsService } from './businessSettingsService';

const STORAGE_KEYS = {
  PRODUCTS: 'df_admin_products_demo',
  CATEGORIES: 'df_admin_categories_demo',
  ENQUIRIES: 'df_admin_enquiries_demo',
  SETTINGS: 'df_admin_settings_demo',
};

// Safe storage access helper
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    }
  } catch {
    // SessionStorage unavailable or restricted
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // SessionStorage write failed
  }
}

// In-memory runtime state initialized from session or static mock
let productsState: AdminProduct[] = loadFromStorage(STORAGE_KEYS.PRODUCTS, [...INITIAL_ADMIN_PRODUCTS]);
let categoriesState: AdminCategory[] = loadFromStorage(STORAGE_KEYS.CATEGORIES, [...INITIAL_ADMIN_CATEGORIES]);
let enquiriesState: AdminEnquiry[] = loadFromStorage(STORAGE_KEYS.ENQUIRIES, [...INITIAL_ADMIN_ENQUIRIES]);
let settingsState: AdminBusinessSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, { ...INITIAL_ADMIN_BUSINESS_SETTINGS });

// ============================================================================
// 1. PRODUCT MANAGEMENT SERVICE
// ============================================================================

export interface ProductFilterOptions {
  search?: string;
  categoryId?: string;
  status?: string;
}

export function listProducts(filters?: ProductFilterOptions): AdminProduct[] {
  let list = [...productsState];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (filters?.categoryId && filters.categoryId !== 'all') {
    list = list.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((p) => p.status === filters.status);
  }

  return list;
}

export async function loadProducts(): Promise<AdminProduct[]> {
  try {
    const res = await apiClient.get<any[]>('/products?limit=100&includeHidden=true');
    const mapped: AdminProduct[] = (res.data || []).map((item) => {
      const prod = mapApiProductToFrontend(item);
      return {
        ...prod,
        lastUpdated: item.updatedAt ? item.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      };
    });

    productsState = mapped;
    saveToStorage(STORAGE_KEYS.PRODUCTS, productsState);
    return productsState;
  } catch (err) {
    console.warn('[AdminService] Backend loadProducts failed, using local cache:', err);
    return productsState;
  }
}

export function getProduct(id: string): AdminProduct | undefined {
  return productsState.find((p) => p.id === id || p.slug === id);
}

export async function createProduct(productData: Omit<AdminProduct, 'id'>): Promise<AdminProduct> {
  const payload = {
    name: productData.title,
    title: productData.title,
    slug: productData.slug,
    categoryId: productData.categoryId,
    shortDescription: productData.tagline,
    tagline: productData.tagline,
    description: productData.description,
    fullDescription: productData.description,
    mainImageUrl: productData.image,
    image: productData.image,
    galleryImageUrls: productData.gallery || [],
    gallery: productData.gallery || [],
    specifications: productData.specifications || [],
    featured: Boolean(productData.featured),
    status: productData.status,
    minOrderQuantity: productData.minOrderQuantity,
    materialGrade: productData.materialGrade,
    thickness: productData.thickness,
    dimensions: productData.dimensions,
    availableColors: productData.availableColors,
    targetAudience: productData.targetAudience,
    customizationOptions: productData.customizationOptions,
    isProvisional: productData.isProvisional,
  };

  try {
    const res = await apiClient.post<any>('/products', payload);
    const mapped: AdminProduct = {
      ...mapApiProductToFrontend(res.data),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    productsState = [mapped, ...productsState.filter((p) => p.id !== mapped.id)];
    saveToStorage(STORAGE_KEYS.PRODUCTS, productsState);
    return mapped;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function updateProduct(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
  const payload: any = {};
  if (updates.title !== undefined) {
    payload.name = updates.title;
    payload.title = updates.title;
  }
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.categoryId !== undefined) payload.categoryId = updates.categoryId;
  if (updates.tagline !== undefined) {
    payload.shortDescription = updates.tagline;
    payload.tagline = updates.tagline;
  }
  if (updates.description !== undefined) {
    payload.description = updates.description;
    payload.fullDescription = updates.description;
  }
  if (updates.image !== undefined) {
    payload.mainImageUrl = updates.image;
    payload.image = updates.image;
  }
  if (updates.gallery !== undefined) {
    payload.galleryImageUrls = updates.gallery;
    payload.gallery = updates.gallery;
  }
  if (updates.specifications !== undefined) payload.specifications = updates.specifications;
  if (updates.featured !== undefined) payload.featured = updates.featured;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.minOrderQuantity !== undefined) payload.minOrderQuantity = updates.minOrderQuantity;
  if (updates.materialGrade !== undefined) payload.materialGrade = updates.materialGrade;
  if (updates.thickness !== undefined) payload.thickness = updates.thickness;
  if (updates.dimensions !== undefined) payload.dimensions = updates.dimensions;
  if (updates.availableColors !== undefined) payload.availableColors = updates.availableColors;
  if (updates.targetAudience !== undefined) payload.targetAudience = updates.targetAudience;
  if (updates.customizationOptions !== undefined) payload.customizationOptions = updates.customizationOptions;
  if (updates.isProvisional !== undefined) payload.isProvisional = updates.isProvisional;

  try {
    const res = await apiClient.patch<any>(`/products/${id}`, payload);
    const mapped: AdminProduct = {
      ...mapApiProductToFrontend(res.data),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    const index = productsState.findIndex((p) => p.id === id);
    if (index !== -1) {
      productsState[index] = mapped;
    } else {
      productsState.push(mapped);
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, productsState);
    return mapped;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/products/${id}`);
    productsState = productsState.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, productsState);
    return true;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

// ============================================================================
// 2. CATEGORY MANAGEMENT SERVICE
// ============================================================================

export interface CategoryFilterOptions {
  search?: string;
  visibility?: string;
}

export function listCategories(filters?: CategoryFilterOptions): AdminCategory[] {
  let list = [...categoriesState];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q)
    );
  }

  if (filters?.visibility && filters.visibility !== 'all') {
    list = list.filter((c) => (c.visibility || 'visible') === filters.visibility);
  }

  return list.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));
}

export async function loadCategories(): Promise<AdminCategory[]> {
  try {
    const res = await apiClient.get<any[]>('/categories?includeHidden=true&includeProductCounts=true');
    const mapped: AdminCategory[] = (res.data || []).map((item) => {
      const cat = mapApiCategoryToFrontend(item);
      return {
        ...cat,
        displayOrder: item.displayOrder ?? 1,
        visibility: item.visibility ?? 'visible',
        description: item.description || item.shortDescription,
      };
    });

    categoriesState = mapped;
    saveToStorage(STORAGE_KEYS.CATEGORIES, categoriesState);
    return categoriesState;
  } catch (err) {
    console.warn('[AdminService] Backend loadCategories failed, using local cache:', err);
    return categoriesState;
  }
}

export function getCategory(id: string): AdminCategory | undefined {
  return categoriesState.find((c) => c.id === id || c.slug === id);
}

export function checkCategoryProductsCount(categoryIdOrSlug: string): number {
  return productsState.filter(
    (p) => p.categoryId === categoryIdOrSlug || p.category === categoryIdOrSlug
  ).length;
}

export async function createCategory(categoryData: Omit<AdminCategory, 'id'>): Promise<AdminCategory> {
  const payload = {
    name: categoryData.name,
    slug: categoryData.slug,
    description: categoryData.description || categoryData.shortDescription,
    shortDescription: categoryData.shortDescription || categoryData.description,
    imageUrl: categoryData.image,
    image: categoryData.image,
    displayOrder: categoryData.displayOrder || categoriesState.length + 1,
    visibility: categoryData.visibility || 'visible',
  };

  try {
    const res = await apiClient.post<any>('/categories', payload);
    const mapped: AdminCategory = {
      ...mapApiCategoryToFrontend(res.data),
      displayOrder: res.data.displayOrder,
      visibility: res.data.visibility,
      description: res.data.description,
    };

    categoriesState = [...categoriesState, mapped];
    saveToStorage(STORAGE_KEYS.CATEGORIES, categoriesState);
    return mapped;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function updateCategory(id: string, updates: Partial<AdminCategory>): Promise<AdminCategory> {
  const payload: any = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.description !== undefined || updates.shortDescription !== undefined) {
    payload.description = updates.description || updates.shortDescription;
  }
  if (updates.image !== undefined) {
    payload.imageUrl = updates.image;
    payload.image = updates.image;
  }
  if (updates.displayOrder !== undefined) payload.displayOrder = updates.displayOrder;
  if (updates.visibility !== undefined) payload.visibility = updates.visibility;

  try {
    const res = await apiClient.patch<any>(`/categories/${id}`, payload);
    const mapped: AdminCategory = {
      ...mapApiCategoryToFrontend(res.data),
      displayOrder: res.data.displayOrder,
      visibility: res.data.visibility,
      description: res.data.description,
    };

    const index = categoriesState.findIndex((c) => c.id === id);
    if (index !== -1) {
      categoriesState[index] = mapped;
    } else {
      categoriesState.push(mapped);
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, categoriesState);
    return mapped;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; associatedCount: number }> {
  const associatedCount = checkCategoryProductsCount(id);

  try {
    await apiClient.delete(`/categories/${id}`);
    categoriesState = categoriesState.filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categoriesState);
    return { success: true, associatedCount };
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw new Error(err.message);
    }
    throw err;
  }
}

// ============================================================================
// 3. ENQUIRY MANAGEMENT SERVICE (Connected to live backend REST API)
// ============================================================================

export interface EnquiryFilterOptions {
  search?: string;
  type?: string;
  status?: string;
}

export async function loadEnquiries(filters?: EnquiryFilterOptions): Promise<AdminEnquiry[]> {
  try {
    const res = await enquiryService.listAdminEnquiries({
      search: filters?.search,
      status: filters?.status,
      type: filters?.type,
      limit: 100,
    });
    enquiriesState = res.enquiries;
    saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiriesState);
    return enquiriesState;
  } catch (err) {
    console.warn('[AdminService] Backend loadEnquiries failed, using local cache:', err);
    return listEnquiries(filters);
  }
}

export function listEnquiries(filters?: EnquiryFilterOptions): AdminEnquiry[] {
  let list = [...enquiriesState];

  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (e) =>
        e.customerName.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.businessName && e.businessName.toLowerCase().includes(q)) ||
        e.subject.toLowerCase().includes(q) ||
        e.customerNotes.toLowerCase().includes(q)
    );
  }

  if (filters?.type && filters.type !== 'all') {
    list = list.filter((e) => e.type === filters.type);
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((e) => e.status === filters.status);
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getEnquiry(id: string): AdminEnquiry | undefined {
  return enquiriesState.find((e) => e.id === id);
}

export async function updateEnquiryStatusAsync(id: string, status: EnquiryStatus): Promise<AdminEnquiry> {
  const updated = await enquiryService.updateAdminEnquiryStatus(id, status);
  const index = enquiriesState.findIndex((e) => e.id === id);
  if (index !== -1) {
    enquiriesState[index] = updated;
  } else {
    enquiriesState.unshift(updated);
  }
  saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiriesState);
  return updated;
}

export function updateEnquiryStatus(id: string, status: EnquiryStatus): AdminEnquiry {
  const index = enquiriesState.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error(`Enquiry with ID "${id}" was not found.`);
  }

  const updated: AdminEnquiry = {
    ...enquiriesState[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  enquiriesState[index] = updated;
  saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiriesState);
  return updated;
}

export function updateEnquiryInternalNotes(id: string, notes: string): AdminEnquiry {
  const index = enquiriesState.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error(`Enquiry with ID "${id}" was not found.`);
  }

  const updated: AdminEnquiry = {
    ...enquiriesState[index],
    internalNotes: notes,
    updatedAt: new Date().toISOString(),
  };

  enquiriesState[index] = updated;
  saveToStorage(STORAGE_KEYS.ENQUIRIES, enquiriesState);
  return updated;
}

// ============================================================================
// 4. BUSINESS SETTINGS SERVICE
// ============================================================================

export async function getBusinessSettingsAsync(): Promise<AdminBusinessSettings> {
  try {
    const remote = await businessSettingsService.getAdminBusinessSettings();
    settingsState = {
      ...settingsState,
      ...remote,
      phone: remote.phone || '',
      whatsAppNumber: remote.whatsAppNumber || '',
      email: remote.email || '',
      address: remote.address || '',
      logoUrl: remote.logoUrl || '',
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, settingsState);
    return settingsState;
  } catch (err) {
    console.warn('[adminService] Using cached settings fallback:', err);
    return { ...settingsState };
  }
}

export async function updateBusinessSettingsAsync(
  updates: Partial<AdminBusinessSettings>
): Promise<AdminBusinessSettings> {
  const updated = await businessSettingsService.updateAdminBusinessSettings(updates);
  settingsState = {
    ...settingsState,
    ...updated,
    phone: updated.phone || '',
    whatsAppNumber: updated.whatsAppNumber || '',
    email: updated.email || '',
    address: updated.address || '',
    logoUrl: updated.logoUrl || '',
  };
  saveToStorage(STORAGE_KEYS.SETTINGS, settingsState);
  return settingsState;
}

export function getBusinessSettings(): AdminBusinessSettings {
  return { ...settingsState };
}

export function updateBusinessSettings(updates: Partial<AdminBusinessSettings>): AdminBusinessSettings {
  settingsState = {
    ...settingsState,
    ...updates,
  };
  saveToStorage(STORAGE_KEYS.SETTINGS, settingsState);
  return { ...settingsState };
}

// ============================================================================
// 5. DASHBOARD SUMMARY METRICS
// ============================================================================

export function getDashboardSummary(): DashboardSummaryMetrics {
  const totalProducts = productsState.length;
  const totalCategories = categoriesState.length;
  const newEnquiries = enquiriesState.filter((e) => e.status === 'new').length;
  const enquiriesAwaitingFollowUp = enquiriesState.filter(
    (e) => e.status === 'new' || e.status === 'in_review'
  ).length;
  const activeProductsCount = productsState.filter((p) => p.status !== 'provisional-sample').length;
  const visibleCategoriesCount = categoriesState.filter((c) => (c.visibility || 'visible') === 'visible').length;

  return {
    totalProducts,
    totalCategories,
    newEnquiries,
    enquiriesAwaitingFollowUp,
    activeProductsCount,
    visibleCategoriesCount,
  };
}

// ============================================================================
// 6. DEMO RESET HELPER
// ============================================================================

export function resetAdminDataToDefaults(): void {
  productsState = [...INITIAL_ADMIN_PRODUCTS];
  categoriesState = [...INITIAL_ADMIN_CATEGORIES];
  enquiriesState = [...INITIAL_ADMIN_ENQUIRIES];
  settingsState = { ...INITIAL_ADMIN_BUSINESS_SETTINGS };

  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    window.sessionStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    window.sessionStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
    window.sessionStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}
