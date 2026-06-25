import { getSupabaseService } from "@/lib/supabase/server";

export type ConversationOutcome =
  | "booked"
  | "lead_captured"
  | "transferred"
  | "dropped"
  | "other";

type UpsertCallInput = {
  businessId: string;
  externalCallId: string;
  fromNumber?: string | null;
  startedAt?: string | null;
};

type FinalizeCallInput = {
  businessId: string;
  externalCallId: string;
  fromNumber?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  durationSeconds?: number | null;
  transcript?: string | null;
  summary?: string | null;
  endedReason?: string | null;
  outcome?: ConversationOutcome;
  appointmentId?: string | null;
  recoveredRevenueCents?: number | null;
};

function inferOutcome(opts: {
  endedReason?: string | null;
  transcript?: string | null;
  appointmentId?: string | null;
}): ConversationOutcome {
  if (opts.appointmentId) return "booked";
  const reason = (opts.endedReason ?? "").toLowerCase();
  if (reason.includes("transfer")) return "transferred";
  const t = (opts.transcript ?? "").toLowerCase();
  if (/\b(transfer|transfert|humain|human)\b/.test(t)) return "transferred";
  if (/\b(lead|capture|rappeler|callback|texto|sms)\b/.test(t)) return "lead_captured";
  if (reason.includes("no-answer") || reason.includes("busy") || reason.includes("dropped")) {
    return "dropped";
  }
  return "other";
}

export async function upsertCallStarted(input: UpsertCallInput) {
  const supabase = getSupabaseService();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", input.businessId)
    .eq("external_call_id", input.externalCallId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      business_id: input.businessId,
      channel: "voice",
      external_call_id: input.externalCallId,
      from_number: input.fromNumber ?? null,
      started_at: input.startedAt ?? new Date().toISOString(),
      outcome: "other",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[vapi] upsertCallStarted:", error.message);
    return null;
  }
  return data.id;
}

export async function finalizeCall(input: FinalizeCallInput) {
  const supabase = getSupabaseService();
  if (!supabase) return null;

  const outcome =
    input.outcome ??
    inferOutcome({
      endedReason: input.endedReason,
      transcript: input.transcript,
      appointmentId: input.appointmentId,
    });

  const row = {
    business_id: input.businessId,
    channel: "voice" as const,
    external_call_id: input.externalCallId,
    from_number: input.fromNumber ?? null,
    started_at: input.startedAt ?? new Date().toISOString(),
    ended_at: input.endedAt ?? new Date().toISOString(),
    duration_seconds: input.durationSeconds ?? null,
    transcript: input.transcript ?? null,
    summary: input.summary ?? null,
    outcome,
    appointment_id: input.appointmentId ?? null,
    recovered_revenue_cents: input.recoveredRevenueCents ?? null,
  };

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("business_id", input.businessId)
    .eq("external_call_id", input.externalCallId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from("conversations").update(row).eq("id", existing.id);
    if (error) console.error("[vapi] finalizeCall update:", error.message);
    return { id: existing.id, outcome };
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[vapi] finalizeCall insert:", error.message);
    return null;
  }
  return { id: data.id, outcome };
}

export async function linkAppointmentToCall(opts: {
  businessId: string;
  externalCallId: string;
  appointmentId: string;
  recoveredRevenueCents?: number | null;
}) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  const { error } = await supabase
    .from("conversations")
    .update({
      appointment_id: opts.appointmentId,
      outcome: "booked",
      recovered_revenue_cents: opts.recoveredRevenueCents ?? null,
    })
    .eq("business_id", opts.businessId)
    .eq("external_call_id", opts.externalCallId);

  if (error) console.error("[vapi] linkAppointmentToCall:", error.message);
}