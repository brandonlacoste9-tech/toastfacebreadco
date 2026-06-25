import {
  handleInboundSms,
  twimlReply,
  verifyTwilioSignature,
} from "@/lib/twilio/inbound-sms";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const raw = await req.text();
  const params = Object.fromEntries(new URLSearchParams(raw));
  const signature = req.headers.get("x-twilio-signature");

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const webhookUrl = `${siteUrl}/api/sms/inbound`;

  if (!verifyTwilioSignature(webhookUrl, params, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const reply = await handleInboundSms({
    From: params.From ?? "",
    To: params.To ?? "",
    Body: params.Body ?? "",
    MessageSid: params.MessageSid ?? "",
  });

  return new NextResponse(twimlReply(reply), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}