import { sendOutboundSms } from "@/lib/twilio/send-outbound-sms";
import { bookingConfirmationSms, bookingReminderSms } from "@/lib/twilio/templates";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function sendBookingSms({
  supabase,
  businessId,
  bookingId,
  template,
  phoneOverride,
}: {
  supabase: SupabaseClient;
  businessId: string;
  bookingId: string;
  template: "confirmation" | "reminder";
  phoneOverride?: string;
}): Promise<{ ok: true; sid: string } | { ok: false; error: string }> {
  const { data: business } = await supabase
    .from("businesses")
    .select("name, default_language")
    .eq("id", businessId)
    .single();

  if (!business) return { ok: false, error: "Business not found" };

  const { data: booking } = await supabase
    .from("appointments")
    .select("customer_name, starts_at, services(name), customers(phone)")
    .eq("id", bookingId)
    .eq("business_id", businessId)
    .single();

  if (!booking) return { ok: false, error: "Booking not found" };

  const cust = booking.customers as { phone: string | null } | { phone: string | null }[] | null;
  const custPhone = Array.isArray(cust) ? cust[0]?.phone : cust?.phone;
  const phone = phoneOverride ?? custPhone;
  if (!phone) return { ok: false, error: "No phone number" };

  const locale = business.default_language === "en" ? "en" : "fr";
  const svc = booking.services as { name: string } | { name: string }[] | null;
  const serviceName = Array.isArray(svc) ? (svc[0]?.name ?? null) : (svc?.name ?? null);
  const startsAt = new Date(booking.starts_at as string);
  const customerName = booking.customer_name as string;

  const body =
    template === "reminder"
      ? bookingReminderSms({ businessName: business.name, customerName, startsAt, serviceName, locale })
      : bookingConfirmationSms({ businessName: business.name, customerName, startsAt, serviceName, locale });

  const result = await sendOutboundSms(businessId, phone, body);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, sid: result.sid };
}