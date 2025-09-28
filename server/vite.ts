import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

// Recreate __dirname in ESM context (import.meta.dirname is NOT standard and caused runtime crash)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production we build to <root>/dist/public; adjust path accordingly
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    console.error(`[static] Missing build directory at ${distPath} – serving fallback page. (Build may have been pruned.)`);
    app.get('*', (_req, res) => {
      res.status(200).send(`<!doctype html><html><head><meta charset='utf-8'><title>QuoteKit – Build Missing</title><style>body{font-family:system-ui;padding:40px;max-width:640px;margin:auto;line-height:1.4}code{background:#eee;padding:2px 4px;border-radius:4px}</style></head><body><h1>Server Online – Client Build Missing</h1><p>The backend started successfully, but the compiled client assets were not found at <code>${distPath}</code>.</p><h2>Likely Causes</h2><ul><li>Heroku postbuild ran but output directory name mismatch</li><li>Assets removed by .slugignore</li><li>Build failed silently</li></ul><h2>Next Steps</h2><ol><li>Check build log contained line for <code>../dist/public/index.html</code> (it did).</li><li>Confirm directory exists at runtime (add temporary ls step or avoid pruning).</li><li>Ensure .slugignore does NOT exclude <code>dist</code>.</li></ol><p>API health can be tested at <code>/api/health</code>.</p></body></html>`);
    });
    return;
  }

  app.use(express.static(distPath));
  app.use('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}
