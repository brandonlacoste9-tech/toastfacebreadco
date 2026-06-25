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

const sid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY_SID;
const apiSecret = process.env.TWILIO_API_KEY_SECRET;
const token = process.env.TWILIO_AUTH_TOKEN;
if (!sid || (!token && !(apiKey && apiSecret))) {
  console.error("Missing Twilio credentials in .env.local");
  process.exit(1);
}

const client = token
  ? twilio(sid, token)
  : apiKey && apiSecret
    ? twilio(apiKey, apiSecret, { accountSid: sid })
    : null;
if (!client) process.exit(1);
const nums = await client.incomingPhoneNumbers.list({ limit: 10 });
if (nums.length === 0) {
  console.log("NO_NUMBERS — buy a +1 514/438 number in Twilio Console");
  process.exit(0);
}
for (const n of nums) {
  console.log(n.phoneNumber, n.friendlyName || "");
}