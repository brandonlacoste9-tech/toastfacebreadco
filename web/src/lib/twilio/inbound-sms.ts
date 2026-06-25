import { parseSalonBookingIntentWithFallback } from "@/lib/intent/salon-intent-bridge";
import {
  cancelAppointmentByReply,
  confirmAppointmentByReply,
  findUpcomingAppointment,
  formatWhen,
  isCancelReply,
  isConfirmReply,
} from "@/lib/twilio/booking-reply";
import { BRAND_NAME } from "@/lib/site-config";
import { getSupabaseService } from "@/lib/supabase/server";
import { createAppointment, loadBusinessContext, resolveBusinessId } from "@/lib/vapi/booking-service";
import { getVapiDefaultBusinessId } from "@/lib/vapi/config";
import { getTwilioAuthToken } from "@/lib/twilio/config";
import twilio from "twilio";

export type InboundSmsPayload = {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export function verifyTwilioSignature(
  reqUrl: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  const token = getTwilioAuthToken();
  if (!token || !signature) return process.env.NODE_ENV !== "production";
  return twilio.validateRequest(token, signature, reqUrl, params);
}

async function logSmsConversation(args: {
  businessId: string;
  fromNumber: string;
  messageSid: string;
  body: string;
  outcome: string;
  summary: string;
  appointmentId?: string;
}) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  await supabase.from("conversations").insert({
    business_id: args.businessId,
    channel: "sms",
    external_call_id: args.messageSid,
    from_number: args.fromNumber,
    started_at: new Date().toISOString(),
    ended_at: new Date().toISOString(),
    outcome: args.outcome,
    transcript: args.body,
    summary: args.summary,
    appointment_id: args.appointmentId ?? null,
  });
}

function formatReply(locale: "fr" | "en", lines: string[]): string {
  return lines.join("\n").slice(0, 1500);
}

