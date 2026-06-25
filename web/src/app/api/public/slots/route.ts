import { getAvailableSlots } from "@/lib/public/public-booking";
import { resolveBusinessBySlug } from "@/lib/public/resolve-business";
import { getSupabaseService } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const slug = params.get("slug")?.trim();
  const date = params.get("date")?.trim();
  const service_id = params.get("service_id")?.trim();

  if (!slug || !date || !service_id) {
    return NextResponse.json({ error: "Missing slug, date, or service_id" }, { status: 400 });
  }

  const business = await resolveBusinessBySlug(slug);
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const db = getSupabaseService();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const slots = await getAvailableSlots({
    db,
    businessId: business.id,
    workingHours: business.working_hours,
    preferredDate: date,
    serviceId: service_id,
  });

  return NextResponse.json({ slots });
}