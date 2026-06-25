import { BRAND_NAME } from "@/lib/site-config";
import { sendOutboundSms } from "@/lib/twilio/send-outbound-sms";
import { bookingConfirmationSms } from "@/lib/twilio/templates";
import { getSupabaseService } from "@/lib/supabase/server";
import { incrementUsage } from "@/lib/usage/increment-usage";
import {
  generateSlotTimes,
  hasSchedulingConflict,
  type HoursRow,
} from "@/lib/vapi/hours";
import { MONTREAL_TZ, montrealDayBoundsIso, montrealLocalToIso } from "@/lib/vapi/timezone";

const TZ = MONTREAL_TZ;

export type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function parseDateParts(preferredDate: string): { y: number; m: number; d: number } | null {
  const m = preferredDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/** Correct LLM hallucinated years (e.g. 2023) to current/future Montreal dates. */
function normalizePreferredDate(preferredDate: string, now = new Date()): string {
  const parts = parseDateParts(preferredDate);
  if (!parts) return preferredDate;

  const pad = (n: number) => String(n).padStart(2, "0");
  let candidate = `${parts.y}-${pad(parts.m)}-${pad(parts.d)}`;
  const candidateMs = new Date(`${candidate}T12:00:00`).getTime();
  const todayMs = new Date(now.toLocaleDateString("en-CA", { timeZone: TZ })).getTime();

  if (candidateMs >= todayMs - 86_400_000) return candidate;

  const currentYear = Number(
    now.toLocaleDateString("en-CA", { timeZone: TZ, year: "numeric" })
  );
  candidate = `${currentYear}-${pad(parts.m)}-${pad(parts.d)}`;
  const fixedMs = new Date(`${candidate}T12:00:00`).getTime();
  if (fixedMs >= todayMs - 86_400_000) return candidate;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-CA", { timeZone: TZ });
}

function slotLabel(iso: string, locale: "fr" | "en"): string {
  return new Date(iso).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export async function loadBusinessContext(businessId: string) {
  const supabase = getSupabaseService();
  if (!supabase) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, timezone, default_language, phone_number, working_hours")
    .eq("id", businessId)
    .single();

  if (!business) return null;

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");

  return {
    business: {
      ...business,
      working_hours: (business.working_hours as HoursRow | null) ?? null,
    },
    services: (services ?? []) as ServiceRow[],
  };
}

export async function resolveBusinessId(opts: {
  phoneNumber?: string | null;
  assistantId?: string | null;
  defaultBusinessId?: string | null;
}): Promise<string | null> {
  const supabase = getSupabaseService();
  if (!supabase) return opts.defaultBusinessId ?? null;

  if (opts.assistantId) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("vapi_assistant_id", opts.assistantId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  if (opts.phoneNumber) {
    const normalized = normalizePhone(opts.phoneNumber);
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("phone_number", normalized)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  return opts.defaultBusinessId ?? null;
}

async function resolveService(
  businessId: string,
  serviceId?: string,
  serviceName?: string
): Promise<ServiceRow | null> {
  const ctx = await loadBusinessContext(businessId);
  if (!ctx) return null;

  if (serviceId) {
    const found = ctx.services.find((s) => s.id === serviceId);
    if (found) return found;
  }

  if (serviceName) {
    const lower = serviceName.toLowerCase();
    const found = ctx.services.find((s) => s.name.toLowerCase().includes(lower));
    if (found) return found;
  }

  if (ctx.services.length === 1) return ctx.services[0];
  return ctx.services[0] ?? null;
}

export async function checkAvailability(args: {
  businessId: string;
  service_id?: string;
  service_name?: string;
  preferred_date: string;
  preferred_time?: string;
  locale?: "fr" | "en";
}) {
  const locale = args.locale ?? "fr";
  const preferredDate = normalizePreferredDate(args.preferred_date);
  const parts = parseDateParts(preferredDate);
  if (!parts) {
    return { ok: false as const, error: "Invalid preferred_date — use YYYY-MM-DD" };
  }

  const ctx = await loadBusinessContext(args.businessId);
  const workingHours = ctx?.business.working_hours ?? null;
  const service = await resolveService(args.businessId, args.service_id, args.service_name);
  const duration = service?.duration_minutes ?? 30;

  const supabase = getSupabaseService();
  const bounds = montrealDayBoundsIso(preferredDate);
  const dayStart = bounds?.start ?? montrealLocalToIso(parts.y, parts.m, parts.d, 0, 0);
  const dayEnd = bounds?.end ?? montrealLocalToIso(parts.y, parts.m, parts.d, 23, 59);

  let booked: { starts_at: string; ends_at: string }[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("business_id", args.businessId)
      .gte("starts_at", dayStart)
      .lt("starts_at", dayEnd)
      .neq("status", "cancelled");
    booked = (data ?? []) as typeof booked;
  }

  const slotTimes = generateSlotTimes(workingHours, preferredDate, duration);
  const slots: { starts_at: string; label: string; service_id: string | null; service_name: string }[] = [];

  for (const { hour, minute } of slotTimes) {
    const iso = montrealLocalToIso(parts.y, parts.m, parts.d, hour, minute);
    const startMs = new Date(iso).getTime();
    const endMs = startMs + duration * 60_000;

    if (!hasSchedulingConflict(booked, startMs, endMs)) {
      slots.push({
        starts_at: iso,
        label: slotLabel(iso, locale),
        service_id: service?.id ?? null,
        service_name: service?.name ?? "Service",
      });
    }
  }

  let filtered = slots;
  if (args.preferred_time) {
    const [ph, pm] = args.preferred_time.split(":").map(Number);
    filtered = slots.filter((s) => {
      const d = new Date(s.starts_at);
      const local = d.toLocaleString("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
      const [h, m] = local.split(":").map(Number);
      return h === ph && (pm === undefined || m === pm);
    });
    if (filtered.length === 0) filtered = slots.slice(0, 4);
  } else {
    filtered = slots.slice(0, 6);
  }

  return {
    ok: true as const,
    service: service?.name ?? null,
    slots: filtered,
    message:
      filtered.length > 0
        ? locale === "fr"
          ? `${filtered.length} créneaux disponibles.`
          : `${filtered.length} slots available.`
        : locale === "fr"
          ? slotTimes.length === 0
            ? "Fermé ce jour-là — proposer une autre date."
            : "Complet ce jour-là — proposer une autre date."
          : slotTimes.length === 0
            ? "Closed that day — offer another date."
            : "Fully booked that day — offer another date.",
  };
}

export async function createAppointment(args: {
  businessId: string;
  customer_name: string;
  customer_phone: string;
  service_id?: string;
  service_name?: string;
  starts_at: string;
  locale?: "fr" | "en";
}) {
  const locale = args.locale ?? "fr";
  const phone = normalizePhone(args.customer_phone);
  const service = await resolveService(args.businessId, args.service_id, args.service_name);
  const duration = service?.duration_minutes ?? 30;

  const start = new Date(args.starts_at);
  if (Number.isNaN(start.getTime())) {
    return { ok: false as const, error: "Invalid starts_at" };
  }
  const end = new Date(start.getTime() + duration * 60_000);

  const supabase = getSupabaseService();
  if (!supabase) {
    return { ok: false as const, error: "Database not configured" };
  }

  const preferredDate = start.toLocaleDateString("en-CA", { timeZone: TZ });
  const ctx = await loadBusinessContext(args.businessId);
  const slotTimes = generateSlotTimes(ctx?.business.working_hours ?? null, preferredDate, duration);
  if (slotTimes.length === 0) {
    return {
      ok: false as const,
      error:
        locale === "fr"
          ? "Fermé à cette date — choisir un autre jour."
          : "Closed on that date — pick another day.",
    };
  }

  const localTime = start.toLocaleTimeString("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = localTime.split(":").map(Number);
  const allowed = slotTimes.some((s) => s.hour === h && s.minute === m);
  if (!allowed) {
    return {
      ok: false as const,
      error:
        locale === "fr"
          ? "Ce créneau n'est pas disponible — vérifier les heures d'ouverture."
          : "That time is outside business hours — check availability first.",
    };
  }

  const dayBounds = montrealDayBoundsIso(preferredDate);
  if (dayBounds) {
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("business_id", args.businessId)
      .gte("starts_at", dayBounds.start)
      .lt("starts_at", dayBounds.end)
      .neq("status", "cancelled");

    if (
      hasSchedulingConflict(
        (conflicts ?? []) as { starts_at: string; ends_at: string }[],
        start.getTime(),
        end.getTime()
      )
    ) {
      return {
        ok: false as const,
        error:
          locale === "fr"
            ? "Ce créneau vient d'être pris — proposer un autre horaire."
            : "That slot was just taken — offer another time.",
      };
    }
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name, default_language")
    .eq("id", args.businessId)
    .single();

  let customerId: string | null = null;
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", args.businessId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing?.id) {
    customerId = existing.id;
    await supabase
      .from("customers")
      .update({ full_name: args.customer_name, preferred_language: locale })
      .eq("id", customerId);
  } else {
    const { data: created, error: custErr } = await supabase
      .from("customers")
      .insert({
        business_id: args.businessId,
        full_name: args.customer_name,
        phone,
        preferred_language: locale,
      })
      .select("id")
      .single();
    if (custErr) return { ok: false as const, error: custErr.message };
    customerId = created.id;
  }

  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .insert({
      business_id: args.businessId,
      customer_id: customerId,
      service_id: service?.id ?? null,
      customer_name: args.customer_name,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "confirmed",
      source: "phone_ai",
      notes: "Booked via Vapi voice assistant",
    })
    .select("id")
    .single();

  if (apptErr) return { ok: false as const, error: apptErr.message };

  await supabase.from("leads").insert({
    business_id: args.businessId,
    customer_id: customerId,
    contact_name: args.customer_name,
    contact_phone: phone,
    source: "phone_ai",
    pipeline_stage: "booked",
    notes: `Voice booking ${start.toISOString()}`,
  });

  const smsLocale = locale;
  const smsBody = bookingConfirmationSms({
    businessName: business?.name ?? BRAND_NAME,
    customerName: args.customer_name,
    startsAt: start,
    serviceName: service?.name ?? null,
    locale: smsLocale,
  });
  const sms = await sendOutboundSms(args.businessId, phone, smsBody);

  await incrementUsage(args.businessId, { bookings: 1 });

  return {
    ok: true as const,
    appointment_id: appt.id,
    confirmation_sent: sms.ok,
    starts_at: start.toISOString(),
    label: slotLabel(start.toISOString(), locale),
    price_cents: service?.price_cents ?? 0,
  };
}

export async function captureLead(args: {
  businessId: string;
  phone: string;
  name?: string;
  intent: string;
  locale?: "fr" | "en";
  urgency?: "high" | "medium" | "low";
  service_needed?: string;
  diagnostic_data?: string;
}) {
  const phone = normalizePhone(args.phone);
  const supabase = getSupabaseService();
  if (!supabase) return { ok: false as const, error: "Database not configured" };

  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_id: args.businessId,
      contact_name: args.name?.trim() || "Appelant",
      contact_phone: phone,
      source: "phone_ai",
      pipeline_stage: "new",
      notes: args.intent,
      metadata: {
        urgency: args.urgency,
        service_needed: args.service_needed,
        diagnostic_data: args.diagnostic_data,
      },
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, lead_id: data.id };
}