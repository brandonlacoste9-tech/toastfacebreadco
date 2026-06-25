/**
 * Booking intent extraction (regex-first, Ollama LLM fallback).
 * Salons, trades (plumbing/HVAC), dental offices, and other service businesses.
 */

import {
  describeCallerNeed,
  matchBusinessService,
  type ServiceOption,
} from "@/lib/intent/match-service";
import { isOllamaConfigured } from "@/lib/llm/ollama";
import { parseBookingIntentWithLlm } from "@/lib/intent/llm-intent";

export type SalonService =
  | "coupe"
  | "coloration"
  | "balayage"
  | "manucure"
  | "pedicure"
  | "soins_visage"
  | "barbe"
  | "autre";

export type BookingIntentAction =
  | "booking.create"
  | "booking.reschedule"
  | "booking.cancel"
  | "transfer.human"
  | "none";

export type IntentStatus = "executed" | "needs_input" | "needs_connection" | "failed";

export type SalonBookingIntent = {
  action: BookingIntentAction;
  status: IntentStatus;
  service: SalonService | null;
  serviceLabel: string | null;
  startDescription: string | null;
  startIso: string | null;
  locale: "fr" | "en";
  confidence: "high" | "medium" | "low";
  summary: string;
  raw: string;
};

const SERVICE_PATTERNS: { service: SalonService; label: string; patterns: RegExp[] }[] = [
  {
    service: "coupe",
    label: "coupe",
    patterns: [/\bcoupe\b/i, /\bcouper\b/i, /\bhaircut\b/i, /\btrim\b/i, /\bcut\b/i],
  },
  {
    service: "coloration",
    label: "coloration",
    patterns: [/\bcoloration\b/i, /\bteinture\b/i, /\bcolor\b/i, /\bdye\b/i, /\bmèches\b/i],
  },
  {
    service: "balayage",
    label: "balayage",
    patterns: [/\bbalayage\b/i, /\bhighlights?\b/i],
  },
  {
    service: "manucure",
    label: "manucure",
    patterns: [/\bmanucure\b/i, /\bmanicure\b/i, /\bongles\b/i, /\bnails?\b/i],
  },
  {
    service: "pedicure",
    label: "pédicure",
    patterns: [/\bpédicure\b/i, /\bpedi(cure)?\b/i],
  },
  {
    service: "soins_visage",
    label: "soin du visage",
    patterns: [/\bsoin\b/i, /\bsoins?\s+(du\s+)?visage\b/i, /\bfacial\b/i],
  },
  {
    service: "barbe",
    label: "barbe",
    patterns: [
      /\bbarbe\b/i,
      /\bbeard\b/i,
      /\brasage\b/i,
      /\bshave\b/i,
      /\btrim\s+beard\b/i,
    ],
  },
  {
    service: "coupe",
    label: "fade / coupe homme",
    patterns: [
      /\bfade\b/i,
      /\bskin\s*fade\b/i,
      /\bline[- ]?up\b/i,
      /\blineup\b/i,
      /\btaper\b/i,
      /\bbuzz\s*cut\b/i,
      /\bcoupe\s+homme\b/i,
      /\bmen'?s?\s+cut\b/i,
      /\bbarber\s*cut\b/i,
    ],
  },
];

const BOOKING_VERBS =
  /(?:réserver|reserver|book|prendre|prendre\s+rendez[- ]?vous|rendez[- ]?vous|appointment|schedule|besoin\s+d['']?une?|besoin\s+d['']?un|need\s+a|want\s+(?:an?\s+)?appointment|je\s+veux|i\s+want|i\s+need)/i;

const SERVICE_NEED =
  /(?:hair|cheveux|coupe|haircut|plumb|plombier|sink|évier|evier|drain|leak|fuite|hvac|climat|chauffage|heating|furnace|dental|dentiste|dentist|fix|réparer|reparer|repair|urgent|emergency)/i;

const RESCHEDULE_VERBS =
  /(?:reporter|déplacer|deplacer|changer|reschedule|move\s+my|change\s+my)/i;

const CANCEL_VERBS = /(?:annuler|cancel|annulation)/i;

const HUMAN_VERBS =
  /(?:parler\s+à|parler\s+a|humain|human|personne|réceptionniste|receptionist|staff)/i;

const FR_DAYS: Record<string, number> = {
  lundi: 1,
  monday: 1,
  mardi: 2,
  tuesday: 2,
  mercredi: 3,
  wednesday: 3,
  jeudi: 4,
  thursday: 4,
  vendredi: 5,
  friday: 5,
  samedi: 6,
  saturday: 6,
  dimanche: 0,
  sunday: 0,
};

