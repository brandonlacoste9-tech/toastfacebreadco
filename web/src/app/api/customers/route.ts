import { getApiUser } from "@/lib/auth/api-auth";
import { deleteBusinessRow } from "@/lib/auth/business-mutation";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, phone, email, preferred_language, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ customers: data });
}

export async function PATCH(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { id, full_name, phone, email } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, string | null> = {};
  if (full_name !== undefined) updates.full_name = full_name?.trim() || "";
  if (phone !== undefined) updates.phone = phone?.trim() ? phone.trim() : null;
  if (email !== undefined) updates.email = email?.trim() ? email.trim() : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  if (updates.full_name === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("customers")
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
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const result = await deleteBusinessRow("customers", id, businessId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}