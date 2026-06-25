import { computeUsageFromSource } from "@/lib/usage/compute-usage";
import { getPlanLimits } from "@/lib/usage/plan-limits";
import { resolveBusinessPlan } from "@/lib/usage/resolve-plan";
import { getSupabaseService } from "@/lib/supabase/server";

const ENFORCE_MULTIPLIER = 2;

export function isUsageEnforcementEnabled(): boolean {
  return process.env.USAGE_ENFORCE?.trim() === "true";
}

export type OutboundSmsGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "sms_limit"; used: number; limit: number };

/**
 * Outbound-only guard. Inbound voice/SMS unaffected.
 * Default: allow all (USAGE_ENFORCE unset). When true, block at 200%+ of SMS plan limit.
 */
export async function checkOutboundSmsAllowed(
  businessId: string
): Promise<OutboundSmsGuardResult> {
  if (!isUsageEnforcementEnabled()) return { allowed: true };

  const db = getSupabaseService();
  if (!db) return { allowed: true };

  const plan = await resolveBusinessPlan(db, businessId);
  const limits = getPlanLimits(plan);
  const smsLimit = limits.sms;
  if (smsLimit === null || smsLimit <= 0) return { allowed: true };

  const computed = await computeUsageFromSource(db, businessId);
  const { data: counter } = await db
    .from("usage_counters")
    .select("sms_count")
    .eq("business_id", businessId)
    .eq("period_start", computed.periodStart)
    .maybeSingle();

  const used = computed.inboundSms + (counter?.sms_count ?? 0);
  const threshold = smsLimit * ENFORCE_MULTIPLIER;

  if (used >= threshold) {
    console.warn(
      `[usage] Outbound SMS blocked for ${businessId}: ${used}/${smsLimit} (enforce @ ${ENFORCE_MULTIPLIER}x)`
    );
    return { allowed: false, reason: "sms_limit", used, limit: smsLimit };
  }

  return { allowed: true };
}