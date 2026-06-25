import { MONTREAL_TZ } from "@/lib/vapi/timezone";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type HoursRow = Partial<Record<DayKey, { open: string; close: string }>>;

const DEFAULT_HOURS: Record<DayKey, { open: string; close: string }> = {
  mon: { open: "09:00", close: "17:00" },
  tue: { open: "09:00", close: "17:00" },
  wed: { open: "09:00", close: "17:00" },
  thu: { open: "09:00", close: "17:00" },
  fri: { open: "09:00", close: "17:00" },
  sat: { open: "10:00", close: "15:00" },
  sun: { open: "", close: "" },
};

function parseTime(value: string): { hour: number; minute: number } | null {
  const m = value?.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

export function weekdayKeyForDate(preferredDate: string, timeZone = MONTREAL_TZ): DayKey | null {
  const parts = preferredDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return null;
  const y = Number(parts[1]);
  const m = Number(parts[2]);
  const d = Number(parts[3]);
  const noon = new Date(Date.UTC(y, m - 1, d, 17, 0, 0));
  const weekday = noon.toLocaleDateString("en-US", { timeZone, weekday: "short" });
  const map: Record<string, DayKey> = {
    Sun: "sun",
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
  };
  return map[weekday] ?? null;
}

export function getDayHours(
  workingHours: HoursRow | null | undefined,
  day: DayKey
): { open: string; close: string } | null {
  const row = workingHours?.[day] ?? DEFAULT_HOURS[day];
  if (!row?.open?.trim() || !row?.close?.trim()) return null;
  const open = parseTime(row.open);
  const close = parseTime(row.close);
  if (!open || !close) return null;
  const openMins = open.hour * 60 + open.minute;
  const closeMins = close.hour * 60 + close.minute;
  if (closeMins <= openMins) return null;
  return row;
}

/** 30-minute slot start times (hour, minute) that fit service duration before close. */
export function generateSlotTimes(
  workingHours: HoursRow | null | undefined,
  preferredDate: string,
  durationMinutes: number
): { hour: number; minute: number }[] {
  const day = weekdayKeyForDate(preferredDate);
  if (!day) return [];

  const hours = getDayHours(workingHours, day);
  if (!hours) return [];

  const open = parseTime(hours.open)!;
  const close = parseTime(hours.close)!;
  const openMins = open.hour * 60 + open.minute;
  const closeMins = close.hour * 60 + close.minute;

  const slots: { hour: number; minute: number }[] = [];
  for (let mins = openMins; mins + durationMinutes <= closeMins; mins += 30) {
    slots.push({ hour: Math.floor(mins / 60), minute: mins % 60 });
  }
  return slots;
}

export function hasSchedulingConflict(
  booked: { starts_at: string; ends_at: string }[],
  startMs: number,
  endMs: number
): boolean {
  return booked.some((b) => {
    const bStart = new Date(b.starts_at).getTime();
    const bEnd = new Date(b.ends_at).getTime();
    return startMs < bEnd && endMs > bStart;
  });
}