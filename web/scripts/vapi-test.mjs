#!/usr/bin/env node
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(__dirname, "../.env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const key = process.env.VAPI_PRIVATE_KEY;
if (!key) {
  console.error("Missing VAPI_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const res = await fetch("https://api.vapi.ai/assistant", {
  headers: { Authorization: `Bearer ${key}` },
});
const data = await res.json().catch(() => null);

if (!res.ok) {
  console.error(`✗ Vapi API ${res.status}:`, data?.message ?? JSON.stringify(data));
  process.exit(1);
}

const count = Array.isArray(data) ? data.length : 0;
console.log(`✓ Vapi API OK — ${count} assistant(s)`);
if (count > 0) {
  for (const a of data.slice(0, 5)) {
    console.log(`  - ${a.name ?? "(unnamed)"} (${a.id})`);
  }
}