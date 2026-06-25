import { buildJustBookMeAssistantPayload } from "@/lib/vapi/assistant-builder";
import { BRAND_NAME, BRAND_PRODUCT_SLUG } from "@/lib/site-config";
import {
  createAssistant,
  importTwilioPhoneNumber,
  listPhoneNumbers,
  updateAssistant,
  vapiFetch,
} from "@/lib/vapi/client";
import { isVapiConfigured } from "@/lib/vapi/config";
import type { BusinessVoiceContext } from "@/lib/vapi/prompt";
import { displayBusinessName, montrealTodayIso } from "@/lib/vapi/prompt-utils";
import { getSupabaseService } from "@/lib/supabase/server";
import {
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioPhoneNumber,
} from "@/lib/twilio/config";

export type VoiceProvisionResult =
  | { ok: true; assistantId: string; created: boolean; phoneLinked: boolean }
  | { ok: false; error: string };

function getServerUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/vapi/webhook`;
}

export async function loadBusinessVoiceContext(
  businessId: string
): Promise<BusinessVoiceContext | null> {
  const supabase = getSupabaseService();
  if (!supabase) return null;

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id, name, city, timezone, default_language, working_hours, forward_to_number, voice_greeting, voice_instructions, industry, ai_personality, bilingual_mode"
    )
    .eq("id", businessId)
    .single();

  if (!business) return null;

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_cents")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("name");

  return {
    name: displayBusinessName(business.name),
    city: business.city,
    defaultLanguage: business.default_language === "en" ? "en" : "fr",
    timezone: business.timezone || "America/Montreal",
    workingHours: business.working_hours as Record<string, unknown> | null,
    services: (services ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price_cents: s.price_cents,
    })),
    voiceGreeting: (business.voice_greeting as string | null) ?? null,
    voiceInstructions: (business.voice_instructions as string | null) ?? null,
    industry: (business.industry as string | null) ?? null,
    aiPersonality: (business.ai_personality as string | null) ?? "friendly",
    bilingualMode: Boolean(business.bilingual_mode),
  };
}

async function linkSharedPhoneToAssistant(
  businessId: string,
  assistantId: string,
  businessName: string
): Promise<boolean> {
  const twilioPhone = getTwilioPhoneNumber();
  const twilioSid = getTwilioAccountSid();
  const twilioToken = getTwilioAuthToken();
  if (!twilioPhone || !twilioSid || !twilioToken) return false;

  const phones = await listPhoneNumbers();
  const existing = Array.isArray(phones.data)
    ? phones.data.find((p) => p.number === twilioPhone)
    : null;

  if (existing?.id) {
    await vapiFetch(`/phone-number/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ assistantId, name: `${BRAND_NAME} ${businessName}` }),
    });
    return true;
  }

  const imported = await importTwilioPhoneNumber({
    provider: "twilio",
    number: twilioPhone,
    twilioAccountSid: twilioSid,
    twilioAuthToken: twilioToken,
    assistantId,
    name: `${BRAND_NAME} ${businessName}`,
  });

  return Boolean(imported.data?.id);
}

/** Create or update this business's Vapi assistant from DB data. */
export async function provisionVoiceForBusiness(businessId: string): Promise<VoiceProvisionResult> {
  if (!isVapiConfigured()) {
    return { ok: false, error: "Vapi not configured" };
  }

  const supabase = getSupabaseService();
  if (!supabase) return { ok: false, error: "Database not configured" };

  const ctx = await loadBusinessVoiceContext(businessId);
  if (!ctx) return { ok: false, error: "Business not found" };

  const { data: business } = await supabase
    .from("businesses")
    .select("vapi_assistant_id, name, phone_number, forward_to_number")
    .eq("id", businessId)
    .single();

  const transferNumber =
    business?.forward_to_number?.trim() ||
    process.env.VAPI_TRANSFER_NUMBER?.trim() ||
    null;

  const payload = {
    ...buildJustBookMeAssistantPayload({
      business: ctx,
      serverUrl: getServerUrl(),
      transferNumber,
      businessId,
    }),
    metadata: {
      product: BRAND_PRODUCT_SLUG,
      business_id: businessId,
      business_name: ctx.name,
      provisioned_at: new Date().toISOString(),
      today_montreal: montrealTodayIso(),
    },
  };

  let assistantId = business?.vapi_assistant_id ?? null;
  let created = false;

  if (assistantId) {
    const { error } = await updateAssistant(assistantId, payload);
    if (error) {
      assistantId = null;
    }
  }

  if (!assistantId) {
    const { data, error } = await createAssistant(payload);
    if (error || !data?.id) {
      return { ok: false, error: error ?? "Failed to create Vapi assistant" };
    }
    assistantId = data.id;
    created = true;
  }

  const twilioPhone = getTwilioPhoneNumber();
  const updates: Record<string, string> = { vapi_assistant_id: assistantId };
  if (twilioPhone && !business?.phone_number) {
    updates.phone_number = twilioPhone;
  }

  await supabase.from("businesses").update(updates).eq("id", businessId);

  const phoneLinked = await linkSharedPhoneToAssistant(businessId, assistantId, ctx.name);

  return { ok: true, assistantId, created, phoneLinked };
}