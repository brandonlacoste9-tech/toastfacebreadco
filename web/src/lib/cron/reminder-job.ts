import { getSupabaseService } from "@/lib/supabase/server";
import { sendOutboundSms } from "@/lib/twilio/send-outbound-sms";
import { bookingReminder2hSms, bookingReminderSms } from "@/lib/twilio/templates";
import { montrealDayBoundsIso } from "@/lib/vapi/timezone";

function tomorrowMontrealIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Montreal" });
}

type ApptRow = {
  id: string;
  customer_name: string;
  starts_at: string;
  business_id: string;
  businesses: { name: string; default_language: string } | { name: string; default_language: string }[] | null;
  customers: { phone: string | null } | { phone: string | null }[] | null;
  services: { name: string } | { name: string }[] | null;
};

function pickPhone(row: ApptRow): string | null {
  const cust = row.customers;
  const c = Array.isArray(cust) ? cust[0] : cust;
  return c?.phone ?? null;
}

function pickBusiness(row: ApptRow) {
  const biz = row.businesses;
  return Array.isArray(biz) ? biz[0] : biz;
}

function pickService(row: ApptRow): string | null {
  const svc = row.services;
  const s = Array.isArray(svc) ? svc[0] : svc;
  return s?.name ?? null;
}

export async function run24hReminders(): Promise<{ sent: number; skipped: number; date: string }> {
  const supabase = getSupabaseService();
  if (!supabase) throw new Error("Database not configured");

  const date = tomorrowMontrealIso();
  const bounds = montrealDayBoundsIso(date);
  if (!bounds) throw new Error("Invalid date");

  const { data: appts, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, starts_at, business_id, reminder_24h_sent_at, businesses(name, default_language), customers(phone), services(name)"
    )
    .gte("starts_at", bounds.start)
    .lt("starts_at", bounds.end)
    .in("status", ["booked", "confirmed"])
    .is("reminder_24h_sent_at", null);

  if (error) throw new Error(error.message);

  let sent = 0;
  let skipped = 0;

  for (const raw of appts ?? []) {
    const appt = raw as ApptRow & { reminder_24h_sent_at: string | null };
    const phone = pickPhone(appt);
    if (!phone) {
      skipped++;
      continue;
    }

    const business = pickBusiness(appt);
    const locale = business?.default_language === "en" ? "en" : "fr";
    const body = bookingReminderSms({
      businessName: business?.name ?? "JustBookMe",
      customerName: appt.customer_name,
      startsAt: new Date(appt.starts_at),
      serviceName: pickService(appt),
      locale,
    });

    const result = await sendOutboundSms(appt.business_id, phone, body);
    if (result.ok) {
      sent++;
      await supabase
        .from("appointments")
        .update({ reminder_24h_sent_at: new Date().toISOString() })
        .eq("id", appt.id);
    } else {
      skipped++;
    }
  }

  return { sent, skipped, date };
}

export async function run2hReminders(): Promise<{ sent: number; skipped: number }> {
  const supabase = getSupabaseService();
  if (!supabase) throw new Error("Database not configured");

  const now = Date.now();
  const windowStart = new Date(now + 105 * 60_000).toISOString();
  const windowEnd = new Date(now + 135 * 60_000).toISOString();

  const { data: appts, error } = await supabase
    .from("appointments")
    .select(
      "id, customer_name, starts_at, business_id, businesses(name, default_language), customers(phone), services(name)"
    )
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd)
    .in("status", ["booked", "confirmed"])
    .is("reminder_2h_sent_at", null);

  if (error) throw new Error(error.message);

  let sent = 0;
  let skipped = 0;

  for (const raw of appts ?? []) {
    const appt = raw as ApptRow;
    const phone = pickPhone(appt);
    if (!phone) {
      skipped++;
      continue;
    }

    const business = pickBusiness(appt);
    const locale = business?.default_language === "en" ? "en" : "fr";
    const body = bookingReminder2hSms({
      businessName: business?.name ?? "JustBookMe",
      customerName: appt.customer_name,
      startsAt: new Date(appt.starts_at),
      serviceName: pickService(appt),
      locale,
    });

    const result = await sendOutboundSms(appt.business_id, phone, body);
    if (result.ok) {
      sent++;
      await supabase
        .from("appointments")
        .update({ reminder_2h_sent_at: new Date().toISOString() })
        .eq("id", appt.id);
    } else {
      skipped++;
    }
  }

  return { sent, skipped };
}