#!/usr/bin/env node
/**
 * Simulate Vapi webhooks against local or production.
 * Usage: node scripts/test-vapi-webhook.mjs [baseUrl]
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dirname, "../.env.local"), "utf8").split("\n")) {
  const m = line.match(/^\s*([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const base = (process.argv[2] || env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const callId = `test-call-${Date.now()}`;
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dateStr = tomorrow.toISOString().slice(0, 10);

async function post(label, body) {
  const res = await fetch(`${base}/api/vapi/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`\n── ${label} (${res.status}) ──`);
  console.log(text.slice(0, 600));
  return res.ok;
}

const phone = env.TWILIO_PHONE_NUMBER || "+18195811130";

await post("status-update", {
  message: {
    type: "status-update",
    status: "in-progress",
    phoneNumber: { number: phone },
    call: {
      id: callId,
      startedAt: new Date().toISOString(),
      customer: { number: "+15145550199" },
    },
  },
});

await post("check_availability (simple format)", {
  message: {
    type: "tool-calls",
    phoneNumber: { number: phone },
    call: { id: callId, customer: { number: "+15145550199" } },
    toolCallList: [
      {
        id: "tool-check-1",
        name: "check_availability",
        parameters: { preferred_date: dateStr, service_name: "Coupe homme", locale: "fr" },
      },
    ],
  },
});

await post("check_availability (live Vapi format)", {
  message: {
    type: "tool-calls",
    call: { id: callId + "-live", customer: { number: "+15143481161" } },
    toolCallList: [
      {
        id: "call_live_check",
        type: "function",
        function: {
          name: "check_availability",
          arguments: JSON.stringify({
            service_name: "Coupe homme",
            preferred_date: "2023-11-02",
            preferred_time: "14:00",
          }),
        },
      },
    ],
  },
});

const bookRes = await fetch(`${base}/api/vapi/webhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: {
      type: "tool-calls",
      phoneNumber: { number: phone },
      call: { id: callId, customer: { number: "+15145550199" } },
      toolCallList: [
        {
          id: "tool-book-1",
          name: "create_appointment",
          parameters: {
            customer_name: "Test Webhook",
            customer_phone: "+15145550199",
            service_name: "Coupe homme",
            starts_at: `${dateStr}T18:00:00.000Z`,
            locale: "fr",
          },
        },
      ],
    },
  }),
});
const bookText = await bookRes.text();
console.log(`\n── create_appointment (${bookRes.status}) ──`);
console.log(bookText.slice(0, 600));

await post("end-of-call-report", {
  message: {
    type: "end-of-call-report",
    endedReason: "hangup",
    phoneNumber: { number: phone },
    call: {
      id: callId,
      startedAt: new Date(Date.now() - 120_000).toISOString(),
      endedAt: new Date().toISOString(),
      customer: { number: "+15145550199" },
    },
    artifact: {
      transcript:
        "Assistant: Bonjour, comment puis-je vous aider?\nUser: Je voudrais une coupe demain.\nAssistant: C'est confirmé!",
    },
    analysis: { summary: "Booked men's haircut for tomorrow." },
  },
});

console.log(`\n✓ Webhook simulation done (callId: ${callId})`);
console.log(`Check dashboard at ${base}/dashboard`);