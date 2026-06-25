#!/usr/bin/env node
/**
 * Send a test booking confirmation SMS.
 * Usage: node scripts/twilio-send-test.mjs [E.164 phone, e.g. +15145551234]
 * Trial accounts: destination must be a verified number in Twilio Console.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";

const __dirname = dirname(fileURLToPath(import.meta.url));
for (const line of readFileSync(join(__dirname, "../.env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const ac = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
let to = process.argv[2];

if (!ac || !token || !from) {
  console.error("Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER");
  process.exit(1);
}

const client = twilio(ac, token);

if (!to) {
  const verified = await client.outgoingCallerIds.list({ limit: 10 });
  if (verified.length === 0) {
    console.error("No destination. Usage: node scripts/twilio-send-test.mjs +1XXXXXXXXXX");
    console.error("Trial accounts: verify your phone at Twilio Console → Phone Numbers → Verified Caller IDs");
    process.exit(1);
  }
  to = verified[0].phoneNumber;
  console.log(`Using verified number: ${to}`);
}

const body =
  "JustBookMe (test): Bonjour! Votre coupe est confirmée demain à 14h. — (819) 581-1130";

try {
  const msg = await client.messages.create({ to, from, body });
  console.log(`✓ Sent — SID: ${msg.sid}`);
  console.log(`  From: ${from}`);
  console.log(`  To:   ${to}`);
} catch (e) {
  console.error(`✗ Failed: ${e.message}`);
  if (e.code === 21608) {
    console.error("  Trial account: verify destination at Twilio → Verified Caller IDs");
  }
  process.exit(1);
}