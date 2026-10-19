import { prisma } from '../lib/prisma.js';
import { Category, CategoryVisibility } from '@prisma/client';

export interface CategoryWithCount extends Category {
  _count?: {
    products: number;
  };
}

export class CategoryRepository {
  /**
   * List categories ordered by displayOrder asc, then createdAt asc.
   * If includeHidden is false, only VISIBLE categories are returned.
   */
  async findMany(options: {
    includeHidden?: boolean;
    includeProductCounts?: boolean;
  }): Promise<CategoryWithCount[]> {
    const where = options.includeHidden
      ? {}
      : { visibility: CategoryVisibility.VISIBLE };

    return prisma.category.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'asc' },
      ],
      include: options.includeProductCounts
        ? {
            _count: {
              select: { products: true },
            },
          }
        : undefined,
    });
  }

  async findBySlug(slug: string, options?: { includeHidden?: boolean }): Promise<CategoryWithCount | null> {
    const where: { slug: string; visibility?: CategoryVisibility } = { slug };
    if (!options?.includeHidden) {
      where.visibility = CategoryVisibility.VISIBLE;
    }

    return prisma.category.findFirst({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findById(id: string): Promise<CategoryWithCount | null> {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async countProducts(id: string): Promise<number> {
    return prisma.product.count({
      where: { categoryId: id },
    });
  }

  async create(data: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    imageUrl?: string | null;
    displayOrder?: number;
    visibility?: CategoryVisibility;
  }): Promise<Category> {
    return prisma.category.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        displayOrder: data.displayOrder ?? 1,
        visibility: data.visibility ?? CategoryVisibility.VISIBLE,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      imageUrl?: string | null;
      displayOrder?: number;
      visibility?: CategoryVisibility;
    }
  ): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }
}

export const categoryRepository = new CategoryRepository();
