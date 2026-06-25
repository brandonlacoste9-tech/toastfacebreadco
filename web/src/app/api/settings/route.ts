import { getApiUser } from "@/lib/auth/api-auth";
import { provisionVoiceForBusiness } from "@/lib/vapi/provision-service";
import { NextResponse } from "next/server";

type ServiceInput = {
  id?: string;
  name: string;
  duration_minutes?: number;
  price_cents?: number;
  active?: boolean;
};

export async function GET() {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      "name, city, default_language, working_hours, forward_to_number, voice_greeting, voice_instructions, industry, ai_personality, bilingual_mode"
    )
    .eq("id", businessId)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents, active")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");

  return NextResponse.json({
    business: {
      name: business.name,
      city: business.city,
      industry: business.industry,
      default_language: business.default_language,
      working_hours: business.working_hours ?? {},
      forward_to_number: business.forward_to_number,
      voice_greeting: business.voice_greeting,
      voice_instructions: business.voice_instructions,
    },
    services: services ?? [],
  });
}

export async function PATCH(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const body = await req.json();
  const {
    name,
    city,
    default_language,
    working_hours,
    forward_to_number,
    voice_greeting,
    voice_instructions,
    industry,
    services,
    ai_personality,
    bilingual_mode,
    sync_voice = true,
  } = body;

  const updates: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof city === "string") updates.city = city.trim() || null;
  if (typeof industry === "string") updates.industry = industry.trim() || null;
  if (default_language === "fr" || default_language === "en") {
    updates.default_language = default_language;
  }
  if (working_hours && typeof working_hours === "object") {
    updates.working_hours = working_hours;
  }
  if (typeof forward_to_number === "string") {
    updates.forward_to_number = forward_to_number.trim() || null;
  }
  if (voice_greeting !== undefined) {
    const g = typeof voice_greeting === "string" ? voice_greeting.trim() : "";
    updates.voice_greeting = g ? g.slice(0, 500) : null;
  }
  if (voice_instructions !== undefined) {
    const ins = typeof voice_instructions === "string" ? voice_instructions.trim() : "";
    updates.voice_instructions = ins ? ins.slice(0, 2000) : null;
  }
  if (ai_personality === "friendly" || ai_personality === "luxury" || ai_personality === "corporate") {
    updates.ai_personality = ai_personality;
  }
  if (typeof bilingual_mode === "boolean") {
    updates.bilingual_mode = bilingual_mode;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from("businesses").update(updates).eq("id", businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (Array.isArray(services)) {
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("business_id", businessId);

    const keptIds = new Set<string>();

    for (const svc of services as ServiceInput[]) {
      if (!svc.name?.trim()) continue;

      const row = {
        name: svc.name.trim(),
        duration_minutes: svc.duration_minutes ?? 60,
        price_cents: svc.price_cents ?? 0,
        active: svc.active !== false,
      };

      if (svc.id) {
        keptIds.add(svc.id);
        const { error } = await supabase
          .from("services")
          .update(row)
          .eq("id", svc.id)
          .eq("business_id", businessId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { data: created, error } = await supabase
          .from("services")
          .insert({ ...row, business_id: businessId })
          .select("id")
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (created?.id) keptIds.add(created.id);
      }
    }

    for (const old of existing ?? []) {
      if (!keptIds.has(old.id)) {
        await supabase
          .from("services")
          .update({ active: false })
          .eq("id", old.id)
          .eq("business_id", businessId);
      }
    }
  }

  let voice: { assistant_id?: string; error?: string } | undefined;
  if (sync_voice) {
    const provisioned = await provisionVoiceForBusiness(businessId);
    voice = provisioned.ok
      ? { assistant_id: provisioned.assistantId }
      : { error: provisioned.error };
  }

  return NextResponse.json({ ok: true, voice });
}