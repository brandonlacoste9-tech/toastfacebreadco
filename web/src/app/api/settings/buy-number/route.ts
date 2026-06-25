import { getApiUser } from "@/lib/auth/api-auth";
import { getTwilioAccountSid, getTwilioAuthToken } from "@/lib/twilio/config";
import { buyNumber, searchAvailableNumbers } from "@/lib/twilio/client";
import { importTwilioPhoneNumber } from "@/lib/vapi/client";
import { BRAND_NAME } from "@/lib/site-config";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  try {
    const { areaCode } = await req.json();
    if (!areaCode || typeof areaCode !== "string" || areaCode.length !== 3) {
      return NextResponse.json({ error: "Invalid area code." }, { status: 400 });
    }

    const twilioSid = getTwilioAccountSid();
    const twilioToken = getTwilioAuthToken();
    if (!twilioSid || !twilioToken) {
      return NextResponse.json({ error: "Twilio credentials not configured." }, { status: 503 });
    }

    // 1. Check if business already has an assistant
    const { data: business } = await supabase
      .from("businesses")
      .select("vapi_assistant_id, name")
      .eq("id", businessId)
      .single();

    if (!business?.vapi_assistant_id) {
      return NextResponse.json(
        { error: "Voice assistant not yet provisioned. Complete onboarding first." },
        { status: 400 }
      );
    }

    // 2. Search for available numbers
    const available = await searchAvailableNumbers(areaCode, "CA");
    if (!available || available.length === 0) {
      return NextResponse.json(
        { error: `No numbers available for area code ${areaCode}. Try another.` },
        { status: 404 }
      );
    }
    const targetNumber = available[0].phoneNumber;

    // 3. Buy the number via Twilio
    const smsUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/api/twilio/webhook`;
    const purchased = await buyNumber(targetNumber, smsUrl);
    if (!purchased || !purchased.phoneNumber) {
      return NextResponse.json({ error: "Failed to purchase number." }, { status: 500 });
    }

    // 4. Link the new number to Vapi assistant
    const imported = await importTwilioPhoneNumber({
      provider: "twilio",
      number: purchased.phoneNumber,
      twilioAccountSid: twilioSid,
      twilioAuthToken: twilioToken,
      assistantId: business.vapi_assistant_id,
      name: `${BRAND_NAME} ${business.name}`,
    });

    if (!imported.data?.id) {
      return NextResponse.json(
        { error: "Number purchased but failed to link to Vapi. Contact support." },
        { status: 500 }
      );
    }

    // 5. Update the business in the database
    const { error: dbError } = await supabase
      .from("businesses")
      .update({ phone_number: purchased.phoneNumber })
      .eq("id", businessId);

    if (dbError) {
      console.error("[buy-number] DB Update Error:", dbError);
    }

    return NextResponse.json({ ok: true, phone_number: purchased.phoneNumber });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "An unknown error occurred.";
    console.error("[buy-number]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
