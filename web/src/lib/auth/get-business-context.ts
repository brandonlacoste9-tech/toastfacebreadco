import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type BusinessContext = {
  userId: string;
  email: string;
  businessId: string;
  businessName: string;
  plan: string;
  trialEndsAt: string | null;
  onboardingCompleted: boolean;
  defaultLanguage: string;
};

export async function getBusinessContext(): Promise<BusinessContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select(
      "business_id, full_name, businesses(id, name, plan, trial_ends_at, onboarding_completed, default_language)"
    )
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) return null;

  type BusinessRow = {
    id: string;
    name: string;
    plan: string;
    trial_ends_at: string | null;
    onboarding_completed?: boolean;
    default_language: string;
  };

  const raw = profile.businesses as BusinessRow | BusinessRow[] | null;
  const business = Array.isArray(raw) ? raw[0] : raw;
  if (!business) return null;

  return {
    userId: user.id,
    email: user.email ?? "",
    businessId: business.id,
    businessName: business.name,
    plan: business.plan,
    trialEndsAt: business.trial_ends_at,
    onboardingCompleted: business.onboarding_completed ?? false,
    defaultLanguage: business.default_language,
  };
}

export async function requireBusinessContext(): Promise<BusinessContext> {
  const ctx = await getBusinessContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireOnboardedContext(): Promise<BusinessContext> {
  const ctx = await requireBusinessContext();
  if (!ctx.onboardingCompleted) redirect("/onboarding");
  return ctx;
}