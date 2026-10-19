import { Request, Response, NextFunction } from 'express';
import { adminUserService } from '../services/adminUser.service.js';

export class AdminUserController {
  public async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, role, isActive } = req.query as any;
      const result = await adminUserService.listUsers({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        search: search as string,
        role: role as any,
        isActive: isActive !== undefined ? isActive === true || isActive === 'true' : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await adminUserService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.adminUser!.id;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };

      const user = await adminUserService.createUser(req.body, actorId, meta);
      res.status(201).json({
        success: true,
        message: 'Administrative user created successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.adminUser!.id;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };

      const user = await adminUserService.updateUser(req.params.id, req.body, actorId, meta);
      res.status(200).json({
        success: true,
        message: 'Administrator updated successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.adminUser!.id;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };

      const user = await adminUserService.updateStatus(req.params.id, req.body.isActive, actorId, meta);
      res.status(200).json({
        success: true,
        message: user.isActive ? 'User account activated.' : 'User account deactivated.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorId = req.adminUser!.id;
      const meta = {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      };

      await adminUserService.resetPassword(req.params.id, req.body.password, actorId, meta);
      res.status(200).json({
        success: true,
        message: 'Password reset successfully. The user must log in again.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, action, actorId } = req.query as any;
      const result = await adminUserService.listAuditLogs({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        action: action as string,
        actorId: actorId as string,
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminUserController = new AdminUserController();
