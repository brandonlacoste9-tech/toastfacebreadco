#!/usr/bin/env node
/**
 * Provision JustBookMe Vapi assistant + import Twilio number.
 * Usage: node scripts/vapi-provision.mjs [--update]
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../.env.local");

const env = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const VAPI_KEY = env.VAPI_PRIVATE_KEY;
const SITE_URL = (env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const TWILIO_SID = env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = env.TWILIO_PHONE_NUMBER;
const BUSINESS_ID = env.VAPI_DEFAULT_BUSINESS_ID || "37f81a19-4d70-42a3-85a6-3360261dacc0";
const UPDATE = process.argv.includes("--update");

if (!VAPI_KEY) {
  console.error("Missing VAPI_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const vapiHeaders = {
  Authorization: `Bearer ${VAPI_KEY}`,
  "Content-Type": "application/json",
};

async function vapi(path, options = {}) {
  const res = await fetch(`https://api.vapi.ai${path}`, { ...options, headers: vapiHeaders });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new Error(`Vapi ${path} ${res.status}: ${data?.message ?? text}`);
  }
  return data;
}

function displayBusinessName(name) {
  return name.replace(/\s*test\s*$/i, "").trim() || name;
}

function montrealTodayIso() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Montreal" });
}

function buildPrompt(business, services) {
  const displayName = displayBusinessName(business.name);
  const today = montrealTodayIso();
  const servicesJson =
    services.length > 0
      ? JSON.stringify(
          services.map((s) => ({
            id: s.id,
            name: s.name,
            duration_minutes: s.duration_minutes,
            price_cad: (s.price_cents / 100).toFixed(2),
          })),
          null,
          2
        )
      : `[
  { "name": "Coupe homme", "duration_minutes": 30, "price_cad": "35.00" },
  { "name": "Coupe femme", "duration_minutes": 45, "price_cad": "55.00" },
  { "name": "Barbe", "duration_minutes": 20, "price_cad": "25.00" }
]`;

  return `You are the AI receptionist for ${displayName}, a salon/barbershop in Montréal, Quebec.
Languages: Canadian French and English. Detect the caller's language and respond in that language only (not both at once).

Today is ${today} (America/Montreal). When the caller says "tomorrow", use the next calendar day from today.

Goals: book, reschedule, or cancel appointments; capture leads if booking fails; transfer to human if asked.
Rules:
- ALWAYS call check_availability before offering times — never guess slots.
- Confirm full name and phone before create_appointment.
- After booking, confirm date/time aloud and end politely.
- Never say "test", "demo", or mention technical errors — offer SMS callback instead.
Timezone: ${business.timezone || "America/Montreal"}.

Services:
${servicesJson}

Use the check_availability, create_appointment, and capture_lead tools. Transfer if caller is upset or asks for a person.`;
}

function buildAssistantPayload(business, services) {
  const serverUrl = `${SITE_URL}/api/vapi/webhook`;
  const systemPrompt = buildPrompt(business, services);

  const toolFns = [
    {
      name: "check_availability",
      description: "Check open slots for a date. Required before offering times.",
      parameters: {
        type: "object",
        properties: {
          service_id: { type: "string" },
          service_name: { type: "string" },
          preferred_date: { type: "string", description: "YYYY-MM-DD" },
          preferred_time: { type: "string", description: "HH:MM optional" },
        },
        required: ["preferred_date"],
      },
    },
    {
      name: "create_appointment",
      description: "Book appointment after caller confirms slot.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string" },
          customer_phone: { type: "string" },
          service_id: { type: "string" },
          service_name: { type: "string" },
          starts_at: { type: "string", description: "ISO8601" },
          locale: { type: "string", enum: ["fr", "en"] },
        },
        required: ["customer_name", "customer_phone", "starts_at"],
      },
    },
    {
      name: "capture_lead",
      description: "Save contact when booking cannot finish on the call.",
      parameters: {
        type: "object",
        properties: {
          phone: { type: "string" },
          name: { type: "string" },
          intent: { type: "string" },
          locale: { type: "string", enum: ["fr", "en"] },
        },
        required: ["phone", "intent"],
      },
    },
  ];

  const modelTools = toolFns.map((fn) => ({ type: "function", function: fn }));

  if (env.VAPI_TRANSFER_NUMBER) {
    modelTools.push({
      type: "transferCall",
      destinations: [
        {
          type: "number",
          number: env.VAPI_TRANSFER_NUMBER,
          message: "Je vous transfère — un instant. Transferring you now.",
        },
      ],
    });
  }

  const displayName = displayBusinessName(business.name);
  const lang = business.default_language === "en" ? "en" : "fr";
  const firstMessage =
    lang === "en"
      ? `Thanks for calling ${displayName}. I can help you book, reschedule, or cancel an appointment. What would you like to do today?`
      : `Bonjour, bienvenue chez ${displayName}. Je peux vous aider à prendre, modifier ou annuler un rendez-vous. Comment puis-je vous aider?`;
  const voiceId = lang === "en" ? "en-CA-ClaraNeural" : "fr-CA-SylvieNeural";
  return {
    name: `JustBookMe — ${displayName}`,
    firstMessage,
    firstMessageMode: "assistant-speaks-first",
    endCallMessage:
      lang === "en"
        ? "Thanks for calling. Have a wonderful day!"
        : "Merci d'avoir appelé. Bonne journée!",
    transcriber: { provider: "deepgram", model: "nova-2", language: "multi", smartFormat: true },
    voice: { provider: "azure", voiceId },
    model: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt }],
      tools: modelTools,
    },
    server: { url: serverUrl },
    serverMessages: ["tool-calls", "end-of-call-report", "status-update"],
    metadata: { product: "justbookme", business_id: business.id },
  };
}

async function ensureDefaultServices(sb, businessId) {
  const { data: existing } = await sb.from("services").select("id").eq("business_id", businessId).limit(1);
  if (existing?.length) return;

  const defaults = [
    { name: "Coupe homme", duration_minutes: 30, price_cents: 3500 },
    { name: "Coupe femme", duration_minutes: 45, price_cents: 5500 },
    { name: "Barbe", duration_minutes: 20, price_cents: 2500 },
  ];

  const { error } = await sb.from("services").insert(
    defaults.map((s) => ({ ...s, business_id: businessId, active: true }))
  );
  if (error) console.warn("Could not seed services:", error.message);
  else console.log("✓ Seeded default salon services");
}

function upsertEnv(key, value) {
  let content = readFileSync(envPath, "utf8");
  const re = new RegExp(`^\\s*${key}=.*$`, "m");
  const line = `${key}=${value}`;
  content = re.test(content) ? content.replace(re, line) : `${content.trimEnd()}\n${line}\n`;
  writeFileSync(envPath, content);
  env[key] = value;
}

async function main() {
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: business, error: bizErr } = await sb
    .from("businesses")
    .select("id, name, timezone, default_language, phone_number")
    .eq("id", BUSINESS_ID)
    .single();

  if (bizErr || !business) {
    console.error("Business not found:", BUSINESS_ID, bizErr?.message);
    process.exit(1);
  }

  await ensureDefaultServices(sb, business.id);

  if (TWILIO_PHONE && business.phone_number !== TWILIO_PHONE) {
    await sb.from("businesses").update({ phone_number: TWILIO_PHONE }).eq("id", business.id);
    console.log(`✓ Linked business phone_number → ${TWILIO_PHONE}`);
  }

  let services = [];
  const svcRes = await sb
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .eq("business_id", business.id);
  if (!svcRes.error) services = svcRes.data ?? [];
  else console.warn("Services table:", svcRes.error.message);

  const payload = buildAssistantPayload(business, services ?? []);
  let assistantId = env.VAPI_ASSISTANT_ID;

  if (assistantId && UPDATE) {
    console.log(`Updating assistant ${assistantId}…`);
    await vapi(`/assistant/${assistantId}`, { method: "PATCH", body: JSON.stringify(payload) });
    console.log("✓ Assistant updated");
  } else if (assistantId) {
    const existing = await vapi("/assistant");
    const found = Array.isArray(existing) && existing.find((a) => a.id === assistantId);
    if (found) {
      console.log(`✓ Using existing assistant ${assistantId} (${found.name})`);
    } else {
      assistantId = null;
    }
  }

  if (!assistantId) {
    console.log("Creating JustBookMe assistant…");
    const created = await vapi("/assistant", { method: "POST", body: JSON.stringify(payload) });
    assistantId = created.id;
    console.log(`✓ Created assistant ${assistantId}`);
    upsertEnv("VAPI_ASSISTANT_ID", assistantId);
  }

  upsertEnv("VAPI_DEFAULT_BUSINESS_ID", business.id);
  await sb.from("businesses").update({ vapi_assistant_id: assistantId }).eq("id", business.id);
  console.log(`✓ Saved vapi_assistant_id on business`);

  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) {
    console.log("\n○ Skipping Twilio import — need TWILIO_ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER");
    return;
  }

  const phones = await vapi("/phone-number");
  const existingPhone = Array.isArray(phones)
    ? phones.find((p) => p.number === TWILIO_PHONE || p.twilioPhoneNumber === TWILIO_PHONE)
    : null;

  if (existingPhone) {
    if (existingPhone.assistantId !== assistantId) {
      await vapi(`/phone-number/${existingPhone.id}`, {
        method: "PATCH",
        body: JSON.stringify({ assistantId }),
      });
      console.log(`✓ Linked phone ${TWILIO_PHONE} → assistant`);
    } else {
      console.log(`✓ Phone ${TWILIO_PHONE} already linked`);
    }
  } else {
    console.log(`Importing Twilio number ${TWILIO_PHONE}…`);
    const imported = await vapi("/phone-number", {
      method: "POST",
      body: JSON.stringify({
        provider: "twilio",
        number: TWILIO_PHONE,
        twilioAccountSid: TWILIO_SID,
        twilioAuthToken: TWILIO_TOKEN,
        assistantId,
        name: `JustBookMe ${business.name}`,
      }),
    });
    console.log(`✓ Imported phone ${imported.number ?? TWILIO_PHONE} (${imported.id})`);
  }

  console.log("\n── Ready ──");
  console.log(`Assistant: ${assistantId}`);
  console.log(`Webhook:   ${SITE_URL}/api/vapi/webhook`);
  console.log(`Business:  ${business.name} (${business.id})`);
  console.log(`Phone:     ${TWILIO_PHONE}`);
  console.log("\nCall the number to test. Deploy to Netlify so webhooks reach production.");
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});