import { neon } from "@neondatabase/serverless";

// Server-only Neon client. Never import this file from a "use client" component —
// the connection string must never reach the browser bundle.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== "development") {
  console.warn("DATABASE_URL is not set. Database calls will fail.");
}

export const sql = neon(databaseUrl ?? "postgres://placeholder");
