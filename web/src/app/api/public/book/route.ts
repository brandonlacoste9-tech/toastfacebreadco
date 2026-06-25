import { createPublicBooking, getPublicServices } from "@/lib/public/public-booking";
import { resolveBusinessBySlug } from "@/lib/public/resolve-business";
import { getSupabaseService } from "@/lib/supabase/server";
import { sendBookingSms } from "@/lib/twilio/send-booking-sms";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim();
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const business = await resolveBusinessBySlug(slug);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const db = getSupabaseService();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const services = await getPublicServices(db, business.id);
  return NextResponse.json({
    business: {
      name: business.name,
      slug: business.slug,
      default_language: business.default_language,
    },
    services,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug?.trim();
    const customer_name = body.customer_name?.trim();
    const customer_phone = body.customer_phone?.trim() || null;
    const customer_email = body.customer_email?.trim() || null;
    const service_id = body.service_id;
    const starts_at = body.starts_at;
    const notes = body.notes?.trim() || null;

    if (!slug || !customer_name || !service_id || !starts_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const business = await resolveBusinessBySlug(slug);
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    const db = getSupabaseService();
    if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

    const result = await createPublicBooking({
      db,
      businessId: business.id,
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      starts_at,
      notes,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    let sms_sent = false;
    if (customer_phone && db) {
      const sms = await sendBookingSms({
        supabase: db,
        businessId: business.id,
        bookingId: result.id,
        template: "confirmation",
        phoneOverride: customer_phone,
      });
      sms_sent = sms.ok;
    }

    return NextResponse.json({ ok: true, id: result.id, sms_sent });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}