#!/usr/bin/env node
/**
 * Pre-pilot production smoke test.
 * Usage: npm run pilot:smoke
 *        npm run pilot:smoke -- https://justbookme.ca
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://justbookme.ca").replace(
  /\/$/,
  ""
);

const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

let failed = 0;
function pass(msg) {
  console.log(`✓ ${msg}`);
}
function fail(msg, detail) {
  console.log(`✗ ${msg}`);
  if (detail) console.log(`  ${detail}`);
  failed++;
}

console.log(`JustBookMe pilot smoke @ ${BASE}\n`);

// 1. Core verify-all
console.log("── verify-all ──");
const verify = spawnSync("node", ["scripts/verify-all.mjs", BASE], {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
  shell: true,
});
if (verify.status !== 0) failed++;

// 2. Production health flags
console.log("\n── Production health ──");
try {
  const res = await fetch(`${BASE}/api/health`);
  const health = await res.json();
  if (health.checks?.cron_secret === true) pass("CRON_SECRET configured on production");
  else fail("CRON_SECRET on production", "Set in Netlify env — reminders won't run");
  if (health.checks?.usage_enforce === true) {
    console.log("  ⚠ USAGE_ENFORCE=true on production — outbound SMS may pause at 2× limit");
  } else {
    pass("USAGE_ENFORCE off (pilot-safe)");
  }
} catch (e) {
  fail("GET /api/health flags", e.message);
}

// 3. Integration endpoints
console.log("\n── Pilot integrations ──");

const integrationPaths = [
  { path: "/api/vapi/status", name: "Vapi status" },
  { path: "/api/sms/status", name: "Twilio SMS status" },
];

for (const { path, name } of integrationPaths) {
  try {
    const res = await fetch(`${BASE}${path}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) pass(`${name} → configured`);
    else if (res.status === 503) pass(`${name} → 503 (not configured — ok for staging)`);
    else fail(`${name} → ${res.status}`, JSON.stringify(data));
  } catch (e) {
    fail(name, e.message);
  }
}

// 4. Cron auth (must reject without secret)
console.log("\n── Cron security ──");
for (const path of ["/api/cron/reminders", "/api/cron/usage-rollup"]) {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (res.status === 401) pass(`${path} rejects unauthenticated`);
    else fail(`${path}`, `expected 401, got ${res.status}`);
  } catch (e) {
    fail(path, e.message);
  }
}

// 5. Optional cron trigger with secret
const secret = process.env.CRON_SECRET?.trim();
if (secret) {
  console.log("\n── Cron execution (CRON_SECRET set) ──");
  try {
    const res = await fetch(`${BASE}/api/cron/usage-rollup`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    if (res.ok && data.ok) pass(`usage-rollup → ${data.refreshed ?? 0} businesses refreshed`);
    else fail("usage-rollup", JSON.stringify(data));
  } catch (e) {
    fail("usage-rollup", e.message);
  }
} else {
  console.log("\n○ CRON_SECRET not set locally — skip live cron test");
}

// 6. Public book page pattern
console.log("\n── Public booking ──");
try {
  const res = await fetch(`${BASE}/api/public/book?slug=__smoke_test__`);
  if (res.status === 404) pass("public/book API returns 404 for unknown slug");
  else fail("public/book API", `expected 404, got ${res.status}`);
} catch (e) {
  fail("public/book API", e.message);
}

console.log(
  `\n${failed === 0 ? "Pilot smoke passed." : `${failed} check(s) failed — fix before salon pilot.`}`
);
process.exit(failed === 0 ? 0 : 1);