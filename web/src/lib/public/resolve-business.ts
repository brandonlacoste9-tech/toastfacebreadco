import { getSupabaseService } from "@/lib/supabase/server";

export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  default_language: string;
  timezone: string;
  working_hours: Record<string, { open: string; close: string }>;
  onboarding_completed: boolean;
};

export async function resolveBusinessBySlug(
  slug: string
): Promise<PublicBusiness | null> {
  const db = getSupabaseService();
  if (!db) return null;

  const { data } = await db
    .from("businesses")
    .select(
      "id, name, slug, default_language, timezone, working_hours, onboarding_completed"
    )
    .eq("slug", slug.trim().toLowerCase())
    .maybeSingle();

  if (!data?.onboarding_completed) return null;

  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    default_language: data.default_language as string,
    timezone: (data.timezone as string) ?? "America/Montreal",
    working_hours:
      (data.working_hours as PublicBusiness["working_hours"]) ?? {},
    onboarding_completed: true,
  };
}