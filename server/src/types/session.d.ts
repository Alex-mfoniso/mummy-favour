import 'express-session';
import { AdminRole } from '@prisma/client';

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
}

declare module 'express-session' {
  interface SessionData {
    adminUserId?: string;
    csrfToken?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: SafeAdminUser;
    }
  }
}
