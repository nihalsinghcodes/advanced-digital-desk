import cookieParser from 'cookie-parser';
import express from 'express';
import { csrfProtection } from './lib/auth.ts';
import authRoutes from './routes/auth.ts';
import bookmarkRoutes from './routes/bookmarks.ts';
import calendarRoutes from './routes/calendar.ts';
import caseRoutes from './routes/cases.ts';
import clientRoutes from './routes/clients.ts';
import dashboardRoutes from './routes/dashboard.ts';
import documentRoutes from './routes/documents.ts';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/api', csrfProtection);

  // Healthcheck
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timezone: 'Asia/Kolkata' });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api', dashboardRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api', calendarRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/bookmarks', bookmarkRoutes);

  // Explicit 404 for unknown API paths
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Safe global error handler (never leaks stack traces to clients)
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('Unhandled API error:', err);
      res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  );

  return app;
}
