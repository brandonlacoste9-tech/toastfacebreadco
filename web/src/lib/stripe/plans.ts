export type PlanId = "starter" | "white_glove";
export type BillingInterval = "month" | "year";

const PRICE_ENV: Record<PlanId, Record<BillingInterval, string>> = {
  starter: {
    month: "STRIPE_PRICE_STARTER_MONTHLY",
    year: "STRIPE_PRICE_STARTER_ANNUAL",
  },
  white_glove: {
    month: "STRIPE_PRICE_WHITE_GLOVE_MONTHLY",
    year: "STRIPE_PRICE_WHITE_GLOVE_ANNUAL",
  },
};

export function getPriceId(plan: PlanId, interval: BillingInterval): string | null {
  const envKey = PRICE_ENV[plan]?.[interval];
  if (!envKey) return null;
  return process.env[envKey]?.trim() || null;
}

export function planFromPriceId(priceId: string): PlanId | null {
  for (const plan of Object.keys(PRICE_ENV) as PlanId[]) {
    for (const interval of ["month", "year"] as BillingInterval[]) {
      if (getPriceId(plan, interval) === priceId) return plan;
    }
  }
  return null;
}

export function isValidPlan(plan: string): plan is PlanId {
  return plan === "starter" || plan === "white_glove";
}

export function remainingTrialDays(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const end = new Date(trialEndsAt).getTime();
  const now = Date.now();
  if (end <= now) return 0;
  return Math.ceil((end - now) / 86_400_000);
}