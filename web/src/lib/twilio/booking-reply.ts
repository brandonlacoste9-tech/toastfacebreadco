import { getSupabaseService } from "@/lib/supabase/server";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function isCancelReply(body: string): boolean {
  const t = body.trim().toLowerCase();
  return /^(annuler|annulation|cancel|cancelled|canceled|non|no)$/.test(t) ||
    /\b(annuler|cancel)\b/.test(t) && t.length < 32;
}

export function isConfirmReply(body: string): boolean {
  const t = body.trim().toLowerCase();
  return /^(oui|yes|ok|confirm|confirmer|confirmed)$/.test(t) ||
    (/^(y|o)$/.test(t) && t.length < 4);
}

type UpcomingAppt = {
  id: string;
  customer_name: string;
  starts_at: string;
  status: string;
};

export async function findUpcomingAppointment(
  businessId: string,
  fromPhone: string
): Promise<UpcomingAppt | null> {
  const supabase = getSupabaseService();
  if (!supabase) return null;

  const normalized = normalizePhone(fromPhone);
  const { data: customers } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .in("phone", [normalized, fromPhone]);

  const customerIds = (customers ?? []).map((c) => c.id as string);
  if (customerIds.length === 0) return null;

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, customer_name, starts_at, status")
    .eq("business_id", businessId)
    .in("customer_id", customerIds)
    .gte("starts_at", new Date().toISOString())
    .in("status", ["booked", "confirmed"])
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return appt as UpcomingAppt | null;
}

export async function cancelAppointmentByReply(
  businessId: string,
  appointmentId: string
): Promise<boolean> {
  const supabase = getSupabaseService();
  if (!supabase) return false;

  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("business_id", businessId);

  return !error;
}

export async function confirmAppointmentByReply(
  businessId: string,
  appointmentId: string
): Promise<boolean> {
  const supabase = getSupabaseService();
  if (!supabase) return false;

  const { error } = await supabase
    .from("appointments")
    .update({ status: "confirmed" })
    .eq("id", appointmentId)
    .eq("business_id", businessId)
    .in("status", ["booked", "confirmed"]);

  return !error;
}

export function formatWhen(iso: string, locale: "fr" | "en"): string {
  return new Date(iso).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Montreal",
  });
}