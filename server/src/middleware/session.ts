import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { getConfig } from '../config/index.js';

const PgStore = connectPgSimple(session);

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!pool) {
    const config = getConfig();
    const isSsl =
      config.databaseUrl.includes('sslmode=require') ||
      config.databaseUrl.includes('ssl=true') ||
      process.env.DATABASE_SSL === 'true';

    pool = new pg.Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      ...(isSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return pool;
}

export async function closePgPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export function createSessionMiddleware(): ReturnType<typeof session> {
  const config = getConfig();

  let store: session.Store;

  if (config.isTest && process.env.TEST_USE_MEMORY_STORE === 'true') {
    store = new session.MemoryStore();
  } else {
    const pgStore = new PgStore({
      pool: getPgPool(),
      tableName: 'session',
      createTableIfMissing: false, // Managed by Prisma migrations
    });

    pgStore.on('error', (err) => {
      console.error('[Session Store Error]', err);
    });

    store = pgStore;
  }

  return session({
    name: 'df_sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store,
    cookie: {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      maxAge: config.sessionMaxAgeMs,
      path: '/',
    },
  });
}
