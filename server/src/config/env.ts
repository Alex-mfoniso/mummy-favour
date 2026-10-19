import { z } from 'zod';
import dotenv from 'dotenv';

// In test environment, allow loading .env or using pre-set env vars
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required and must not be empty' })
    .min(1, 'DATABASE_URL is required and must not be empty')
    .refine((val) => val.startsWith('postgresql://') || val.startsWith('postgres://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string',
    }),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173,http://localhost:3000'),
  ALLOW_DEV_ADMIN_WRITES: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val.toLowerCase() === 'true' || val === '1';
    }),
  // Phase 9 Auth & Session Configuration
  SESSION_SECRET: z
    .string()
    .optional(),
  SESSION_MAX_AGE_MS: z
    .string()
    .default('86400000') // 24 hours
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'SESSION_MAX_AGE_MS must be a positive number',
    }),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val.toLowerCase() === 'true' || val === '1';
    }),
  COOKIE_SAME_SITE: z
    .enum(['lax', 'strict', 'none'])
    .default('lax'),
  AUTH_RATE_LIMIT_WINDOW_MS: z
    .string()
    .default('900000') // 15 mins
    .transform((val) => parseInt(val, 10)),
  AUTH_RATE_LIMIT_MAX: z
    .string()
    .default('10') // 10 attempts
    .transform((val) => parseInt(val, 10)),
});

export type RawEnv = z.infer<typeof envSchema>;

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  isProduction: boolean;
  isTest: boolean;
  isDevelopment: boolean;
  databaseUrl: string;
  corsOrigins: string[];
  allowDevAdminWrites: boolean;
  sessionSecret: string;
  sessionMaxAgeMs: number;
  cookieSecure: boolean;
  cookieSameSite: 'lax' | 'strict' | 'none';
  authRateLimitWindowMs: number;
  authRateLimitMax: number;
}

export function parseAndValidateEnv(envSource: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(envSource);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => ` - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`[Config Error] Missing or invalid environment configuration:\n${issues}`);
  }

  const data = result.data;
  const isProd = data.NODE_ENV === 'production';

  // In production, session secret MUST be provided and at least 32 characters
  if (isProd) {
    if (!data.SESSION_SECRET || data.SESSION_SECRET.trim().length < 32) {
      throw new Error(
        '[Config Error] In production, SESSION_SECRET is strictly required and must be at least 32 characters long.'
      );
    }
  }

  const defaultDevSecret = 'divine-favour-development-session-secret-min-32-chars';
  const sessionSecret = data.SESSION_SECRET && data.SESSION_SECRET.trim().length >= 32
    ? data.SESSION_SECRET.trim()
    : defaultDevSecret;

  const origins = data.CORS_ORIGIN.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const cookieSecure = data.COOKIE_SECURE !== undefined
    ? data.COOKIE_SECURE
    : isProd;

  return {
    port: data.PORT,
    nodeEnv: data.NODE_ENV,
    isProduction: isProd,
    isTest: data.NODE_ENV === 'test',
    isDevelopment: data.NODE_ENV === 'development',
    databaseUrl: data.DATABASE_URL,
    corsOrigins: origins.length > 0 ? origins : ['http://localhost:5173'],
    allowDevAdminWrites: isProd ? false : data.ALLOW_DEV_ADMIN_WRITES ?? true,
    sessionSecret,
    sessionMaxAgeMs: data.SESSION_MAX_AGE_MS,
    cookieSecure,
    cookieSameSite: data.COOKIE_SAME_SITE,
    authRateLimitWindowMs: data.AUTH_RATE_LIMIT_WINDOW_MS,
    authRateLimitMax: data.AUTH_RATE_LIMIT_MAX,
  };
}
