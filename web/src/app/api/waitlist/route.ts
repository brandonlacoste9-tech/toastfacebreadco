import { getWaitlistClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      business_name,
      contact_name,
      email,
      phone,
      city,
      staff_count,
      primary_pain,
      locale = "fr-CA",
    } = body;

    if (!business_name || !contact_name || !email || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const founderCode = `RDV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const db = getWaitlistClient();
    if (!db) {
      console.warn("[waitlist] Supabase not configured — signup not persisted");
      return NextResponse.json(
        {
          ok: true,
          founder_code: founderCode,
          persisted: false,
          warning: "Supabase env vars missing on server. Lead not saved.",
        },
        { status: 503 }
      );
    }

    const { error } = await db.from("waitlist_signups").insert({
      business_name,
      contact_name,
      email,
      phone: phone ?? null,
      city,
      staff_count: staff_count ?? null,
      primary_pain: primary_pain ?? null,
      locale,
      founder_code: founderCode,
    });
    if (error) {
      console.error("[waitlist]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, founder_code: founderCode, persisted: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}