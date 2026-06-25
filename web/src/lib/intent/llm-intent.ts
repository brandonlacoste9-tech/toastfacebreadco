import { ollamaChat } from "@/lib/llm/ollama";
import type {
  BookingIntentAction,
  IntentStatus,
  SalonBookingIntent,
} from "@/lib/intent/salon-intent-bridge";
import type { ServiceOption } from "@/lib/intent/match-service";

const VALID_ACTIONS: BookingIntentAction[] = [
  "booking.create",
  "booking.reschedule",
  "booking.cancel",
  "transfer.human",
  "none",
];

function buildSystemPrompt(services?: ServiceOption[]): string {
  const serviceList =
    services && services.length > 0
      ? services.map((s) => `- ${s.name}`).join("\n")
      : "(none configured — use service_label as free text)";

  return `You extract booking intent from customer messages for a Quebec service business (French or English).
Businesses may be salons, plumbers, HVAC, dental offices, or other trades.

Configured services:
${serviceList}

Respond with JSON only, no markdown:
{
  "action": "booking.create" | "booking.reschedule" | "booking.cancel" | "transfer.human" | "none",
  "service_label": string | null,
  "start_description": string | null,
  "locale": "fr" | "en",
  "summary": string
}
Rules:
- "I want a haircut" / "book for my hair" → service_label from hair/coupe service if listed
- "plumber to fix my sink" / "drain clogged" → closest plumbing repair service if listed
- "HVAC not working" / "furnace" → closest HVAC service if listed
- "dental appointment" / "see the dentist" → closest dental service if listed
- If no service matches, service_label = short description of what they need
- If not a booking request, action "none"
- start_description: human-readable time like "demain à 14h" or "Friday at 2pm"
- summary: one sentence for the business owner`;
}

type LlmIntentJson = {
  action?: string;
  service?: string | null;
  service_label?: string | null;
  start_description?: string | null;
  locale?: string;
  summary?: string;
};

function parseJsonResponse(raw: string): LlmIntentJson | null {
  try {
    return JSON.parse(raw) as LlmIntentJson;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as LlmIntentJson;
    } catch {
      return null;
    }
  }
}

function toBookingIntent(parsed: LlmIntentJson, message: string): SalonBookingIntent | null {
  const action = VALID_ACTIONS.includes(parsed.action as BookingIntentAction)
    ? (parsed.action as BookingIntentAction)
    : "none";

  if (action === "none") return null;

  const locale = parsed.locale === "en" ? "en" : "fr";
  const serviceLabel = parsed.service_label?.trim() || null;

  let status: IntentStatus = "needs_input";
  let confidence: "high" | "medium" | "low" = "medium";

  if (action === "transfer.human") {
    status = "executed";
    confidence = "high";
  } else if (action === "booking.create") {
    const hasService = Boolean(serviceLabel);
    const hasTime = Boolean(parsed.start_description?.trim());
    if (hasService && hasTime) {
      status = "executed";
      confidence = "high";
    } else if (hasService || hasTime) {
      status = "needs_input";
      confidence = "medium";
    } else {
      status = "needs_input";
      confidence = "low";
    }
  } else {
    status = "needs_input";
    confidence = "medium";
  }

  return {
    action,
    status,
    service: serviceLabel ? "autre" : null,
    serviceLabel,
    startDescription: parsed.start_description?.trim() || null,
    startIso: null,
    locale,
    confidence,
    summary:
      parsed.summary?.trim() ||
      (locale === "fr" ? "Intention détectée par IA." : "Intent detected by AI."),
    raw: message.trim(),
  };
}

export async function parseBookingIntentWithLlm(
  message: string,
  services?: ServiceOption[]
): Promise<SalonBookingIntent | null> {
  const raw = message.trim();
  if (!raw) return null;

  const content = await ollamaChat(
    [
      { role: "system", content: buildSystemPrompt(services) },
      {
        role: "user",
        content: `Today is ${new Date().toISOString().slice(0, 10)}. Message: "${raw}"`,
      },
    ],
    { format: "json" }
  );

  if (!content) return null;

  const parsed = parseJsonResponse(content);
  if (!parsed) return null;

  return toBookingIntent(parsed, raw);
}

/** @deprecated Use parseBookingIntentWithLlm */
export async function parseSalonIntentWithLlm(
  message: string
): Promise<SalonBookingIntent | null> {
  return parseBookingIntentWithLlm(message);
}