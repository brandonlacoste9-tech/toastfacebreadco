import {
  getTwilioAccountSid,
  getTwilioApiKeySecret,
  getTwilioApiKeySid,
  getTwilioAuthToken,
  getTwilioMessagingServiceSid,
  getTwilioPhoneNumber,
  hasTwilioCredentials,
  isTwilioConfigured,
} from "@/lib/twilio/config";
import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = getTwilioAccountSid();
  if (!accountSid || !hasTwilioCredentials()) return null;

  const authToken = getTwilioAuthToken();
  if (authToken) return twilio(accountSid, authToken);

  const apiKeySid = getTwilioApiKeySid();
  const apiKeySecret = getTwilioApiKeySecret();
  if (apiKeySid && apiKeySecret) {
    return twilio(apiKeySid, apiKeySecret, { accountSid });
  }

  return null;
}

export type SendSmsResult =
  | { ok: true; sid: string }
  | { ok: false; error: string };

export async function sendSms(to: string, body: string): Promise<SendSmsResult> {
  if (!isTwilioConfigured()) {
    return { ok: false, error: "Twilio not configured" };
  }

  const client = getTwilioClient();
  if (!client) {
    return { ok: false, error: "Invalid Twilio credentials" };
  }

  const messagingServiceSid = getTwilioMessagingServiceSid();
  const fromNumber = getTwilioPhoneNumber();

  try {
    const message = await client.messages.create({
      to,
      body,
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: fromNumber! }),
    });
    return { ok: true, sid: message.sid };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMS send failed";
    return { ok: false, error: msg };
  }
}

export async function searchAvailableNumbers(areaCode: string, countryCode = "CA") {
  const client = getTwilioClient();
  if (!client) throw new Error("Twilio client not initialized");

  const numbers = await client.availablePhoneNumbers(countryCode).local.list({
    areaCode: parseInt(areaCode, 10),
    limit: 5,
  });

  return numbers.map((n) => ({
    phoneNumber: n.phoneNumber,
    friendlyName: n.friendlyName,
    locality: n.locality,
    region: n.region,
  }));
}

export async function buyNumber(phoneNumber: string, smsUrl: string) {
  const client = getTwilioClient();
  if (!client) throw new Error("Twilio client not initialized");

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber,
    smsUrl,
    smsMethod: "POST",
  });

  return purchased;
}