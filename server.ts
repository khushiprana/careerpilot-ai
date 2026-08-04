import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import healthHandler from './api/health.js';
import extractPdfHandler from './api/extract-pdf.js';
import resumeReviewHandler from './api/resume-review.js';
import atsCheckHandler from './api/ats-check.js';
import roadmapHandler from './api/roadmap.js';
import interviewHandler from './api/interview.js';
import coverLetterHandler from './api/cover-letter.js';
import projectSuggestionHandler from './api/project-suggestion.js';
import chatHandler from './api/chat.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

function asyncHandler(fn: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      console.error(`[API Error] Path: ${req.path}`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'Internal server error' });
      }
    }
  };
}

app.all('/api/health', asyncHandler((req, res) => healthHandler(req as any, res as any)));
app.all('/api/extract-pdf', asyncHandler((req, res) => extractPdfHandler(req as any, res as any)));
app.all('/api/resume-review', asyncHandler((req, res) => resumeReviewHandler(req as any, res as any)));
app.all('/api/ats-check', asyncHandler((req, res) => atsCheckHandler(req as any, res as any)));
app.all('/api/roadmap', asyncHandler((req, res) => roadmapHandler(req as any, res as any)));
app.all('/api/interview', asyncHandler((req, res) => interviewHandler(req as any, res as any)));
app.all('/api/cover-letter', asyncHandler((req, res) => coverLetterHandler(req as any, res as any)));
app.all('/api/project-suggestion', asyncHandler((req, res) => projectSuggestionHandler(req as any, res as any)));
app.all('/api/chat', asyncHandler((req, res) => chatHandler(req as any, res as any)));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareerPilot AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
