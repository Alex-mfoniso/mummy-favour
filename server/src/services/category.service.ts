import { categoryRepository, CategoryWithCount } from '../repositories/category.repository.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema.js';
import { AppError } from '../types/api.js';
import { CategoryVisibility } from '@prisma/client';

export interface FormattedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string | null;
  image: string | null;
  displayOrder: number;
  visibility: 'visible' | 'hidden';
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export function formatCategory(cat: CategoryWithCount): FormattedCategory {
  const imageUrl = cat.imageUrl ?? null;
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    shortDescription: cat.description,
    imageUrl,
    image: imageUrl,
    displayOrder: cat.displayOrder,
    visibility: cat.visibility === CategoryVisibility.VISIBLE ? 'visible' : 'hidden',
    productCount: cat._count?.products,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

export class CategoryService {
  async getCategories(options: {
    includeHidden?: boolean;
    includeProductCounts?: boolean;
  }): Promise<FormattedCategory[]> {
    const categories = await categoryRepository.findMany(options);
    return categories.map(formatCategory);
  }

  async getCategoryBySlug(slug: string, options?: { includeHidden?: boolean }): Promise<FormattedCategory> {
    const category = await categoryRepository.findBySlug(slug, options);
    if (!category) {
      throw new AppError(`Category with slug "${slug}" was not found.`, 404, 'CATEGORY_NOT_FOUND');
    }
    return formatCategory(category);
  }

  async createCategory(input: CreateCategoryInput): Promise<FormattedCategory> {
    // 1. Slug Uniqueness Check
    const existing = await categoryRepository.findBySlug(input.slug, { includeHidden: true });
    if (existing) {
      throw new AppError(
        `A category with the slug "${input.slug}" already exists.`,
        409,
        'SLUG_CONFLICT'
      );
    }

    const visibilityEnum =
      input.visibility === 'hidden'
        ? CategoryVisibility.HIDDEN
        : CategoryVisibility.VISIBLE;

    const imageUrl = input.imageUrl ?? input.image ?? null;

    const created = await categoryRepository.create({
      id: input.id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl,
      displayOrder: input.displayOrder ?? 1,
      visibility: visibilityEnum,
    });

    return formatCategory(created);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<FormattedCategory> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(`Category with ID "${id}" was not found.`, 404, 'CATEGORY_NOT_FOUND');
    }

    // Slug Conflict Check if changed
    if (input.slug && input.slug !== existing.slug) {
      const slugOwner = await categoryRepository.findBySlug(input.slug, { includeHidden: true });
      if (slugOwner && slugOwner.id !== id) {
        throw new AppError(
          `A category with the slug "${input.slug}" already exists.`,
          409,
          'SLUG_CONFLICT'
        );
      }
    }

    const visibilityEnum = input.visibility
      ? input.visibility === 'hidden'
        ? CategoryVisibility.HIDDEN
        : CategoryVisibility.VISIBLE
      : undefined;

    const imageUrl =
      input.imageUrl !== undefined
        ? input.imageUrl
        : input.image !== undefined
        ? input.image
        : undefined;

    const updated = await categoryRepository.update(id, {
      name: input.name,
      slug: input.slug,
      description: input.description,
      imageUrl,
      displayOrder: input.displayOrder,
      visibility: visibilityEnum,
    });

    return formatCategory(updated);
  }

  async deleteCategory(id: string): Promise<{ id: string; message: string }> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new AppError(`Category with ID "${id}" was not found.`, 404, 'CATEGORY_NOT_FOUND');
    }

    // Safety constraint: Prevent deleting category with existing products
    const productCount = await categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category "${existing.name}": ${productCount} associated product(s) exist. Reassign or remove these products first.`,
        409,
        'CATEGORY_HAS_PRODUCTS',
        { productCount }
      );
    }

    await categoryRepository.delete(id);
    return {
      id,
      message: `Category "${existing.name}" was successfully deleted.`,
    };
  }
}

export const categoryService = new CategoryService();
