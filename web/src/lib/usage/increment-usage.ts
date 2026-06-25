import { currentPeriodStart } from "@/lib/usage/period";
import { getSupabaseService } from "@/lib/supabase/server";

export type UsageDelta = {
  bookings?: number;
  /** Outbound SMS segments sent by the platform (confirmations, reminders, etc.). */
  sms?: number;
  voiceMinutes?: number;
};

/** Best-effort counter update — never throw; logs on failure. */
export async function incrementUsage(businessId: string, delta: UsageDelta): Promise<void> {
  const db = getSupabaseService();
  if (!db) return;

  const periodStart = currentPeriodStart();
  const bookings = delta.bookings ?? 0;
  const sms = delta.sms ?? 0;
  const voiceMinutes = delta.voiceMinutes ?? 0;
  if (bookings === 0 && sms === 0 && voiceMinutes === 0) return;

  try {
    const { data: existing } = await db
      .from("usage_counters")
      .select("bookings_count, sms_count, voice_minutes")
      .eq("business_id", businessId)
      .eq("period_start", periodStart)
      .maybeSingle();

    const { error } = await db.from("usage_counters").upsert(
      {
        business_id: businessId,
        period_start: periodStart,
        bookings_count: (existing?.bookings_count ?? 0) + bookings,
        sms_count: (existing?.sms_count ?? 0) + sms,
        voice_minutes: Number(existing?.voice_minutes ?? 0) + voiceMinutes,
      },
      { onConflict: "business_id,period_start" }
    );

    if (error) console.error("[usage] increment:", error.message);
  } catch (err) {
    console.error("[usage] increment:", err);
  }
}

export function recordOutboundSms(businessId: string): void {
  void incrementUsage(businessId, { sms: 1 });
}