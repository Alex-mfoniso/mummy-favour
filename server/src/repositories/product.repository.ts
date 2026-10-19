import { prisma } from '../lib/prisma.js';
import { Product, Prisma, CategoryVisibility, ProductAvailability } from '@prisma/client';

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
        visibility: true;
      };
    };
  };
}>;

export interface FindProductsOptions {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  featured?: boolean;
  status?: ProductAvailability;
  sort?: string;
  includeHiddenCategories?: boolean;
}

export class ProductRepository {
  async findMany(options: FindProductsOptions): Promise<{ products: ProductWithCategory[]; total: number }> {
    const {
      page,
      limit,
      search,
      category,
      featured,
      status,
      sort = 'featured',
      includeHiddenCategories = false,
    } = options;

    const where: Prisma.ProductWhereInput = {};

    // 1. Category Visibility Guard
    if (!includeHiddenCategories) {
      where.category = {
        visibility: CategoryVisibility.VISIBLE,
      };
    }

    // 2. Specific Category Filter (slug or ID)
    if (category) {
      where.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    // 3. Featured Filter
    if (typeof featured === 'boolean') {
      where.featured = featured;
    }

    // 4. Status Filter
    if (status) {
      where.status = status;
    }

    // 5. Search Across Name, Short Description, Description
    if (search && search.trim()) {
      const searchFilter = {
        contains: search.trim(),
        mode: Prisma.QueryMode.insensitive,
      };

      const searchConditions: Prisma.ProductWhereInput[] = [
        { name: searchFilter },
        { shortDescription: searchFilter },
        { description: searchFilter },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // 6. Explicit Sort Mapping (Allowlist only)
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    switch (sort) {
      case 'name-asc':
      case 'title-asc':
        orderBy = [{ name: 'asc' }];
        break;
      case 'name-desc':
      case 'title-desc':
        orderBy = [{ name: 'desc' }];
        break;
      case 'createdAt-asc':
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'createdAt-desc':
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'featured':
      default:
        orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              visibility: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async findBySlug(
    slug: string,
    options?: { includeHiddenCategories?: boolean }
  ): Promise<ProductWithCategory | null> {
    const where: Prisma.ProductWhereInput = { slug };

    if (!options?.includeHiddenCategories) {
      where.category = {
        visibility: CategoryVisibility.VISIBLE,
      };
    }

    return prisma.product.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            visibility: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            visibility: true,
          },
        },
      },
    });
  }

  async create(data: {
    id?: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    categoryId: string;
    mainImageUrl?: string | null;
    galleryImageUrls?: string[];
    specifications?: Prisma.InputJsonValue;
    featured?: boolean;
    status?: ProductAvailability;
  }): Promise<ProductWithCategory> {
    return prisma.product.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        categoryId: data.categoryId,
        mainImageUrl: data.mainImageUrl ?? null,
        galleryImageUrls: data.galleryImageUrls ?? [],
        specifications: data.specifications ?? Prisma.JsonNull,
        featured: data.featured ?? false,
        status: data.status ?? ProductAvailability.IN_STOCK,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            visibility: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      shortDescription?: string;
      description?: string;
      categoryId?: string;
      mainImageUrl?: string | null;
      galleryImageUrls?: string[];
      specifications?: Prisma.InputJsonValue;
      featured?: boolean;
      status?: ProductAvailability;
    }
  ): Promise<ProductWithCategory> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            visibility: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
