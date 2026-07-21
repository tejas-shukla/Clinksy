// prisma.config.ts — Prisma 7 CLI configuration.
// DATABASE_URL is the Neon Postgres connection string (set in .env.local and Vercel).
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js convention keeps secrets in .env.local; load it for the Prisma CLI too.
config({ path: ".env.local" });
config(); // fallback to .env

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Placeholder keeps `prisma generate` (postinstall) working before the DB
    // exists. Commands that actually connect (db push, migrate, studio) need
    // the real DATABASE_URL in .env.local.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/clinkeys",
  },
});
