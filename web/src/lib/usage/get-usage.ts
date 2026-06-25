import { computeUsageFromSource } from "@/lib/usage/compute-usage";
import { getPlanLimits } from "@/lib/usage/plan-limits";
import { currentPeriodStart } from "@/lib/usage/period";
import { refreshUsageCounters } from "@/lib/usage/refresh-counters";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UsageSnapshot = {
  periodStart: string;
  bookings: number;
  sms: number;
  voiceMinutes: number;
  staff: number;
  limits: ReturnType<typeof getPlanLimits>;
};

export async function getUsageSnapshot({
  supabase,
  businessId,
  plan,
}: {
  supabase: SupabaseClient;
  businessId: string;
  plan: string;
}): Promise<UsageSnapshot> {
  const periodStart = currentPeriodStart();

  await refreshUsageCounters(businessId);

  const computed = await computeUsageFromSource(supabase, businessId, periodStart);

  const { data: counter } = await supabase
    .from("usage_counters")
    .select("bookings_count, sms_count, voice_minutes")
    .eq("business_id", businessId)
    .eq("period_start", periodStart)
    .maybeSingle();

  const bookings = counter?.bookings_count ?? computed.bookings;
  const outboundSms = counter?.sms_count ?? 0;
  const sms = computed.inboundSms + outboundSms;
  const voiceMinutes = Number(counter?.voice_minutes ?? computed.voiceMinutes);

  const { count: staffCount } = await supabase
    .from("staff")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("active", true);

  return {
    periodStart,
    bookings,
    sms,
    voiceMinutes: Math.round(voiceMinutes * 10) / 10,
    staff: staffCount ?? 0,
    limits: getPlanLimits(plan),
  };
}