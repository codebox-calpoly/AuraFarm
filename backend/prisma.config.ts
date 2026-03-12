import { config } from 'dotenv';
import * as path from 'path';

// Load .env from project root (one level up from backend/)
config({ path: path.resolve(__dirname, '..', '.env') });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
