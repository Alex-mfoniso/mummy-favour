import argon2 from 'argon2';

/**
 * Service for secure, timing-safe password hashing and verification using Argon2id.
 */
export class PasswordService {
  /**
   * Hashes a plaintext password using Argon2id with robust security parameters:
   * - Type: Argon2id (resistant to side-channel and GPU cracking attacks)
   * - Memory: 64 MB (65,536 KB)
   * - Iterations / Time Cost: 3 passes
   * - Parallelism: 4 threads
   */
  public static async hashPassword(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies a plaintext candidate password against an Argon2id hash.
   * Employs timing-safe verification provided internally by Argon2.
   */
  public static async verifyPassword(hash: string, candidate: string): Promise<boolean> {
    if (!hash || !candidate) {
      return false;
    }

    try {
      return await argon2.verify(hash, candidate);
    } catch {
      // In case of malformed hash format, reject safely
      return false;
    }
  }

  /**
   * Performs a dummy password verification against a synthetic hash.
   * Used to prevent timing attacks when an account does not exist.
   */
  public static async performDummyVerification(): Promise<void> {
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dHVtbXlfc2FsdF9mb3JfdGltaW5n$e1d4Z1mUfUjS8Q';
    try {
      await argon2.verify(dummyHash, 'invalid_dummy_password');
    } catch {
      // ignore
    }
  }
}
