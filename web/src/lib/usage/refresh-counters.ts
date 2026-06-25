import { computeUsageFromSource } from "@/lib/usage/compute-usage";
import { currentPeriodStart } from "@/lib/usage/period";
import { getSupabaseService } from "@/lib/supabase/server";

export type RefreshedCounters = {
  periodStart: string;
  bookings: number;
  outboundSms: number;
  voiceMinutes: number;
};

/**
 * Recompute bookings + voice from source tables and upsert usage_counters.
 * sms_count stores outbound SMS only (incremented on send); inbound SMS is added at read time.
 */
export async function refreshUsageCounters(businessId: string): Promise<RefreshedCounters | null> {
  const db = getSupabaseService();
  if (!db) return null;

  const periodStart = currentPeriodStart();
  const computed = await computeUsageFromSource(db, businessId, periodStart);

  const { data: existing } = await db
    .from("usage_counters")
    .select("sms_count")
    .eq("business_id", businessId)
    .eq("period_start", periodStart)
    .maybeSingle();

  const outboundSms = existing?.sms_count ?? 0;

  const { error } = await db.from("usage_counters").upsert(
    {
      business_id: businessId,
      period_start: periodStart,
      bookings_count: computed.bookings,
      sms_count: outboundSms,
      voice_minutes: computed.voiceMinutes,
    },
    { onConflict: "business_id,period_start" }
  );

  if (error) {
    console.error("[usage] refresh:", error.message);
    return null;
  }

  return {
    periodStart,
    bookings: computed.bookings,
    outboundSms,
    voiceMinutes: computed.voiceMinutes,
  };
}

export async function rollupAllUsageCounters(): Promise<{
  businesses: number;
  refreshed: number;
  failed: number;
}> {
  const db = getSupabaseService();
  if (!db) return { businesses: 0, refreshed: 0, failed: 0 };

  const { data: rows, error } = await db.from("businesses").select("id");
  if (error || !rows?.length) {
    return { businesses: 0, refreshed: 0, failed: 0 };
  }

  let refreshed = 0;
  let failed = 0;
  for (const row of rows) {
    const result = await refreshUsageCounters(row.id as string);
    if (result) refreshed += 1;
    else failed += 1;
  }

  return { businesses: rows.length, refreshed, failed };
}