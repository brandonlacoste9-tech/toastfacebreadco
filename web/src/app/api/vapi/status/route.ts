import {
  getVapiAssistantId,
  getVapiDefaultBusinessId,
  getVapiPublicKey,
  isVapiConfigured,
} from "@/lib/vapi/config";
import { listAssistants, listPhoneNumbers } from "@/lib/vapi/client";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isVapiConfigured()) {
    return NextResponse.json({
      configured: false,
      public_key_set: Boolean(getVapiPublicKey()),
    });
  }

  const [assistants, phones] = await Promise.all([listAssistants(), listPhoneNumbers()]);

  return NextResponse.json({
    configured: true,
    public_key_set: Boolean(getVapiPublicKey()),
    assistant_id: getVapiAssistantId() ?? undefined,
    default_business_id: getVapiDefaultBusinessId() ?? undefined,
    api_reachable: !assistants.error && assistants.status === 200,
    assistant_count: Array.isArray(assistants.data) ? assistants.data.length : 0,
    phone_count: Array.isArray(phones.data) ? phones.data.length : 0,
    webhook_path: "/api/vapi/webhook",
    error: assistants.error ?? phones.error ?? undefined,
  });
}