import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { app } from './server/app';

dotenv.config();

async function startServer() {
  const PORT = 3000;

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production build from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] MeetMind AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
});
