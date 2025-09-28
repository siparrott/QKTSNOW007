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

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[startup] DATABASE_URL not set – Postgres client not initialized (in‑memory storage will be used if configured).');
}

// Only create client when we actually have a connection string
export const client = connectionString ? postgres(connectionString, { prepare: false }) : (null as any);
export const db = connectionString ? drizzle(client, {
  schema: {
    users,
    calculators,
    userCalculators,
    leads,
    sessions,
    subscriptions,
    blogPosts,
  },
}) : ({} as any);