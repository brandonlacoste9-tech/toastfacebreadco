import { getApiUser } from "@/lib/auth/api-auth";
import { sendBookingSms } from "@/lib/twilio/send-booking-sms";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { booking_id, template = "confirmation", to } = body;

  if (!to && !booking_id) {
    return NextResponse.json({ error: "Provide booking_id or to + message flow" }, { status: 400 });
  }

  if (!booking_id) {
    return NextResponse.json({ error: "booking_id required" }, { status: 400 });
  }

  const smsTemplate = template === "reminder" ? "reminder" : "confirmation";
  const result = await sendBookingSms({
    supabase,
    businessId,
    bookingId: booking_id,
    template: smsTemplate,
    phoneOverride: to,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true, sid: result.sid });
}