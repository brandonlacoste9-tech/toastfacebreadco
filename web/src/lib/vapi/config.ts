export function getVapiPrivateKey(): string | null {
  return process.env.VAPI_PRIVATE_KEY?.trim() || null;
}

export function getVapiPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.trim() || null;
}

export function getVapiAssistantId(): string | null {
  return process.env.VAPI_ASSISTANT_ID?.trim() || null;
}

export function getVapiWebhookSecret(): string | null {
  return process.env.VAPI_WEBHOOK_SECRET?.trim() || null;
}

export function getVapiDefaultBusinessId(): string | null {
  return process.env.VAPI_DEFAULT_BUSINESS_ID?.trim() || null;
}

export function getVapiTransferNumber(): string | null {
  return process.env.VAPI_TRANSFER_NUMBER?.trim() || null;
}

export function isVapiConfigured(): boolean {
  return Boolean(getVapiPrivateKey());
}