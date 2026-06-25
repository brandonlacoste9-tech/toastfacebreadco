import { computeUsageFromSource } from "@/lib/usage/compute-usage";
import { getPlanLimits, usagePercent } from "@/lib/usage/plan-limits";
import {
  checkOutboundSmsAllowed,
  isUsageEnforcementEnabled,
} from "@/lib/usage/outbound-sms-guard";
import { resolveBusinessPlan } from "@/lib/usage/resolve-plan";
import { getSupabaseService } from "@/lib/supabase/server";

export type OutboundSmsStatus = {
  enforce: boolean;
  paused: boolean;
  used: number;
  limit: number | null;
  percent: number | null;
};

export async function getOutboundSmsStatus(businessId: string): Promise<OutboundSmsStatus> {
  const enforce = isUsageEnforcementEnabled();
  const db = getSupabaseService();

  if (!db) {
    return { enforce, paused: false, used: 0, limit: null, percent: null };
  }

  const plan = await resolveBusinessPlan(db, businessId);
  const limit = getPlanLimits(plan).sms;
  const computed = await computeUsageFromSource(db, businessId);

  const { data: counter } = await db
    .from("usage_counters")
    .select("sms_count")
    .eq("business_id", businessId)
    .eq("period_start", computed.periodStart)
    .maybeSingle();

  const used = computed.inboundSms + (counter?.sms_count ?? 0);
  const percent = usagePercent(used, limit);

  if (!enforce) {
    return { enforce: false, paused: false, used, limit, percent };
  }

  const guard = await checkOutboundSmsAllowed(businessId);
  return {
    enforce: true,
    paused: !guard.allowed,
    used,
    limit,
    percent,
  };
}