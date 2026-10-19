import { prisma } from '../lib/prisma.js';

export interface CreateAuditLogData {
  action: string;
  actorId?: string | null;
  targetId?: string | null;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ListAuditLogsOptions {
  page?: number;
  limit?: number;
  action?: string;
  actorId?: string;
}

export class AuditLogRepository {
  public async create(data: CreateAuditLogData) {
    return prisma.auditLog.create({
      data: {
        action: data.action,
        actorId: data.actorId ?? null,
        targetId: data.targetId ?? null,
        details: data.details ? (data.details as any) : undefined,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }

  public async findAll(options: ListAuditLogsOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.action) {
      where.action = options.action;
    }
    if (options.actorId) {
      where.actorId = options.actorId;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, name: true, email: true, role: true },
          },
          target: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditLogRepository = new AuditLogRepository();
