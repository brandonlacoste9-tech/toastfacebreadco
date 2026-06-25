import { getSupabaseService } from "@/lib/supabase/server";
import { sendOutboundSms } from "@/lib/twilio/send-outbound-sms";

export async function sendMissedCallRecovery(opts: {
  businessId: string;
  fromNumber: string;
  locale?: "fr" | "en";
}): Promise<{ ok: boolean }> {
  const phone = opts.fromNumber?.trim();
  if (!phone) return { ok: false };

  const supabase = getSupabaseService();
  if (!supabase) return { ok: false };

  const { data: business } = await supabase
    .from("businesses")
    .select("name, default_language")
    .eq("id", opts.businessId)
    .single();

  const locale =
    opts.locale ?? (business?.default_language === "en" ? "en" : "fr");
  const name = business?.name ?? "us";

  const body =
    locale === "fr"
      ? `Bonjour! Vous avez appelé ${name} — on a manqué votre appel. Répondez à ce SMS pour réserver ou écrivez HUMAN pour qu'on vous rappelle.`
      : `Hi! You called ${name} — we missed you. Reply to this text to book, or text HUMAN and we'll call you back.`;

  const result = await sendOutboundSms(opts.businessId, phone, body);
  if (!result.ok) return { ok: false };

  await supabase.from("leads").insert({
    business_id: opts.businessId,
    contact_name: "Missed call",
    contact_phone: phone,
    source: "missed_call",
    pipeline_stage: "new",
    notes: "Auto SMS after dropped call",
  });

  return { ok: true };
}