import { getApiUser } from "@/lib/auth/api-auth";
import { provisionVoiceForBusiness } from "@/lib/vapi/provision-service";
import { NextResponse } from "next/server";

export async function POST() {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;

  const result = await provisionVoiceForBusiness(auth.businessId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    assistant_id: result.assistantId,
    created: result.created,
    phone_linked: result.phoneLinked,
  });
}