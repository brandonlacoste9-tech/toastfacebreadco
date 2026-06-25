/** Calendar month period for usage meters (UTC month boundaries on period_start DATE). */
export function currentPeriodStart(now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function periodEndIso(periodStart: string): string {
  const [y, m] = periodStart.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString();
}