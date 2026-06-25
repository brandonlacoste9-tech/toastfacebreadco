import { getSupabaseService } from "@/lib/supabase/server";

/** Delete a row scoped to business — uses service role so RLS DELETE grants are not required. */
export async function deleteBusinessRow(
  table: "appointments" | "leads" | "conversations" | "customers" | "staff",
  id: string,
  businessId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getSupabaseService();
  if (!db) return { ok: false, error: "Database not configured" };

  const { data, error } = await db
    .from(table)
    .delete()
    .eq("id", id)
    .eq("business_id", businessId)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Not found" };
  return { ok: true };
}