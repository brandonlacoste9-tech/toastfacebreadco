import { usagePercent } from "@/lib/usage/plan-limits";

export type SoftLimitLevel = "ok" | "warn" | "critical";

/** Display-only soft limits — no enforcement (pilot-safe). */
export function softLimitLevel(used: number, limit: number | null): SoftLimitLevel {
  const pct = usagePercent(used, limit);
  if (pct === null) return "ok";
  if (pct >= 100) return "critical";
  if (pct >= 80) return "warn";
  return "ok";
}

export function worstSoftLimitLevel(
  metrics: { used: number; limit: number | null }[]
): SoftLimitLevel {
  let worst: SoftLimitLevel = "ok";
  for (const m of metrics) {
    const level = softLimitLevel(m.used, m.limit);
    if (level === "critical") return "critical";
    if (level === "warn") worst = "warn";
  }
  return worst;
}