import { productRepository, ProductWithCategory } from '../repositories/product.repository.js';
import { categoryRepository } from '../repositories/category.repository.js';
import { CreateProductInput, UpdateProductInput, ProductQueryParams } from '../schemas/product.schema.js';
import { AppError } from '../types/api.js';
import { ProductAvailability, Prisma } from '@prisma/client';

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface FormattedProduct {
  id: string;
  name: string;
  title: string;
  slug: string;
  shortDescription: string;
  tagline: string;
  description: string;
  fullDescription: string;
  categoryId: string;
  category: string;
  categoryDetails: {
    id: string;
    name: string;
    slug: string;
  };
  mainImageUrl: string | null;
  image: string | null;
  galleryImageUrls: string[];
  gallery: string[];
  featured: boolean;
  status: 'in-stock' | 'made-to-order' | 'low-stock' | 'custom-order' | 'provisional-sample';
  specifications: ProductSpecification[];
  materialGrade?: string;
  material?: string;
  thickness?: string;
  dimensions?: string[];
  availableColors?: string[];
  minOrderQuantity?: string;
  targetAudience?: string[];
  customizationOptions?: string[];
  isProvisional?: boolean;
  createdAt: string;
  updatedAt: string;
}

const DB_STATUS_TO_API: Record<ProductAvailability, FormattedProduct['status']> = {
  IN_STOCK: 'in-stock',
  MADE_TO_ORDER: 'made-to-order',
  LOW_STOCK: 'low-stock',
  CUSTOM_ORDER: 'custom-order',
  PROVISIONAL_SAMPLE: 'provisional-sample',
};

const API_STATUS_TO_DB: Record<string, ProductAvailability> = {
  'in-stock': ProductAvailability.IN_STOCK,
  'made-to-order': ProductAvailability.MADE_TO_ORDER,
  'low-stock': ProductAvailability.LOW_STOCK,
  'custom-order': ProductAvailability.CUSTOM_ORDER,
  'provisional-sample': ProductAvailability.PROVISIONAL_SAMPLE,
};

export function formatProduct(prod: ProductWithCategory): FormattedProduct {
  const specsRaw = prod.specifications as Record<string, unknown> | null;
  const rawSpecList = Array.isArray(specsRaw?.specifications)
    ? (specsRaw?.specifications as ProductSpecification[])
    : Array.isArray(specsRaw)
    ? (specsRaw as unknown as ProductSpecification[])
    : [];

  const mainImage = prod.mainImageUrl ?? null;
  const gallery = prod.galleryImageUrls ?? [];

  return {
    id: prod.id,
    name: prod.name,
    title: prod.name,
    slug: prod.slug,
    shortDescription: prod.shortDescription,
    tagline: prod.shortDescription,
    description: prod.description,
    fullDescription: prod.description,
    categoryId: prod.categoryId,
    category: prod.category.name,
    categoryDetails: {
      id: prod.category.id,
      name: prod.category.name,
      slug: prod.category.slug,
    },
    mainImageUrl: mainImage,
    image: mainImage,
    galleryImageUrls: gallery,
    gallery,
    featured: prod.featured,
    status: DB_STATUS_TO_API[prod.status] ?? 'in-stock',
    specifications: rawSpecList,
    materialGrade: typeof specsRaw?.materialGrade === 'string' ? specsRaw.materialGrade : undefined,
    material: typeof specsRaw?.material === 'string' ? specsRaw.material : typeof specsRaw?.materialGrade === 'string' ? specsRaw.materialGrade : undefined,
    thickness: typeof specsRaw?.thickness === 'string' ? specsRaw.thickness : undefined,
    dimensions: Array.isArray(specsRaw?.dimensions) ? (specsRaw.dimensions as string[]) : undefined,
    availableColors: Array.isArray(specsRaw?.availableColors) ? (specsRaw.availableColors as string[]) : undefined,
    minOrderQuantity: typeof specsRaw?.minOrderQuantity === 'string' ? specsRaw.minOrderQuantity : undefined,
    targetAudience: Array.isArray(specsRaw?.targetAudience) ? (specsRaw.targetAudience as string[]) : undefined,
    customizationOptions: Array.isArray(specsRaw?.customizationOptions) ? (specsRaw.customizationOptions as string[]) : undefined,
    isProvisional: typeof specsRaw?.isProvisional === 'boolean' ? specsRaw.isProvisional : undefined,
    createdAt: prod.createdAt.toISOString(),
    updatedAt: prod.updatedAt.toISOString(),
  };
}

