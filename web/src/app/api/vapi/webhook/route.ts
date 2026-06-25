import { getVapiTransferNumber, isVapiConfigured } from "@/lib/vapi/config";
import {
  handleVapiEndOfCall,
  handleVapiStatusUpdate,
  handleVapiToolCalls,
  verifyVapiWebhook,
} from "@/lib/vapi/webhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!isVapiConfigured()) {
    return NextResponse.json({ error: "Vapi not configured" }, { status: 503 });
  }

  if (!verifyVapiWebhook(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.message?.type) {
    return NextResponse.json({ ok: true });
  }

  const type = body.message.type as string;

  if (type === "status-update") {
    await handleVapiStatusUpdate(body);
    return NextResponse.json({ ok: true });
  }

  if (type === "tool-calls") {
    const response = await handleVapiToolCalls(body);
    return NextResponse.json(response);
  }

  if (type === "transfer-destination-request") {
    const number = getVapiTransferNumber();
    if (number) {
      return NextResponse.json({
        destination: { type: "number", number },
        message: "Je vous transfère — un instant.",
      });
    }
    return NextResponse.json({ error: "No transfer number configured" });
  }

  if (type === "end-of-call-report") {
    await handleVapiEndOfCall(body);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}