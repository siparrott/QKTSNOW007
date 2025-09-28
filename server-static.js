// Ultra-minimal production server to get something online fast.
// Serves the already-built Vite client from dist/public and exposes a health endpoint.
// Bypasses ALL dynamic APIs, Stripe, OpenAI, DB, etc. so the dyno won't crash on complex imports.
// Once this is confirmed working, we can iteratively re-introduce required API routes.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Basic health/diagnostics
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', mode: 'static-only', time: new Date().toISOString() });
});

// Path to built client assets
const distPath = path.join(__dirname, 'dist', 'public');
console.log('[static] expecting built assets at:', distPath);

// Static assets (if build missing, we show a helpful message)
import fs from 'fs';
if (!fs.existsSync(distPath)) {
  console.warn('[static] dist/public missing – did the build step run? You should see it in build logs.');
  app.get('*', (_req, res) => {
    res.status(200).send(`<!doctype html><html><head><meta charset='utf-8'><title>QuoteKit – Build Missing</title><style>body{font-family:system-ui;padding:40px;max-width:640px;margin:auto;line-height:1.4}code{background:#eee;padding:2px 4px;border-radius:4px}</style></head><body><h1>Static Server Running</h1><p>The minimal server is up, but <code>dist/public</code> was not found.</p><ol><li>Ensure Heroku postbuild ran <code>vite build</code>.</li><li>Confirm <code>.slugignore</code> does NOT exclude <code>dist</code>.</li><li>Check build log for lines listing <code>../dist/public/index.html</code>.</li></ol></body></html>`);
  });
} else {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`[static] server listening on port ${port}`);
});
