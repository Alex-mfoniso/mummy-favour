import { adminUserRepository } from '../repositories/adminUser.repository.js';
import { PasswordService } from './password.service.js';
import { AppError } from '../types/api.js';
import { SafeAdminUser } from '../types/session.js';

export class AuthService {
  /**
   * Authenticate an administrator by email and password.
   * Protects against account enumeration and timing attacks.
   */
  public async login(emailInput: string, passwordInput: string): Promise<SafeAdminUser> {
    const normalizedEmail = emailInput ? emailInput.toLowerCase().trim() : '';

    if (!normalizedEmail || !passwordInput) {
      throw new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS');
    }

    const user = await adminUserRepository.findByEmail(normalizedEmail);

    if (!user) {
      // Execute timing-safe dummy hash verification to mitigate user-enumeration timing attacks
      await PasswordService.performDummyVerification();
      throw new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      // Execute timing-safe dummy verification and return identical generic error
      await PasswordService.performDummyVerification();
      throw new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS');
    }

    const isValid = await PasswordService.verifyPassword(user.passwordHash, passwordInput);

    if (!isValid) {
      throw new AppError('Invalid email address or password.', 401, 'INVALID_CREDENTIALS');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === ('SUPERADMIN' as any) ? ('SUPER_ADMIN' as any) : user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /**
   * Retrieve safe administrator representation by ID.
   * Rejects inactive users to ensure sessions for disabled accounts are terminated.
   */
  public async getSafeUserById(id: string): Promise<SafeAdminUser | null> {
    if (!id) return null;

    const user = await adminUserRepository.findById(id);

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === ('SUPERADMIN' as any) ? ('SUPER_ADMIN' as any) : user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
