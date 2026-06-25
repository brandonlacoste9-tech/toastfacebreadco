import type { PlanId } from "@/lib/stripe/plans";

export type UsageMetric = "bookings" | "sms" | "voiceMinutes" | "staff";

export type PlanLimits = {
  bookings: number | null;
  sms: number | null;
  voiceMinutes: number | null;
  staff: number | null;
};

const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  starter: { bookings: null, sms: 500, voiceMinutes: 200, staff: 2 },
  white_glove: { bookings: null, sms: 5000, voiceMinutes: 2500, staff: null },
};

export function getPlanLimits(plan: string | null): PlanLimits {
  if (plan === "starter" || plan === "white_glove") {
    return PLAN_LIMITS[plan];
  }
  return { bookings: null, sms: 0, voiceMinutes: 0, staff: 0 };
}

export function usagePercent(used: number, limit: number | null): number | null {
  if (limit === null || limit <= 0) return null;
  return Math.min(100, Math.round((used / limit) * 100));
}