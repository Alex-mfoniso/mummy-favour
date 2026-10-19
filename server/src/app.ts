import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import { getConfig } from './config/index.js';
import { apiRouter } from './routes/index.js';
import {
  notFoundHandler,
  errorHandler,
  createSessionMiddleware,
  ensureCsrfToken,
} from './middleware/index.js';

export function createApp(): Express {
  const config = getConfig();
  const app = express();

  // 1. Trust proxy if behind a reverse proxy in production
  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  // 2. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 3. Strict / Configurable CORS with Credentials
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, test suites)
        if (!origin) {
          return callback(null, true);
        }
        if (config.corsOrigins.includes('*') || config.corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        // In local development, allow localhost on any port
        if (config.isDevelopment && origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token', 'X-Tracking-Token', 'x-tracking-token'],
    })
  );

  // 4. Body Parsing with Strict Size Limit (100kb)
  app.use(express.json({ limit: '100kb' }));

  // 5. Server-Managed Session Store (PostgreSQL / connect-pg-simple)
  app.use(createSessionMiddleware());

  // 6. Ensure CSRF Token Exists for Session
  app.use(ensureCsrfToken);

  // Serve static images uploaded or bundled in public/images
  const rootImages = path.resolve(process.cwd(), 'public/images');
  const parentImages = path.resolve(process.cwd(), '../public/images');
  const imagesPath = fs.existsSync(rootImages) ? rootImages : parentImages;
  app.use('/images', express.static(imagesPath));

  // 7. API v1 Router Mount
  app.use('/api/v1', apiRouter);

  // 8. 404 Route Not Found Handler
  app.use(notFoundHandler);

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
