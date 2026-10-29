import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

// DATABASE_URL comes from the environment; locally that is .env.local (pulled from Vercel).
if (!process.env.DATABASE_URL && existsSync(".env.local")) process.loadEnvFile(".env.local")

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
})
