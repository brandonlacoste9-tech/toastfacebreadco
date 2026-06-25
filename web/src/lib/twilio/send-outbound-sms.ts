import { recordOutboundSms } from "@/lib/usage/increment-usage";
import { checkOutboundSmsAllowed } from "@/lib/usage/outbound-sms-guard";
import { sendSms, type SendSmsResult } from "@/lib/twilio/client";

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export type OutboundSmsResult =
  | { ok: true; sid: string }
  | { ok: false; error: string; blocked?: boolean };

/** Business-scoped outbound SMS with optional usage enforcement. */
export async function sendOutboundSms(
  businessId: string,
  to: string,
  body: string
): Promise<OutboundSmsResult> {
  const guard = await checkOutboundSmsAllowed(businessId);
  if (!guard.allowed) {
    return {
      ok: false,
      error: "SMS limit reached — outbound messages paused. Check Settings → Billing.",
      blocked: true,
    };
  }

  const result: SendSmsResult = await sendSms(toE164(to), body);
  if (!result.ok) return { ok: false, error: result.error };

  recordOutboundSms(businessId);
  return { ok: true, sid: result.sid };
}