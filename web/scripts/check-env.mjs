#!/usr/bin/env node
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  for (const line of readFileSync(join(__dirname, "../.env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
} catch {
  // .env.local optional for CI
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

function set(key) {
  return Boolean(process.env[key]?.trim());
}

function warnWrong(key, badPrefix, hint) {
  const v = process.env[key]?.trim();
  if (v?.startsWith(badPrefix)) {
    console.log(`⚠ ${key} looks wrong (${badPrefix}…) — ${hint}`);
    return true;
  }
  return false;
}

let missing = 0;

console.log("JustBookMe — app credentials\n");

console.log("── Core (required) ──");
for (const key of required) {
  const ok = set(key);
  console.log(`${ok ? "✓" : "✗"} ${key}`);
  if (!ok) missing++;
}

console.log("\n── Twilio SMS ──");
warnWrong("TWILIO_ACCOUNT_SID", "US", "use AC… Account SID");
warnWrong("TWILIO_ACCOUNT_SID", "OQ", "OAuth Client ID — not Account SID");
const twilioAc = set("TWILIO_ACCOUNT_SID") && process.env.TWILIO_ACCOUNT_SID.startsWith("AC");
const twilioToken = set("TWILIO_AUTH_TOKEN");
const twilioPhone = set("TWILIO_PHONE_NUMBER") || set("TWILIO_MESSAGING_SERVICE_SID");
console.log(`${twilioAc ? "✓" : "○"} TWILIO_ACCOUNT_SID (AC…)`);
console.log(`${twilioToken ? "✓" : "○"} TWILIO_AUTH_TOKEN`);
console.log(`${twilioPhone ? "✓" : "✗"} TWILIO_PHONE_NUMBER or MESSAGING_SERVICE_SID`);
if (twilioAc && twilioToken && !twilioPhone) {
  console.log("  → Buy +1 514/438 number in Twilio Console");
}

console.log("\n── Vapi (AI voice) ──");
const vapiPrivate = set("VAPI_PRIVATE_KEY");
const vapiPublic = set("NEXT_PUBLIC_VAPI_PUBLIC_KEY");
console.log(`${vapiPrivate ? "✓" : "○"} VAPI_PRIVATE_KEY (server)`);
console.log(`${vapiPublic ? "✓" : "○"} NEXT_PUBLIC_VAPI_PUBLIC_KEY`);

console.log("\n── Stripe (billing) ──");
const stripeKey = set("STRIPE_SECRET_KEY");
const stripeWebhook = set("STRIPE_WEBHOOK_SECRET");
const stripePrices = [
  "STRIPE_PRICE_STARTER_MONTHLY",
  "STRIPE_PRICE_STARTER_ANNUAL",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_PRO_ANNUAL",
  "STRIPE_PRICE_PREMIUM_MONTHLY",
  "STRIPE_PRICE_PREMIUM_ANNUAL",
].filter(set);
console.log(`${stripeKey ? "✓" : "○"} STRIPE_SECRET_KEY`);
console.log(`${stripeWebhook ? "✓" : "○"} STRIPE_WEBHOOK_SECRET`);
console.log(`${stripePrices.length === 6 ? "✓" : "○"} price IDs (${stripePrices.length}/6)`);
if (stripeKey && stripePrices.length < 6) {
  console.log("  → run: npm run stripe:setup");
}

console.log("\n── Optional ──");
for (const key of ["NEXT_PUBLIC_CALENDLY_URL", "OLLAMA_BASE_URL", "DATABASE_URL", "CRON_SECRET"]) {
  console.log(`${set(key) ? "✓" : "○"} ${key}`);
}

if (set("TWILIO_API_KEY_SID") || set("TWILIO_OAUTH")) {
  console.log("\n── Ignored by app (safe to remove) ──");
  if (set("TWILIO_API_KEY_SID")) console.log("○ TWILIO_API_KEY_* — Auth Token used instead");
}

console.log(
  `\nSMS ready: ${twilioAc && twilioToken && twilioPhone ? "YES" : "NO — need phone number"}`
);

if (missing > 0) {
  console.log(`\n${missing} required variable(s) missing. See web/.env.local.example`);
  process.exit(1);
}

process.exit(0);