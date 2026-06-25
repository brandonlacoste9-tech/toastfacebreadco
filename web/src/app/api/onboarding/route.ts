import { getApiUser } from "@/lib/auth/api-auth";
import { defaultVoiceInstructions, type BusinessType } from "@/lib/onboarding/presets";
import { provisionVoiceForBusiness } from "@/lib/vapi/provision-service";
import { NextResponse } from "next/server";

const BUSINESS_TYPES: BusinessType[] = ["salon", "trade", "office"];

export async function POST(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const { business_type, industry, working_hours, services, complete } = body;

  if (business_type && BUSINESS_TYPES.includes(business_type as BusinessType)) {
    const type = business_type as BusinessType;
    const { data: biz } = await supabase
      .from("businesses")
      .select("default_language, voice_instructions")
      .eq("id", businessId)
      .single();

    const lang = biz?.default_language === "en" ? "en" : "fr";
    const updates: Record<string, unknown> = { business_type: type };
    if (typeof industry === "string" && industry.trim().length > 0) {
      updates.industry = industry.trim();
    }
    if (!biz?.voice_instructions?.trim()) {
      updates.voice_instructions = defaultVoiceInstructions(type, lang);
    }

    const { error } = await supabase.from("businesses").update(updates).eq("id", businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (working_hours) {
    const { error } = await supabase
      .from("businesses")
      .update({ working_hours })
      .eq("id", businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(services) && services.length > 0) {
    const rows = services
      .filter((s: { name?: string }) => s.name?.trim())
      .map((s: { name: string; duration_minutes?: number; price_cents?: number }) => ({
        business_id: businessId,
        name: s.name.trim(),
        duration_minutes: s.duration_minutes ?? 60,
        price_cents: s.price_cents ?? 0,
      }));

    if (rows.length > 0) {
      await supabase.from("services").delete().eq("business_id", businessId);
      const { error } = await supabase.from("services").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  let voice: { assistant_id?: string; phone_linked?: boolean; error?: string } | undefined;

  if (complete) {
    const { error } = await supabase
      .from("businesses")
      .update({ onboarding_completed: true })
      .eq("id", businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const provisioned = await provisionVoiceForBusiness(businessId);
    if (provisioned.ok) {
      voice = {
        assistant_id: provisioned.assistantId,
        phone_linked: provisioned.phoneLinked,
      };
    } else {
      voice = { error: provisioned.error };
    }
  }

  return NextResponse.json({ ok: true, voice });
}