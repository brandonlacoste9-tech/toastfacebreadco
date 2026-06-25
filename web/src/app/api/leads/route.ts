import { getApiUser } from "@/lib/auth/api-auth";
import { deleteBusinessRow } from "@/lib/auth/business-mutation";
import { NextResponse } from "next/server";

const STAGES = ["new", "contacted", "booked", "lost"] as const;

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const { data, error } = await supabase
    .from("leads")
    .select("id, contact_name, contact_phone, source, pipeline_stage, notes, captured_at")
    .eq("business_id", businessId)
    .order("captured_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

export async function POST(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { contact_name, contact_phone, source = "manual", notes } = body;

  if (!contact_name) {
    return NextResponse.json({ error: "Missing contact name" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      business_id: businessId,
      contact_name,
      contact_phone: contact_phone ?? null,
      source,
      pipeline_stage: "new",
      notes: notes ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PATCH(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { id, pipeline_stage, notes } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updates: { pipeline_stage?: string; notes?: string | null } = {};
  if (pipeline_stage !== undefined) {
    if (!STAGES.includes(pipeline_stage as (typeof STAGES)[number])) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    updates.pipeline_stage = pipeline_stage;
  }
  if (notes !== undefined) {
    updates.notes = notes?.trim() ? notes.trim() : null;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("leads")
    .update(updates)
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

  const result = await deleteBusinessRow("leads", id, businessId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}