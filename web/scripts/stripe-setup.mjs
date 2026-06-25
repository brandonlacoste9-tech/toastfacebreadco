#!/usr/bin/env node
/**
 * Create JustBookMe Stripe products + prices (test mode).
 * Requires STRIPE_SECRET_KEY in web/.env.local or env.
 *
 * Usage:
 *   npm run stripe:setup
 *   npm run stripe:setup -- --webhook https://justbookme.ca/api/stripe/webhook
 */
import { readFileSync, appendFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = join(__dirname, "../.env.local");

try {
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
} catch {
  // optional
}

const key = process.env.STRIPE_SECRET_KEY?.trim();
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY — add sk_test_… to web/.env.local first.");
  process.exit(1);
}

const webhookArg = process.argv.find((a) => a.startsWith("--webhook="));
const webhookUrl = webhookArg?.split("=")[1] ?? process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/stripe/webhook`
  : null;

const stripe = new Stripe(key);

const PRICES = [
  { env: "STRIPE_PRICE_STARTER_MONTHLY", amount: 4900, interval: "month", tier: "starter" },
  { env: "STRIPE_PRICE_STARTER_ANNUAL", amount: 49000, interval: "year", tier: "starter" },
  { env: "STRIPE_PRICE_PRO_MONTHLY", amount: 14900, interval: "month", tier: "pro" },
  { env: "STRIPE_PRICE_PRO_ANNUAL", amount: 149000, interval: "year", tier: "pro" },
  { env: "STRIPE_PRICE_PREMIUM_MONTHLY", amount: 34900, interval: "month", tier: "premium" },
  { env: "STRIPE_PRICE_PREMIUM_ANNUAL", amount: 349000, interval: "year", tier: "premium" },
];

const PRODUCT_NAME = "JustBookMe Subscription";
const LOOKUP = "justbookme_subscription";

async function findOrCreateProduct() {
  const listed = await stripe.products.list({ limit: 100, active: true });
  const existing = listed.data.find((p) => p.metadata?.lookup === LOOKUP || p.name === PRODUCT_NAME);
  if (existing) return existing;

  return stripe.products.create({
    name: PRODUCT_NAME,
    statement_descriptor: "JUSTBOOKME",
    metadata: { lookup: LOOKUP },
  });
}

async function findOrCreatePrice(productId, spec) {
  const listed = await stripe.prices.list({ product: productId, limit: 100, active: true });
  const existing = listed.data.find(
    (p) =>
      p.currency === "cad" &&
      p.unit_amount === spec.amount &&
      p.recurring?.interval === spec.interval &&
      p.metadata?.tier === spec.tier
  );
  if (existing) return existing;

  return stripe.prices.create({
    product: productId,
    currency: "cad",
    unit_amount: spec.amount,
    recurring: { interval: spec.interval },
    metadata: { tier: spec.tier },
  });
}

async function registerWebhook() {
  if (!webhookUrl) return null;

  const events = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ];

  const listed = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = listed.data.find((w) => w.url === webhookUrl);
  if (existing) {
    console.log(`Webhook already registered: ${webhookUrl}`);
    return existing;
  }

  const endpoint = await stripe.webhookEndpoints.create({
    url: webhookUrl,
    enabled_events: events,
  });
  console.log(`Webhook registered: ${webhookUrl}`);
  return endpoint;
}

async function main() {
  console.log("JustBookMe — Stripe setup (test mode)\n");

  const product = await findOrCreateProduct();
  console.log(`Product: ${product.id} (${product.name})`);

  const envLines = [];
  for (const spec of PRICES) {
    const price = await findOrCreatePrice(product.id, spec);
    console.log(`${spec.env}=${price.id}  ($${(spec.amount / 100).toFixed(2)} CAD/${spec.interval})`);
    envLines.push(`${spec.env}=${price.id}`);
  }

  const endpoint = await registerWebhook();
  if (endpoint?.secret) {
    console.log(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
    envLines.push(`STRIPE_WEBHOOK_SECRET=${endpoint.secret}`);
  } else if (webhookUrl) {
    console.log("\nWebhook endpoint exists — copy signing secret from Stripe Dashboard → Webhooks.");
  }

  if (existsSync(ENV_FILE)) {
    const current = readFileSync(ENV_FILE, "utf8");
    const missing = envLines.filter((line) => !current.includes(line.split("=")[0] + "="));
    if (missing.length) {
      appendFileSync(ENV_FILE, `\n# Stripe (auto-generated ${new Date().toISOString().slice(0, 10)})\n${missing.join("\n")}\n`);
      console.log(`\nAppended ${missing.length} variable(s) to web/.env.local`);
    }
  }

  console.log("\nNext:");
  console.log("  1. Enable Customer Portal in Stripe Dashboard → Settings → Billing → Customer portal");
  console.log("  2. node ../scripts/push-netlify-env-cli.mjs  (or set vars in Netlify UI)");
  console.log("  3. Test: Settings → Billing → Subscribe pro");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});