export class ProductService {
  async getProducts(params: ProductQueryParams, options?: { includeHiddenCategories?: boolean }): Promise<{
    products: FormattedProduct[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      timestamp: string;
    };
  }> {
    const statusEnum = params.availability
      ? API_STATUS_TO_DB[params.availability.toLowerCase()]
      : params.status
      ? API_STATUS_TO_DB[params.status.toLowerCase()]
      : undefined;

    const { products, total } = await productRepository.findMany({
      page: params.page,
      limit: params.limit,
      search: params.search,
      category: params.category,
      featured: params.featured,
      status: statusEnum,
      sort: params.sort,
      includeHiddenCategories: options?.includeHiddenCategories ?? false,
    });

    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      products: products.map(formatProduct),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getProductBySlug(slug: string, options?: { includeHiddenCategories?: boolean }): Promise<FormattedProduct> {
    const product = await productRepository.findBySlug(slug, options);
    if (!product) {
      throw new AppError(`Product with slug "${slug}" was not found or is unavailable.`, 404, 'PRODUCT_NOT_FOUND');
    }
    return formatProduct(product);
  }

  async createProduct(input: CreateProductInput): Promise<FormattedProduct> {
    // 1. Validate Category exists
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new AppError(
        `Referenced category with ID "${input.categoryId}" does not exist.`,
        400,
        'INVALID_CATEGORY'
      );
    }

    // 2. Validate Slug Uniqueness
    const existingSlug = await productRepository.findBySlug(input.slug, { includeHiddenCategories: true });
    if (existingSlug) {
      throw new AppError(
        `A product with the slug "${input.slug}" already exists.`,
        409,
        'SLUG_CONFLICT'
      );
    }

    const name = (input.name || input.title)!;
    const shortDescription = (input.shortDescription || input.tagline)!;
    const description = (input.description || input.fullDescription)!;
    const mainImageUrl = input.mainImageUrl ?? input.image ?? null;
    const galleryImageUrls = input.galleryImageUrls?.length ? input.galleryImageUrls : input.gallery ?? [];

    const statusEnum = API_STATUS_TO_DB[input.status] ?? ProductAvailability.IN_STOCK;

    // Build specs container preserving all manufacturing attributes
    const specificationsJson: Record<string, unknown> = {
      specifications: input.specifications ?? [],
      minOrderQuantity: input.minOrderQuantity,
      materialGrade: input.materialGrade,
      material: input.material ?? input.materialGrade,
      thickness: input.thickness,
      dimensions: input.dimensions,
      availableColors: input.availableColors,
      targetAudience: input.targetAudience,
      customizationOptions: input.customizationOptions,
      isProvisional: input.isProvisional,
    };

    const created = await productRepository.create({
      id: input.id,
      name,
      slug: input.slug,
      shortDescription,
      description,
      categoryId: input.categoryId,
      mainImageUrl,
      galleryImageUrls,
      specifications: specificationsJson as Prisma.InputJsonValue,
      featured: input.featured ?? false,
      status: statusEnum,
    });

    return formatProduct(created);
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<FormattedProduct> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND');
    }

    // Category Check if updated
    if (input.categoryId && input.categoryId !== existing.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new AppError(
          `Referenced category with ID "${input.categoryId}" does not exist.`,
          400,
          'INVALID_CATEGORY'
        );
      }
    }

    // Slug Conflict Check if updated
    if (input.slug && input.slug !== existing.slug) {
      const slugOwner = await productRepository.findBySlug(input.slug, { includeHiddenCategories: true });
      if (slugOwner && slugOwner.id !== id) {
        throw new AppError(
          `A product with the slug "${input.slug}" already exists.`,
          409,
          'SLUG_CONFLICT'
        );
      }
    }

    const name = input.name ?? input.title;
    const shortDescription = input.shortDescription ?? input.tagline;
    const description = input.description ?? input.fullDescription;
    const mainImageUrl = input.mainImageUrl !== undefined ? input.mainImageUrl : input.image;
    const galleryImageUrls = input.galleryImageUrls !== undefined ? input.galleryImageUrls : input.gallery;

    const statusEnum = input.status ? API_STATUS_TO_DB[input.status] : undefined;

    // Merge existing specs with newly provided values
    const existingSpecs = (existing.specifications as Record<string, unknown>) ?? {};
    const mergedSpecs: Record<string, unknown> = {
      ...existingSpecs,
      specifications: input.specifications !== undefined ? input.specifications : existingSpecs.specifications,
      minOrderQuantity: input.minOrderQuantity !== undefined ? input.minOrderQuantity : existingSpecs.minOrderQuantity,
      materialGrade: input.materialGrade !== undefined ? input.materialGrade : existingSpecs.materialGrade,
      material: input.material !== undefined ? input.material : existingSpecs.material,
      thickness: input.thickness !== undefined ? input.thickness : existingSpecs.thickness,
      dimensions: input.dimensions !== undefined ? input.dimensions : existingSpecs.dimensions,
      availableColors: input.availableColors !== undefined ? input.availableColors : existingSpecs.availableColors,
      targetAudience: input.targetAudience !== undefined ? input.targetAudience : existingSpecs.targetAudience,
      customizationOptions: input.customizationOptions !== undefined ? input.customizationOptions : existingSpecs.customizationOptions,
      isProvisional: input.isProvisional !== undefined ? input.isProvisional : existingSpecs.isProvisional,
    };

    const updated = await productRepository.update(id, {
      name,
      slug: input.slug,
      shortDescription,
      description,
      categoryId: input.categoryId,
      mainImageUrl,
      galleryImageUrls,
      specifications: mergedSpecs as Prisma.InputJsonValue,
      featured: input.featured,
      status: statusEnum,
    });

    return formatProduct(updated);
  }

  async deleteProduct(id: string): Promise<{ id: string; message: string }> {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND');
    }

    await productRepository.delete(id);
    return {
      id,
      message: `Product "${existing.name}" was successfully deleted.`,
    };
  }
}

export const productService = new ProductService();
