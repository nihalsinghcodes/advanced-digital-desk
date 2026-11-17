import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { seedDatabase } from './prisma/seed.ts';
import { createApp } from './server/app.ts';
import { prisma } from './server/lib/prisma.ts';

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  // Ensure official portal directory is initialized on startup
  const catCount = await prisma.portalCategory.count();
  if (catCount === 0) {
    await seedDatabase(prisma);
  }

  const app = createApp();

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false }));

    // Private routes get X-Robots-Tag: noindex, nofollow
    app.get('*', (req, res) => {
      if (
        req.path.startsWith('/desk') ||
        req.path.startsWith('/login') ||
        req.path.startsWith('/register')
      ) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      }
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Advocate Digital Desk server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
