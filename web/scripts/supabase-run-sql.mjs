#!/usr/bin/env node
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = "ulbfaxhsbbckotcbmslk";
const TOKEN = process.argv[2] || process.env.SUPABASE_ACCESS_TOKEN;
const sqlFile = process.argv[3];

if (!TOKEN) {
  console.error("Usage: node supabase-run-sql.mjs <sbp_token> <sql-file>");
  process.exit(1);
}
if (!sqlFile) {
  console.error("Missing sql file path");
  process.exit(1);
}

const sql = readFileSync(sqlFile, "utf8");

const endpoints = [
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query/read-only`,
];

let lastErr = null;
for (const url of endpoints) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    if (res.ok) {
      console.log("✓ SQL executed via", url);
      if (data) console.log(JSON.stringify(data).slice(0, 500));
      process.exit(0);
    }
    lastErr = `${url} ${res.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`;
  } catch (e) {
    lastErr = `${url}: ${e.message}`;
  }
}

console.error("✗", lastErr);
process.exit(1);