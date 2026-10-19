import { app } from './app.js';
import { getConfig } from './config/index.js';
import { checkDatabaseConnection, disconnectDatabase } from './lib/prisma.js';
import { closePgPool } from './middleware/session.js';

// Divine Favour API Server bootstrap
async function bootstrap() {
  const config = getConfig();

  // Test database connection at startup
  const dbCheck = await checkDatabaseConnection();
  if (dbCheck.connected) {
    console.log(`[Database] Connected successfully (${dbCheck.latencyMs}ms latency)`);
  } else {
    console.warn(`[Database Warning] Unable to verify initial connection: ${dbCheck.error}`);
    console.warn('[Database Warning] The application will continue running, but database-dependent routes will fail readiness checks.');
  }

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`  Divine Favour API Server started`);
    console.log(`  Environment : ${config.nodeEnv}`);
    console.log(`  Listening on: http://localhost:${config.port}`);
    console.log(`  Health Check: http://localhost:${config.port}/api/v1/health`);
    console.log(`  Readiness   : http://localhost:${config.port}/api/v1/health/ready`);
    console.log('====================================================');
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n[Shutdown] Received ${signal}. Initiating graceful teardown...`);

    server.close(async () => {
      console.log('[Shutdown] HTTP server closed.');
      await disconnectDatabase();
      await closePgPool();
      console.log('[Shutdown] Database connections closed.');
      process.exit(0);
    });

    // Force exit if shutdown hangs for more than 10 seconds
    setTimeout(() => {
      console.error('[Shutdown Error] Forcefully terminating after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err: unknown) => {
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.error('[Fatal Startup Error]', errorMessage);
  process.exit(1);
});
