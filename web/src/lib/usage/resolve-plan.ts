import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveBusinessPlan(
  supabase: SupabaseClient,
  businessId: string
): Promise<string> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("business_id", businessId)
    .maybeSingle();

  if (sub?.plan && (sub.status === "active" || sub.status === "trialing")) {
    return sub.plan;
  }

  const { data: biz } = await supabase
    .from("businesses")
    .select("plan")
    .eq("id", businessId)
    .single();

  return biz?.plan ?? "trial";
}