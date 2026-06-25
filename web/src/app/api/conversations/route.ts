import { getApiUser } from "@/lib/auth/api-auth";
import { deleteBusinessRow } from "@/lib/auth/business-mutation";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 50), 100);

  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, channel, from_number, started_at, duration_seconds, outcome, summary, transcript, recovered_revenue_cents"
    )
    .eq("business_id", businessId)
    .in("channel", ["voice", "sms"])
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data });
}

export async function DELETE(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { businessId } = auth;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const result = await deleteBusinessRow("conversations", id, businessId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}