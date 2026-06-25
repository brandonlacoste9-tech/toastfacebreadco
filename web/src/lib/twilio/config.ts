/** Twilio REST API credentials — Account SID starts with AC, not US (User SID). */
export function getTwilioAccountSid(): string | null {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  if (!sid) return null;
  if (sid.startsWith("US")) {
    console.warn(
      "[twilio] TWILIO_ACCOUNT_SID looks like a User SID (US…). Use Account SID (AC…) from Console → Account Info."
    );
    return null;
  }
  if (!sid.startsWith("AC")) {
    console.warn("[twilio] TWILIO_ACCOUNT_SID should start with AC");
  }
  return sid;
}

export function getTwilioAuthToken(): string | null {
  return process.env.TWILIO_AUTH_TOKEN?.trim() || null;
}

export function getTwilioApiKeySid(): string | null {
  const sid = process.env.TWILIO_API_KEY_SID?.trim();
  if (!sid?.startsWith("SK")) return sid || null;
  return sid;
}

export function getTwilioApiKeySecret(): string | null {
  return process.env.TWILIO_API_KEY_SECRET?.trim() || null;
}

export function hasTwilioApiKey(): boolean {
  return Boolean(getTwilioApiKeySid() && getTwilioApiKeySecret());
}

export function getTwilioMessagingServiceSid(): string | null {
  return process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() || null;
}

export function getTwilioPhoneNumber(): string | null {
  return process.env.TWILIO_PHONE_NUMBER?.trim() || null;
}

export function hasTwilioCredentials(): boolean {
  const sid = getTwilioAccountSid();
  if (!sid) return false;
  return Boolean(getTwilioAuthToken() || hasTwilioApiKey());
}

export function isTwilioConfigured(): boolean {
  const from = getTwilioMessagingServiceSid() || getTwilioPhoneNumber();
  return Boolean(hasTwilioCredentials() && from);
}