import {
  generateSlotTimes,
  hasSchedulingConflict,
  type HoursRow,
} from "@/lib/vapi/hours";
import { montrealDayBoundsIso, montrealLocalToIso } from "@/lib/vapi/timezone";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getPublicServices(db: SupabaseClient, businessId: string) {
  const { data } = await db
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");
  return data ?? [];
}

export async function getAvailableSlots({
  db,
  businessId,
  workingHours,
  preferredDate,
  serviceId,
}: {
  db: SupabaseClient;
  businessId: string;
  workingHours: HoursRow;
  preferredDate: string;
  serviceId: string;
}) {
  const { data: service } = await db
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("business_id", businessId)
    .eq("active", true)
    .single();

  if (!service) return [];

  const durationMinutes = service.duration_minutes as number;
  const slotTimes = generateSlotTimes(workingHours, preferredDate, durationMinutes);
  const dayBounds = montrealDayBoundsIso(preferredDate);
  if (!dayBounds) return [];

  const { data: booked } = await db
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("business_id", businessId)
    .gte("starts_at", dayBounds.start)
    .lt("starts_at", dayBounds.end)
    .neq("status", "cancelled");

  const conflicts = (booked ?? []).map((b) => ({
    starts_at: b.starts_at as string,
    ends_at: b.ends_at as string,
  }));

  const parts = preferredDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!parts) return [];
  const y = Number(parts[1]);
  const mo = Number(parts[2]);
  const d = Number(parts[3]);

  const available: string[] = [];
  for (const { hour, minute } of slotTimes) {
    const startMs = new Date(montrealLocalToIso(y, mo, d, hour, minute)).getTime();
    const endMs = startMs + durationMinutes * 60_000;
    if (!hasSchedulingConflict(conflicts, startMs, endMs)) {
      available.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    }
  }
  return available;
}

export async function createPublicBooking({
  db,
  businessId,
  customer_name,
  customer_phone,
  customer_email,
  service_id,
  starts_at,
  notes,
}: {
  db: SupabaseClient;
  businessId: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_email?: string | null;
  service_id: string;
  starts_at: string;
  notes?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data: service } = await db
    .from("services")
    .select("duration_minutes")
    .eq("id", service_id)
    .eq("business_id", businessId)
    .eq("active", true)
    .single();

  if (!service) return { ok: false, error: "Invalid service" };

  const durationMinutes = service.duration_minutes as number;
  const start = new Date(starts_at);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Invalid date/time" };
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const preferredDate = start.toLocaleDateString("en-CA", { timeZone: "America/Montreal" });
  const dayBounds = montrealDayBoundsIso(preferredDate);
  if (dayBounds) {
    const { data: conflicts } = await db
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("business_id", businessId)
      .gte("starts_at", dayBounds.start)
      .lt("starts_at", dayBounds.end)
      .neq("status", "cancelled");

    const booked = (conflicts ?? []).map((c) => ({
      starts_at: c.starts_at as string,
      ends_at: c.ends_at as string,
    }));

    if (hasSchedulingConflict(booked, start.getTime(), end.getTime())) {
      return { ok: false, error: "That time slot is no longer available" };
    }
  }

  let customerId: string | null = null;
  if (customer_phone) {
    const { data: existing } = await db
      .from("customers")
      .select("id")
      .eq("business_id", businessId)
      .eq("phone", customer_phone)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id as string;
      await db
        .from("customers")
        .update({
          full_name: customer_name,
          email: customer_email ?? null,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error: custErr } = await db
        .from("customers")
        .insert({
          business_id: businessId,
          full_name: customer_name,
          phone: customer_phone,
          email: customer_email ?? null,
        })
        .select("id")
        .single();
      if (custErr) return { ok: false, error: custErr.message };
      customerId = created.id as string;
    }
  }

  const { data, error } = await db
    .from("appointments")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service_id,
      customer_name,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "booked",
      source: "web_form",
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}