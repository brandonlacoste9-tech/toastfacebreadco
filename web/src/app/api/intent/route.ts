import { parseSalonBookingIntentWithFallback } from "@/lib/intent/salon-intent-bridge";
import { getOllamaModel, isOllamaConfigured, ollamaHealth } from "@/lib/llm/ollama";
import { NextResponse } from "next/server";

export async function GET() {
  const configured = isOllamaConfigured();
  const health = configured ? await ollamaHealth() : { ok: false };

  return NextResponse.json({
    ollama: {
      configured,
      reachable: health.ok,
      model: getOllamaModel(),
      models: health.models ?? [],
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, force_llm, skip_llm } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const result = await parseSalonBookingIntentWithFallback(message, new Date(), {
      forceLlm: Boolean(force_llm),
      skipLlm: Boolean(skip_llm),
    });

    return NextResponse.json({
      intent: result.intent,
      source: result.source,
      ollama_configured: isOllamaConfigured(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}