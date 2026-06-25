/**
 * Point Twilio number inbound SMS webhook to JustBookMe.
 * Usage: node scripts/twilio-set-sms-webhook.mjs [baseUrl]
 */
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

const base = (process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL || "https://justbookme.ca").replace(
  /\/$/,
  ""
);
const webhook = `${base}/api/sms/inbound`;

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const phoneSid = process.env.TWILIO_PHONE_NUMBER_SID;

if (!sid || !token || !phoneSid) {
  console.error("Need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER_SID");
  process.exit(1);
}

const body = new URLSearchParams({
  SmsUrl: webhook,
  SmsMethod: "POST",
});

const res = await fetch(
  `https://api.twilio.com/2010-04-01/Accounts/${sid}/IncomingPhoneNumbers/${phoneSid}.json`,
  {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  }
);

const data = await res.json();
if (!res.ok) {
  console.error("Twilio error:", data);
  process.exit(1);
}

console.log("SMS webhook updated:", webhook);
console.log("Number:", data.phone_number);