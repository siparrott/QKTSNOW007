import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  calculators,
  userCalculators,
  leads,
  sessions,
  subscriptions,
  blogPosts
} from "@shared/schema";

// Raw value from environment (could contain smart quotes or whitespace)
let raw = process.env.DATABASE_URL || "";

// Sanitize: remove leading/trailing smart quotes / regular quotes / backticks accidentally pasted
raw = raw.trim().replace(/^[“”"'`]+/, "").replace(/[“”"'`]+$/, "");

// Basic heuristic to detect obviously bogus placeholder values the user might have set.
function looksLikePostgresUrl(v: string) {
  return /^postgres(?:ql)?:\/\//i.test(v);
}

let client: any = null;
let db: any = {};
let dbAvailable = false;

if (!raw) {
  console.warn('[startup] DATABASE_URL not set – Postgres will be skipped (in‑memory storage will be used if configured).');
} else if (!looksLikePostgresUrl(raw)) {
  console.warn(`[startup] DATABASE_URL present but does not look like a Postgres URL (value begins with: ${raw.slice(0, 20)}...). Skipping Postgres initialization.`);
} else {
  try {
    // Validate via WHATWG URL constructor first to catch malformed strings early.
    // This will throw for things like stray smart quotes in the middle.
    new URL(raw); // eslint-disable-line no-new
    client = postgres(raw, { prepare: false });
    db = drizzle(client, {
      schema: {
        users,
        calculators,
        userCalculators,
        leads,
        sessions,
        subscriptions,
        blogPosts,
      },
    });
    dbAvailable = true;
    console.log('[startup] Postgres initialized.');
  } catch (err) {
    console.error('[startup] Failed to initialize Postgres – proceeding without DB. Reason:', (err as any)?.message || err);
  }
}

if (!dbAvailable) {
  console.warn('[startup] Running WITHOUT Postgres – persistence features (user accounts, calculators, subscriptions, blog posts) may be temporary.');
}

export { client, db, dbAvailable };