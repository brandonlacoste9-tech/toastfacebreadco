export const MONTREAL_TZ = "America/Montreal";

/** Convert a Montreal local date/time to UTC ISO string. */
export function montrealLocalToIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const targetTime = `${pad(hour)}:${pad(minute)}`;
  const noonUtc = Date.UTC(year, month - 1, day, 12, 0, 0);

  for (let offsetHours = -18; offsetHours <= 18; offsetHours++) {
    const candidate = noonUtc + offsetHours * 60 * 60 * 1000;
    const d = new Date(candidate);
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: MONTREAL_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    const cy = Number(get("year"));
    const cm = Number(get("month"));
    const cd = Number(get("day"));
    const ch = get("hour");
    const cmin = get("minute");

    if (cy === year && cm === month && cd === day && `${ch}:${cmin}` === targetTime) {
      return d.toISOString();
    }
  }

  return new Date(Date.UTC(year, month - 1, day, hour + 4, minute)).toISOString();
}

export function montrealDayBoundsIso(preferredDate: string): { start: string; end: string } | null {
  const m = preferredDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return {
    start: montrealLocalToIso(y, mo, d, 0, 0),
    end: montrealLocalToIso(y, mo, d, 23, 59),
  };
}