function detectLocale(text: string): "fr" | "en" {
  const fr =
    /(?:bonjour|salut|je\s+voudrais|j'aimerais|demain|aujourd'hui|rendez-vous|coupe|manucure|pédicure|merci)/i.test(
      text
    );
  return fr ? "fr" : "en";
}

function extractService(text: string): { service: SalonService; label: string } | null {
  for (const entry of SERVICE_PATTERNS) {
    if (entry.patterns.some((p) => p.test(text))) {
      return { service: entry.service, label: entry.label };
    }
  }
  if (BOOKING_VERBS.test(text)) {
    return { service: "autre", label: "service" };
  }
  return null;
}

function nextWeekday(from: Date, targetDay: number): Date {
  const d = new Date(from);
  const current = d.getDay();
  let delta = (targetDay - current + 7) % 7;
  if (delta === 0) delta = 7;
  d.setDate(d.getDate() + delta);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDateTime(text: string, now = new Date()): { description: string; iso: string } | null {
  const lower = text.toLowerCase();

  if (/\bdemain\b|\btomorrow\b/.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    const time = parseTime(lower, d);
    return {
      description: time ? `demain à ${time.label}` : "demain",
      iso: time ? time.iso : d.toISOString(),
    };
  }

  if (/\baujourd'hui\b|\btoday\b/.test(lower)) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const time = parseTime(lower, d);
    return {
      description: time ? `aujourd'hui à ${time.label}` : "aujourd'hui",
      iso: time ? time.iso : d.toISOString(),
    };
  }

  for (const [day, num] of Object.entries(FR_DAYS)) {
    if (new RegExp(`\\b${day}\\b`, "i").test(lower)) {
      const d = nextWeekday(now, num);
      const time = parseTime(lower, d);
      return {
        description: time ? `${day} à ${time.label}` : day,
        iso: time ? time.iso : d.toISOString(),
      };
    }
  }

  const timeOnly = parseTime(lower, now);
  if (timeOnly) {
    return { description: timeOnly.label, iso: timeOnly.iso };
  }

  return null;
}

function parseTime(
  text: string,
  base: Date
): { label: string; iso: string } | null {
  const fr = text.match(/\bà\s*(\d{1,2})\s*h(?:\s*(\d{2}))?\b/i);
  if (fr) {
    const h = Number(fr[1]);
    const m = fr[2] ? Number(fr[2]) : 0;
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return { label: `${h}h${m ? String(m).padStart(2, "0") : ""}`, iso: d.toISOString() };
  }

  const en = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (en) {
    let h = Number(en[1]);
    const m = en[2] ? Number(en[2]) : 0;
    const pm = en[3].toLowerCase() === "pm";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return { label: `${en[1]}${en[2] ? ":" + en[2] : ""} ${en[3]}`, iso: d.toISOString() };
  }

  const h24 = text.match(/\b(\d{1,2}):(\d{2})\b/);
  if (h24) {
    const d = new Date(base);
    d.setHours(Number(h24[1]), Number(h24[2]), 0, 0);
    return { label: `${h24[1]}:${h24[2]}`, iso: d.toISOString() };
  }

  return null;
}

function detectAction(text: string): BookingIntentAction {
  if (HUMAN_VERBS.test(text)) return "transfer.human";
  if (CANCEL_VERBS.test(text)) return "booking.cancel";
  if (RESCHEDULE_VERBS.test(text)) return "booking.reschedule";
  if (BOOKING_VERBS.test(text) || SERVICE_NEED.test(text) || extractService(text)) {
    return "booking.create";
  }
  return "none";
}

function resolveServiceInfo(
  raw: string,
  locale: "fr" | "en",
  services?: ServiceOption[]
): { service: SalonService | null; label: string | null } {
  const salonMatch = extractService(raw);
  if (salonMatch) {
    return { service: salonMatch.service, label: salonMatch.label };
  }

  if (services?.length) {
    const matched = matchBusinessService(raw, services);
    if (matched) return { service: "autre", label: matched.name };
  }

  const described = describeCallerNeed(raw, locale);
  if (described) return { service: "autre", label: described };

  return { service: null, label: null };
}

export function parseSalonBookingIntent(
  message: string,
  now = new Date(),
  services?: ServiceOption[]
): SalonBookingIntent | null {
  const raw = message.trim().replace(/\s+/g, " ");
  if (!raw) return null;

  const locale = detectLocale(raw);
  const action = detectAction(raw);
  if (action === "none") return null;

  const serviceInfo = resolveServiceInfo(raw, locale, services);
  const when = parseDateTime(raw, now);

  if (action === "transfer.human") {
    return {
      action,
      status: "executed",
      service: null,
      serviceLabel: null,
      startDescription: null,
      startIso: null,
      locale,
      confidence: "high",
      summary:
        locale === "fr"
          ? "Le client souhaite parler à un humain."
          : "Caller wants to speak with a person.",
      raw,
    };
  }

  if (action === "booking.cancel") {
    return {
      action,
      status: "needs_input",
      service: serviceInfo.service,
      serviceLabel: serviceInfo.label,
      startDescription: when?.description ?? null,
      startIso: when?.iso ?? null,
      locale,
      confidence: when ? "medium" : "low",
      summary:
        locale === "fr"
          ? "Annulation demandée — confirmer le rendez-vous existant."
          : "Cancellation requested — confirm which appointment.",
      raw,
    };
  }

  if (action === "booking.reschedule") {
    return {
      action,
      status: when ? "needs_input" : "needs_input",
      service: serviceInfo.service,
      serviceLabel: serviceInfo.label,
      startDescription: when?.description ?? null,
      startIso: when?.iso ?? null,
      locale,
      confidence: when && serviceInfo.label ? "high" : "medium",
      summary:
        locale === "fr"
          ? "Report demandé — confirmer l'ancien et le nouveau créneau."
          : "Reschedule requested — confirm old and new slot.",
      raw,
    };
  }

  // booking.create
  const hasService = Boolean(serviceInfo.label);
  const hasTime = Boolean(when);

  let status: IntentStatus = "needs_input";
  let confidence: "high" | "medium" | "low" = "low";

  if (hasService && hasTime) {
    status = "executed";
    confidence = "high";
  } else if (hasService || hasTime) {
    status = "needs_input";
    confidence = "medium";
  }

  const summary =
    locale === "fr"
      ? hasService && hasTime
        ? `Réservation ${serviceInfo.label} — ${when!.description}.`
        : hasService
          ? `Service identifié (${serviceInfo.label}) — quelle date/heure?`
          : hasTime
            ? `Créneau ${when!.description} — quel service?`
            : "Réservation demandée — préciser service et horaire."
      : hasService && hasTime
        ? `Book ${serviceInfo.label} — ${when!.description}.`
        : hasService
          ? `Service: ${serviceInfo.label} — what date/time?`
          : hasTime
            ? `Slot: ${when!.description} — which service?`
            : "Booking requested — need service and time.";

  return {
    action,
    status,
    service: serviceInfo.service,
    serviceLabel: serviceInfo.label,
    startDescription: when?.description ?? null,
    startIso: when?.iso ?? null,
    locale,
    confidence,
    summary,
    raw,
  };
}

export type IntentParseSource = "regex" | "llm" | null;

export type IntentParseResult = {
  intent: SalonBookingIntent | null;
  source: IntentParseSource;
};

function shouldTryLlm(intent: SalonBookingIntent | null): boolean {
  if (!intent) return true;
  if (intent.confidence === "low") return true;
  if (intent.action === "none") return true;
  if (intent.status === "needs_input" && intent.confidence !== "high") return true;
  return false;
}

/** Regex first; falls back to Ollama/Gemma4 when confidence is low or no match. */
export type IntentParseOptions = {
  forceLlm?: boolean;
  skipLlm?: boolean;
  services?: ServiceOption[];
};

export async function parseSalonBookingIntentWithFallback(
  message: string,
  now = new Date(),
  options?: IntentParseOptions
): Promise<IntentParseResult> {
  const regexIntent = parseSalonBookingIntent(message, now, options?.services);

  if (!options?.forceLlm && regexIntent?.confidence === "high") {
    return { intent: regexIntent, source: "regex" };
  }

  if (
    !options?.forceLlm &&
    regexIntent?.confidence === "medium" &&
    regexIntent.status === "executed"
  ) {
    return { intent: regexIntent, source: "regex" };
  }

  const tryLlm =
    !options?.skipLlm &&
    isOllamaConfigured() &&
    (options?.forceLlm || shouldTryLlm(regexIntent));

  if (tryLlm) {
    const llmIntent = await parseBookingIntentWithLlm(message, options?.services);
    if (llmIntent) return { intent: llmIntent, source: "llm" };
  }

  return { intent: regexIntent, source: regexIntent ? "regex" : null };
}