import { adminUserRepository, ListUsersOptions } from '../repositories/adminUser.repository.js';
import { auditLogRepository, ListAuditLogsOptions } from '../repositories/auditLog.repository.js';
import { PasswordService } from './password.service.js';
import { AppError } from '../types/api.js';
import { AdminRole } from '@prisma/client';

export interface RequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AdminUserService {
  /**
   * List administrative users.
   */
  public async listUsers(options: ListUsersOptions) {
    return adminUserRepository.findAll(options);
  }

  /**
   * Get an administrator by ID.
   */
  public async getUserById(id: string) {
    const user = await adminUserRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Create a new administrator account (ADMIN or STAFF).
   */
  public async createUser(
    data: { name: string; email: string; password: string; role: AdminRole },
    actorId: string,
    meta?: RequestMeta
  ) {
    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await adminUserRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 400, 'EMAIL_EXISTS');
    }

    const passwordHash = await PasswordService.hashPassword(data.password);
    const user = await adminUserRepository.create({
      name: data.name,
      email: normalizedEmail,
      passwordHash,
      role: data.role,
      isActive: true,
    });

    await auditLogRepository.create({
      action: 'USER_CREATED',
      actorId,
      targetId: user.id,
      details: { name: user.name, email: user.email, role: user.role },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update an administrator's profile or role.
   */
  public async updateUser(
    id: string,
    data: { name?: string; email?: string; role?: AdminRole },
    actorId: string,
    meta?: RequestMeta
  ) {
    const targetUser = await adminUserRepository.findById(id);
    if (!targetUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const updates: any = {};
    if (data.name) {
      updates.name = data.name.trim();
    }

    if (data.email) {
      const normalizedEmail = data.email.toLowerCase().trim();
      if (normalizedEmail !== targetUser.email.toLowerCase()) {
        const existing = await adminUserRepository.findByEmail(normalizedEmail);
        if (existing && existing.id !== id) {
          throw new AppError('Email address is already in use by another account.', 400, 'EMAIL_EXISTS');
        }
        updates.email = normalizedEmail;
      }
    }

    let roleChanged = false;
    if (data.role && data.role !== targetUser.role) {
      // Invariant: check if demoting the last SUPER_ADMIN
      const isCurrentlySuper = targetUser.role === AdminRole.SUPER_ADMIN || targetUser.role === AdminRole.SUPERADMIN;
      const willBeSuper = data.role === AdminRole.SUPER_ADMIN || data.role === AdminRole.SUPERADMIN;

      if (isCurrentlySuper && !willBeSuper) {
        const activeSupers = await adminUserRepository.countActiveSuperAdmins();
        if (activeSupers <= 1) {
          throw new AppError('Cannot demote the last active Super Admin account.', 400, 'SUPER_ADMIN_REQUIRED');
        }
      }

      updates.role = data.role;
      roleChanged = true;
    }

    const updated = await adminUserRepository.update(id, updates);

    // If role changed, terminate their active sessions to force re-evaluation of permissions
    if (roleChanged) {
      await adminUserRepository.deleteSessionsForUser(id);
      await auditLogRepository.create({
        action: 'ROLE_CHANGED',
        actorId,
        targetId: id,
        details: { oldRole: targetUser.role, newRole: updated.role },
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
    }

    await auditLogRepository.create({
      action: 'USER_UPDATED',
      actorId,
      targetId: id,
      details: { changedFields: Object.keys(updates) },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Activate or deactivate an administrator account.
   */
  public async updateStatus(
    id: string,
    isActive: boolean,
    actorId: string,
    meta?: RequestMeta
  ) {
    if (id === actorId && !isActive) {
      throw new AppError('You cannot deactivate your own administrative account.', 400, 'CANNOT_DEACTIVATE_SELF');
    }

    const targetUser = await adminUserRepository.findById(id);
    if (!targetUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const isCurrentlySuper = targetUser.role === AdminRole.SUPER_ADMIN || targetUser.role === AdminRole.SUPERADMIN;
    if (isCurrentlySuper && !isActive) {
      const activeSupers = await adminUserRepository.countActiveSuperAdmins();
      if (activeSupers <= 1) {
        throw new AppError('Cannot deactivate the last active Super Admin account.', 400, 'SUPER_ADMIN_REQUIRED');
      }
    }

    const updated = await adminUserRepository.update(id, { isActive });

    if (!isActive) {
      // Invalidate sessions immediately upon deactivation
      await adminUserRepository.deleteSessionsForUser(id);
    }

    await auditLogRepository.create({
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      actorId,
      targetId: id,
      details: { email: targetUser.email, role: targetUser.role },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Reset an administrator's password (by SUPER_ADMIN).
   */
  public async resetPassword(
    id: string,
    newPassword: string,
    actorId: string,
    meta?: RequestMeta
  ) {
    const targetUser = await adminUserRepository.findById(id);
    if (!targetUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    const passwordHash = await PasswordService.hashPassword(newPassword);
    await adminUserRepository.update(id, { passwordHash });

    // Terminate existing sessions so the user must log in with new password
    await adminUserRepository.deleteSessionsForUser(id);

    await auditLogRepository.create({
      action: 'PASSWORD_RESET',
      actorId,
      targetId: id,
      details: { email: targetUser.email },
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { success: true };
  }

  /**
   * List audit logs (SUPER_ADMIN only).
   */
  public async listAuditLogs(options: ListAuditLogsOptions) {
    return auditLogRepository.findAll(options);
  }
}

export const adminUserService = new AdminUserService();
