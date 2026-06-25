import { hasSchedulingConflict } from "@/lib/vapi/hours";
import { MONTREAL_TZ, montrealDayBoundsIso } from "@/lib/vapi/timezone";
import type { SupabaseClient } from "@supabase/supabase-js";

const TZ = MONTREAL_TZ;

export async function updateBookingDetails({
  supabase,
  businessId,
  appointmentId,
  starts_at,
  service_id,
  notes,
  customer_name,
}: {
  supabase: SupabaseClient;
  businessId: string;
  appointmentId: string;
  starts_at?: string;
  service_id?: string | null;
  notes?: string | null;
  customer_name?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing } = await supabase
    .from("appointments")
    .select("starts_at, ends_at, service_id, status")
    .eq("id", appointmentId)
    .eq("business_id", businessId)
    .single();

  if (!existing) return { ok: false, error: "Booking not found" };

  let durationMinutes = 60;
  const resolvedServiceId = service_id !== undefined ? service_id : existing.service_id;

  if (resolvedServiceId) {
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", resolvedServiceId)
      .eq("business_id", businessId)
      .single();
    if (service?.duration_minutes) durationMinutes = service.duration_minutes;
  }

  const startIso = starts_at ?? (existing.starts_at as string);
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return { ok: false, error: "Invalid date/time" };
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const preferredDate = start.toLocaleDateString("en-CA", { timeZone: TZ });
  const dayBounds = montrealDayBoundsIso(preferredDate);
  if (dayBounds) {
    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id, starts_at, ends_at")
      .eq("business_id", businessId)
      .gte("starts_at", dayBounds.start)
      .lt("starts_at", dayBounds.end)
      .neq("status", "cancelled")
      .neq("id", appointmentId);

    const booked = (conflicts ?? []).map((c) => ({
      starts_at: c.starts_at as string,
      ends_at: c.ends_at as string,
    }));

    if (hasSchedulingConflict(booked, start.getTime(), end.getTime())) {
      return { ok: false, error: "That time slot is already taken" };
    }
  }

  const updates: Record<string, unknown> = {
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  };
  if (service_id !== undefined) updates.service_id = service_id;
  if (notes !== undefined) updates.notes = notes?.trim() ? notes.trim() : null;
  if (customer_name !== undefined) updates.customer_name = customer_name;

  const { error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", appointmentId)
    .eq("business_id", businessId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}