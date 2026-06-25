#!/usr/bin/env node
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
const sk = process.env.TWILIO_API_KEY_SID;
const secret = process.env.TWILIO_API_KEY_SECRET;

async function tryList(label, client) {
  try {
    const nums = await client.incomingPhoneNumbers.list({ limit: 3 });
    console.log(`${label}: OK (${nums.length} numbers)`);
    return true;
  } catch (e) {
    console.log(`${label}: FAIL — ${e.code ?? e.message}`);
    return false;
  }
}

if (token) await tryList("auth_token", twilio(ac, token));
if (sk && secret) await tryList("api_key", twilio(sk, secret, { accountSid: ac }));