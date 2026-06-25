import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function getApiUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: NextResponse.json({ error: "Not configured" }, { status: 503 }) };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("users")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) {
    return { error: NextResponse.json({ error: "No business profile" }, { status: 403 }) };
  }

  return { supabase, user, businessId: profile.business_id as string };
}