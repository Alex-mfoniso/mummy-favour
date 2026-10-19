import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/index.js';

// Global singleton declaration to avoid multiple client instances in development
declare global {
  // eslint-disable-next-line no-var
  var __dfPrismaClient: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  const config = getConfig();

  return new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log: config.isDevelopment ? ['warn', 'error'] : ['error'],
  });
}

export const prisma: PrismaClient =
  globalThis.__dfPrismaClient ?? (globalThis.__dfPrismaClient = createPrismaClient());

/**
 * Health check helper to verify database reachable.
 * Never leaks database URLs, credentials, or internal query parameters.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    // Execute low-overhead ping query
    await prisma.$queryRawUnsafe('SELECT 1');
    const latencyMs = Date.now() - startTime;
    return {
      connected: true,
      latencyMs,
    };
  } catch (err: unknown) {
    // Sanitize error: never return raw connection strings or stack traces
    const message = err instanceof Error ? 'Database query failed or timed out' : 'Unknown database error';
    return {
      connected: false,
      error: message,
    };
  }
}

/**
 * Graceful teardown of the database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect errors during process exit
  }
}
