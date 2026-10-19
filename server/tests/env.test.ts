import { describe, it, expect } from 'vitest';
import { parseAndValidateEnv } from '../src/config/env.js';

describe('Environment Configuration Validation', () => {
  it('parses valid environment configuration with defaults', () => {
    const validEnv = {
      DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/divine_favour_test?schema=public',
    };

    const config = parseAndValidateEnv(validEnv as NodeJS.ProcessEnv);

    expect(config.port).toBe(5000);
    expect(config.nodeEnv).toBe('development');
    expect(config.databaseUrl).toBe(validEnv.DATABASE_URL);
    expect(config.corsOrigins).toContain('http://localhost:5173');
    expect(config.sessionSecret).toBeDefined();
    expect(config.cookieSecure).toBe(false);
  });

  it('rejects missing DATABASE_URL with a clear error', () => {
    const invalidEnv = {
      PORT: '5000',
    };

    expect(() => parseAndValidateEnv(invalidEnv as NodeJS.ProcessEnv)).toThrowError(
      /DATABASE_URL is required/
    );
  });

  it('rejects invalid database scheme that is not postgresql', () => {
    const invalidEnv = {
      DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
    };

    expect(() => parseAndValidateEnv(invalidEnv as NodeJS.ProcessEnv)).toThrowError(
      /DATABASE_URL must be a valid PostgreSQL connection string/
    );
  });

  it('parses custom port and cors origins correctly in production with valid secret', () => {
    const customEnv = {
      PORT: '8080',
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      CORS_ORIGIN: 'https://divinefavour.com, https://admin.divinefavour.com',
      SESSION_SECRET: 'a-super-secret-production-key-that-is-at-least-32-chars-long',
    };

    const config = parseAndValidateEnv(customEnv as NodeJS.ProcessEnv);

    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('production');
    expect(config.isProduction).toBe(true);
    expect(config.cookieSecure).toBe(true);
    expect(config.corsOrigins).toEqual([
      'https://divinefavour.com',
      'https://admin.divinefavour.com',
    ]);
  });

  it('strictly rejects missing or short SESSION_SECRET in production', () => {
    const missingSecretEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    };

    expect(() => parseAndValidateEnv(missingSecretEnv as NodeJS.ProcessEnv)).toThrowError(
      /In production, SESSION_SECRET is strictly required/
    );

    const shortSecretEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      SESSION_SECRET: 'too-short',
    };

    expect(() => parseAndValidateEnv(shortSecretEnv as NodeJS.ProcessEnv)).toThrowError(
      /In production, SESSION_SECRET is strictly required/
    );
  });
});
