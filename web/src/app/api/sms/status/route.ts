import {
  getTwilioAccountSid,
  getTwilioMessagingServiceSid,
  getTwilioPhoneNumber,
  hasTwilioApiKey,
  hasTwilioCredentials,
  isTwilioConfigured,
} from "@/lib/twilio/config";
import { NextResponse } from "next/server";

export async function GET() {
  const accountSid = getTwilioAccountSid();
  const hasToken = Boolean(process.env.TWILIO_AUTH_TOKEN?.trim());
  const from = getTwilioMessagingServiceSid() || getTwilioPhoneNumber();

  return NextResponse.json({
    configured: isTwilioConfigured(),
    credentials_ready: hasTwilioCredentials(),
    account_sid_set: Boolean(accountSid),
    account_sid_valid_prefix: accountSid?.startsWith("AC") ?? false,
    auth_token_set: hasToken,
    api_key_set: hasTwilioApiKey(),
    from_set: Boolean(from),
    messaging_service: Boolean(getTwilioMessagingServiceSid()),
    phone_number: Boolean(getTwilioPhoneNumber()),
    phone_number_sid: Boolean(process.env.TWILIO_PHONE_NUMBER_SID?.trim()),
    hint:
      !accountSid && process.env.TWILIO_ACCOUNT_SID?.trim()?.startsWith("US")
        ? "Use Account SID (AC…) from Twilio Console → Account Info, not User SID (US…)."
        : undefined,
  });
}