function startIsoFromIntent(startIso: string | null): string | null {
  if (!startIso) return null;
  const d = new Date(startIso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function handleInboundSms(payload: InboundSmsPayload): Promise<string> {
  const from = normalizePhone(payload.From);
  const body = payload.Body?.trim() ?? "";
  const lower = body.toLowerCase();

  const businessId = await resolveBusinessId({
    phoneNumber: payload.To,
    defaultBusinessId: getVapiDefaultBusinessId(),
  });

  if (!businessId) {
    return formatReply("fr", [
      "Désolé, ce numéro n'est pas configuré. Appelez-nous directement.",
    ]);
  }

  const supabase = getSupabaseService();
  let business: {
    name: string;
    default_language: string;
    voice_instructions: string | null;
  } | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("businesses")
      .select("name, default_language, voice_instructions")
      .eq("id", businessId)
      .single();
    business = data;
  }

  const locale = business?.default_language === "en" ? "en" : "fr";
  const businessName = business?.name ?? BRAND_NAME;

  const ctx = await loadBusinessContext(businessId);
  const services = (ctx?.services ?? []).map((s) => ({ id: s.id, name: s.name }));

  if (/\b(stop|arret|arrêt|unsubscribe)\b/i.test(lower)) {
    return formatReply(locale, [
      locale === "fr"
        ? "Vous ne recevrez plus de SMS de notre part. Répondez START pour vous réinscrire."
        : "You've been unsubscribed. Reply START to receive texts again.",
    ]);
  }

  if (/\b(start|subscribe)\b/i.test(lower) && body.length < 16) {
    return formatReply(locale, [
      locale === "fr"
        ? `Merci! Écrivez-nous pour réserver chez ${businessName}. Ex: « Coupe demain 14h » ou « Réparer mon évier vendredi »`
        : `Thanks! Text us to book at ${businessName}. Try: "Haircut tomorrow at 2pm" or "Fix my sink Friday"`,
    ]);
  }

  if (isCancelReply(body) || isConfirmReply(body)) {
    const appt = await findUpcomingAppointment(businessId, from);
    if (appt) {
      const when = formatWhen(appt.starts_at, locale);
      if (isCancelReply(body)) {
        const ok = await cancelAppointmentByReply(businessId, appt.id);
        await logSmsConversation({
          businessId,
          fromNumber: from,
          messageSid: payload.MessageSid,
          body,
          outcome: ok ? "other" : "other",
          summary: ok ? `SMS cancel: ${appt.customer_name}` : "Cancel failed",
          appointmentId: appt.id,
        });
        return formatReply(locale, [
          ok
            ? locale === "fr"
              ? `Votre rendez-vous du ${when} est annulé.`
              : `Your appointment on ${when} has been canceled.`
            : locale === "fr"
              ? "Impossible d'annuler — appelez-nous."
              : "Could not cancel — please call us.",
        ]);
      }

      const ok = await confirmAppointmentByReply(businessId, appt.id);
      await logSmsConversation({
        businessId,
        fromNumber: from,
        messageSid: payload.MessageSid,
        body,
        outcome: "booked",
        summary: ok ? `SMS confirm: ${appt.customer_name}` : "Confirm failed",
        appointmentId: appt.id,
      });
      return formatReply(locale, [
        ok
          ? locale === "fr"
            ? `Parfait! Rendez-vous confirmé pour ${when}.`
            : `Great — you're confirmed for ${when}.`
          : locale === "fr"
            ? "Impossible de confirmer — appelez-nous."
            : "Could not confirm — please call us.",
      ]);
    }
  }

  const { intent } = await parseSalonBookingIntentWithFallback(body, new Date(), { services });

  if (!intent || intent.action === "none") {
    await logSmsConversation({
      businessId,
      fromNumber: from,
      messageSid: payload.MessageSid,
      body,
      outcome: "other",
      summary: "General SMS inquiry",
    });

    const customNote = business?.voice_instructions?.trim();
    const extra = customNote
      ? locale === "fr"
        ? `\n\n${customNote.slice(0, 200)}`
        : `\n\n${customNote.slice(0, 200)}`
      : "";

    return formatReply(locale, [
      locale === "fr"
        ? `Bonjour! C'est ${businessName}. Comment puis-je vous aider? Pour réserver, écrivez votre besoin et l'heure (ex: « Coupe vendredi 10h », « Évier à réparer lundi »). Écrivez « humain » pour parler à l'équipe.${extra}`
        : `Hi, this is ${businessName}. How can I help you today? To book, text what you need and when — e.g. "Haircut Friday at 10am" or "Fix my sink Monday". Text HUMAN to reach our team.${extra}`,
    ]);
  }

  if (intent.action === "transfer.human") {
    await supabase?.from("leads").insert({
      business_id: businessId,
      contact_name: "SMS",
      contact_phone: from,
      source: "sms",
      pipeline_stage: "new",
      notes: body,
    });

    await logSmsConversation({
      businessId,
      fromNumber: from,
      messageSid: payload.MessageSid,
      body,
      outcome: "lead_captured",
      summary: intent.summary,
    });

    return formatReply(locale, [
      locale === "fr"
        ? `Merci! L'équipe de ${businessName} vous rappellera bientôt.`
        : `Got it — someone from ${businessName} will call you back shortly.`,
    ]);
  }

  if (intent.action === "booking.create" && intent.status === "executed") {
    const startsAt = startIsoFromIntent(intent.startIso);
    if (startsAt) {
      const result = await createAppointment({
        businessId,
        customer_name: locale === "fr" ? "Client SMS" : "SMS Client",
        customer_phone: from,
        service_name: intent.serviceLabel ?? undefined,
        starts_at: startsAt,
        locale: intent.locale,
      });

      if (result.ok) {
        await logSmsConversation({
          businessId,
          fromNumber: from,
          messageSid: payload.MessageSid,
          body,
          outcome: "booked",
          summary: intent.summary,
          appointmentId: result.appointment_id,
        });

        return formatReply(locale, [
          locale === "fr"
            ? `C'est confirmé! ${result.label}. Un SMS de confirmation vous a été envoyé.`
            : `You're all set for ${result.label}. We'll text you a confirmation shortly.`,
        ]);
      }
    }
  }

  if (intent.action === "booking.create" || intent.action === "booking.reschedule") {
    await supabase?.from("leads").insert({
      business_id: businessId,
      contact_name: "SMS",
      contact_phone: from,
      source: "sms",
      pipeline_stage: "new",
      notes: intent.summary,
    });

    await logSmsConversation({
      businessId,
      fromNumber: from,
      messageSid: payload.MessageSid,
      body,
      outcome: "lead_captured",
      summary: intent.summary,
    });

    return formatReply(locale, [
      locale === "fr"
        ? `Merci! ${intent.summary} Répondez avec la date/heure manquante ou appelez-nous pour finaliser.`
        : `Thanks! ${intent.summary} Reply with the missing details, or give us a call to finish booking.`,
    ]);
  }

  await logSmsConversation({
    businessId,
    fromNumber: from,
    messageSid: payload.MessageSid,
    body,
    outcome: "other",
    summary: intent.summary,
  });

  return formatReply(locale, [
    locale === "fr"
      ? `Merci pour votre message. ${intent.summary}`
      : `Thanks for reaching out. ${intent.summary}`,
  ]);
}

export function twimlReply(message: string): string {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
}