import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ESM module (needed to locate built client files)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global process-level diagnostics for crashes
process.on('unhandledRejection', (reason: any) => {
  console.error('[fatal] Unhandled Promise Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught Exception:', err);
});

const app = express();

// CORS middleware - allow all origins in development for Replit environment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Basic early health & root handlers BEFORE async bootstrap (helps if bootstrap crashes)
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok-preinit', time: new Date().toISOString() });
});

// Static assets diagnostic (lists dist/public contents to confirm build presence)
app.get('/__staticdiag', (_req, res) => {
  const distPath = path.resolve(__dirname, '..', 'dist', 'public');
  const assetsDir = path.join(distPath, 'assets');
  const info: any = {
    distPath,
    distPathExists: fs.existsSync(distPath),
    indexHtmlExists: false,
    assetDirExists: false,
    assetSample: [] as string[],
    generatedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
  };
  if (info.distPathExists) {
    const indexPath = path.join(distPath, 'index.html');
    info.indexHtmlExists = fs.existsSync(indexPath);
    if (fs.existsSync(assetsDir)) {
      info.assetDirExists = true;
      try {
        info.assetSample = fs.readdirSync(assetsDir).slice(0, 20);
      } catch {}
    }
  }
  res.json(info);
});

// Note: Root route handler removed - Vite middleware or serveStatic will handle '/' in the bootstrap below

// Stripe webhooks must receive the raw body (for signature verification) so we:
// 1. Attach a raw parser ONLY for that path
// 2. Skip the JSON/urlencoded parsers for that same path
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
    return next(); // leave raw body intact
  }
  // Apply JSON + urlencoded for all other routes
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: false, limit: '50mb' })(req, res, next);
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add a debug middleware to log all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Lightweight early diagnostics BEFORE route registration
  app.get('/__startup', (_req, res) => {
    res.json({
      status: 'starting',
      nodeEnv: process.env.NODE_ENV,
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasDbUrl: !!process.env.DATABASE_URL,
      time: new Date().toISOString()
    });
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('[express-error]', status, message, err?.stack);
    // Respond but DO NOT rethrow (rethrowing crashes the process on any request error)
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use Heroku provided PORT or fallback to 5000 locally
  const port = Number(process.env.PORT) || 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
