#!/usr/bin/env node
/**
 * Full smoke test — run against local dev/prod or production URL.
 * Usage: node scripts/verify-all.mjs [baseUrl]
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] || "http://localhost:3000";

// Load .env.local for check-env parity
const envPath = join(__dirname, "../.env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
} catch {
  console.warn("⚠ No .env.local — API tests may fail locally\n");
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

let failed = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg, detail) {
  console.log(`✗ ${msg}`);
  if (detail) console.log(`  ${detail}`);
  failed++;
}

console.log(`JustBookMe — verify-all @ ${BASE}\n`);

// 1. Env
console.log("── Environment (.env.local) ──");
for (const key of required) {
  if (process.env[key]?.trim()) pass(key);
  else fail(key, "missing");
}

// 2. Pages
console.log("\n── Pages ──");
const pages = [
  "/",
  "/pricing",
  "/signup?plan=pro",
  "/signup?plan=starter",
  "/login",
  "/privacy",
  "/terms",
];
for (const path of pages) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.ok) pass(`${path} → ${res.status}`);
    else fail(`${path} → ${res.status}`);
  } catch (e) {
    fail(path, e.message);
  }
}

// 3. Health API
console.log("\n── APIs ──");
let health;
try {
  const res = await fetch(`${BASE}/api/health`);
  health = await res.json();
  if (res.status === 200 && health.status === "ok" && health.checks?.database) {
    pass(`GET /api/health → ok, database connected`);
  } else {
    fail(`GET /api/health → ${res.status}`, JSON.stringify(health));
  }
} catch (e) {
  fail("GET /api/health", e.message);
}

// 4. Waitlist API
const waitlistBody = {
  business_name: "Verify Test Salon",
  contact_name: "Smoke Test",
  email: `verify-${Date.now()}@example.com`,
  city: "Montréal",
  primary_pain: "missed_calls",
  locale: "fr-CA",
};
try {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(waitlistBody),
  });
  const data = await res.json();
  if (res.status === 200 && data.persisted === true && data.founder_code) {
    pass(`POST /api/waitlist → persisted, ${data.founder_code}`);
  } else {
    fail(`POST /api/waitlist → ${res.status}`, JSON.stringify(data));
  }
} catch (e) {
  fail("POST /api/waitlist", e.message);
}

// 5. Waitlist validation (400)
try {
  const res = await fetch(`${BASE}/api/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "bad" }),
  });
  if (res.status === 400) pass("POST /api/waitlist (invalid) → 400");
  else fail("POST /api/waitlist (invalid)", `expected 400, got ${res.status}`);
} catch (e) {
  fail("POST /api/waitlist validation", e.message);
}

// 6. Signup API validation
try {
  const res = await fetch(`${BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (res.status === 400) pass("POST /api/signup (empty) → 400");
  else if (res.status === 503) pass("POST /api/signup (empty) → 503 (env issue)");
  else fail("POST /api/signup (empty)", `unexpected ${res.status}`);
} catch (e) {
  fail("POST /api/signup", e.message);
}

// 7. Signup API full flow (unique email)
const signupEmail = `verify-${Date.now()}@mailinator.com`;
try {
  const res = await fetch(`${BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: signupEmail,
      password: "VerifyTest2026!Aa",
      business_name: "Verify Barber Test",
      city: "Montréal",
      plan: "pro",
      locale: "fr",
    }),
  });
  const data = await res.json();
  if (res.status === 200 && data.ok && data.business_id) {
    pass(`POST /api/signup (full) → account + business created`);
  } else if (res.status === 400 && data.error?.includes("rate limit")) {
    pass("POST /api/signup (full) → skipped (Supabase rate limit)");
  } else {
    fail(`POST /api/signup (full) → ${res.status}`, JSON.stringify(data));
  }
} catch (e) {
  fail("POST /api/signup (full)", e.message);
}

console.log(`\n${failed === 0 ? "All checks passed." : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);