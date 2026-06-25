import { updateBookingDetails } from "@/lib/appointments/update-booking";
import { getApiUser } from "@/lib/auth/api-auth";
import { deleteBusinessRow } from "@/lib/auth/business-mutation";
import { sendBookingSms } from "@/lib/twilio/send-booking-sms";
import { NextResponse } from "next/server";

const BOOKING_STATUSES = ["booked", "confirmed", "cancelled", "no_show", "completed"] as const;

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_name, starts_at, ends_at, status, notes, services(name)")
    .eq("business_id", businessId)
    .order("starts_at", { ascending: true })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function POST(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { customer_name, customer_phone, service_id, staff_id, starts_at, notes } = body;

  if (!customer_name || !starts_at) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let durationMinutes = 60;
  if (service_id) {
    const { data: service } = await supabase
      .from("services")
      .select("duration_minutes")
      .eq("id", service_id)
      .eq("business_id", businessId)
      .single();
    if (service?.duration_minutes) durationMinutes = service.duration_minutes;
  }

  const start = new Date(starts_at);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  let customerId: string | null = null;
  if (customer_phone) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("business_id", businessId)
      .eq("phone", customer_phone)
      .maybeSingle();

    if (existing?.id) {
      customerId = existing.id;
    } else {
      const { data: created, error: custErr } = await supabase
        .from("customers")
        .insert({
          business_id: businessId,
          full_name: customer_name,
          phone: customer_phone,
        })
        .select("id")
        .single();
      if (custErr) return NextResponse.json({ error: custErr.message }, { status: 500 });
      customerId = created.id;
    }
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      service_id: service_id ?? null,
      staff_id: staff_id ?? null,
      customer_name,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: "booked",
      source: "manual",
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sms_sent = false;
  if (customer_phone) {
    const sms = await sendBookingSms({
      supabase,
      businessId,
      bookingId: data.id,
      template: "confirmation",
      phoneOverride: customer_phone,
    });
    sms_sent = sms.ok;
  }

  return NextResponse.json({ ok: true, id: data.id, sms_sent });
}

export async function PATCH(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { id, status, starts_at, service_id, notes, customer_name } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (starts_at !== undefined || service_id !== undefined || notes !== undefined || customer_name !== undefined) {
    const result = await updateBookingDetails({
      supabase,
      businessId,
      appointmentId: id,
      starts_at,
      service_id,
      notes,
      customer_name,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  if (status !== undefined) {
    if (!BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id)
      .eq("business_id", businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { businessId } = auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const result = await deleteBusinessRow("appointments", id, businessId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}