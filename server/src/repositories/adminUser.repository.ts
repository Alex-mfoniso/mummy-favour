import { prisma } from '../lib/prisma.js';
import { AdminUser, AdminRole, Prisma } from '@prisma/client';

export interface ListUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminRole | string;
  isActive?: boolean;
}

export class AdminUserRepository {
  /**
   * Find an administrator by normalized email address.
   */
  public async findByEmail(email: string): Promise<AdminUser | null> {
    return prisma.adminUser.findFirst({
      where: {
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive',
        },
      },
    });
  }

  /**
   * Find an administrator by primary UUID.
   */
  public async findById(id: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new administrator account.
   */
  public async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: AdminRole;
    isActive?: boolean;
  }): Promise<AdminUser> {
    return prisma.adminUser.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role ?? AdminRole.STAFF,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing administrator.
   */
  public async update(
    id: string,
    data: Prisma.AdminUserUpdateInput
  ): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data,
    });
  }

  /**
   * Count total administrators.
   */
  public async count(): Promise<number> {
    return prisma.adminUser.count();
  }

  /**
   * Count active SUPER_ADMIN / SUPERADMIN accounts.
   */
  public async countActiveSuperAdmins(): Promise<number> {
    return prisma.adminUser.count({
      where: {
        role: {
          in: [AdminRole.SUPER_ADMIN, AdminRole.SUPERADMIN],
        },
        isActive: true,
      },
    });
  }

  /**
   * List administrators with filtering, search, and pagination.
   */
  public async findAll(options: ListUsersOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.AdminUserWhereInput = {};

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.role) {
      if (options.role === 'SUPER_ADMIN' || options.role === 'SUPERADMIN') {
        where.role = { in: [AdminRole.SUPER_ADMIN, AdminRole.SUPERADMIN] };
      } else {
        where.role = options.role as AdminRole;
      }
    }

    if (options.search) {
      const search = options.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.adminUser.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Invalidate active session rows for a specific administrator
   * to immediately terminate their logged-in access.
   */
  public async deleteSessionsForUser(userId: string): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(
        `DELETE FROM "session" WHERE sess->>'adminUserId' = $1`,
        userId
      );
    } catch (err) {
      console.warn('Failed to invalidate sessions for user:', userId, err);
    }
  }
}

export const adminUserRepository = new AdminUserRepository();
