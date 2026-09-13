import express from 'express';
import { apiRouter } from './routes';

export function createExpressApp() {
  const app = express();

  // CORS headers to support local, Cloud Run, and cross-origin Vercel deployments
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Body parsers with generous limits for audio transcripts and recordings
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/')) {
      console.log(`[API] ${req.method} ${req.originalUrl || req.path}`);
    }
    next();
  });

  // Direct health check endpoints (support both /api/health and /health for Vercel rewrites)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MeetMind AI Intelligence Server',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MeetMind AI Intelligence Server',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API router on /api (standard) AND / (for Vercel serverless functions where prefix may be stripped)
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Global error handler middleware to prevent serverless function crashes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Server Error]', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  });

  return app;
}

export const app = createExpressApp();
export default app;
