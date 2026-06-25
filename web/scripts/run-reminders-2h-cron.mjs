#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://justbookme.ca").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;
const headers = secret ? { Authorization: `Bearer ${secret}` } : {};

const res = await fetch(`${base}/api/cron/reminders-2h`, { headers });
const data = await res.json();
console.log(res.status, data);
if (!res.ok) process.exit(1);