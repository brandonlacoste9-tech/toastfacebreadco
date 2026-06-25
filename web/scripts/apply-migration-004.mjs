#!/usr/bin/env node
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dirname, "../.env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const sql = readFileSync(
  join(__dirname, "../../supabase/migrations/004_operations.sql"),
  "utf8"
);

const client = new pg.Client({ connectionString: env.DATABASE_URL });
await client.connect();
try {
  await client.query(sql);
  console.log("✓ Migration 004 applied");
} catch (e) {
  console.error("✗", e.message);
  process.exit(1);
} finally {
  await client.end();
}