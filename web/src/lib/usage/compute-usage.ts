import { currentPeriodStart, periodEndIso } from "@/lib/usage/period";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ComputedUsage = {
  periodStart: string;
  bookings: number;
  inboundSms: number;
  voiceMinutes: number;
};

export async function computeUsageFromSource(
  supabase: SupabaseClient,
  businessId: string,
  periodStart = currentPeriodStart()
): Promise<ComputedUsage> {
  const periodEnd = periodEndIso(periodStart);

  const [{ count: bookingCount }, { count: smsCount }, { data: voiceRows }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd)
      .neq("status", "cancelled"),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("channel", "sms")
      .gte("started_at", periodStart)
      .lt("started_at", periodEnd),
    supabase
      .from("conversations")
      .select("duration_seconds")
      .eq("business_id", businessId)
      .eq("channel", "voice")
      .gte("started_at", periodStart)
      .lt("started_at", periodEnd),
  ]);

  const voiceMinutes =
    (voiceRows ?? []).reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0) / 60;

  return {
    periodStart,
    bookings: bookingCount ?? 0,
    inboundSms: smsCount ?? 0,
    voiceMinutes: Math.round(voiceMinutes * 10) / 10,
  };
}