import { config } from 'dotenv';
import * as path from 'path';

// Load .env from project root (one level up from backend/)
config({ path: path.resolve(__dirname, '..', '.env') });

import { defineConfig, env } from "prisma/config";

/**
 * Supabase: use Transaction pooler in DATABASE_URL for the running API + Prisma Client.
 * For `prisma migrate`, set DIRECT_URL to the **Direct connection** (db.*.supabase.co:5432, sslmode=require).
 * If unset, Migrate falls back to DATABASE_URL (pooler — can hang on DDL; not recommended).
 */
function directUrlForMigrate(): string {
  const d = process.env.DIRECT_URL?.trim();
  if (d) return d;
  return env("DATABASE_URL");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: directUrlForMigrate(),
  },
});
