import { resolveBusinessBySlug } from "@/lib/public/resolve-business";
import { getSupabaseService } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body.slug?.trim();
    const contact_name = body.contact_name?.trim();
    const contact_phone = body.contact_phone?.trim() || null;
    const notes = body.notes?.trim() || null;

    if (!slug || !contact_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const business = await resolveBusinessBySlug(slug);
    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const db = getSupabaseService();
    if (!db) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const { data, error } = await db
      .from("leads")
      .insert({
        business_id: business.id,
        contact_name,
        contact_phone,
        source: "web_form",
        pipeline_stage: "new",
        notes,
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}