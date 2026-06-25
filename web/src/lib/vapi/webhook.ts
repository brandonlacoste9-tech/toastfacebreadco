import {
  captureLead,
  checkAvailability,
  createAppointment,
  resolveBusinessId,
} from "@/lib/vapi/booking-service";
import {
  finalizeCall,
  linkAppointmentToCall,
  upsertCallStarted,
} from "@/lib/vapi/conversations";
import type { VapiToolName } from "@/lib/vapi/tool-schemas";
import { getVapiDefaultBusinessId, getVapiWebhookSecret } from "@/lib/vapi/config";
import { incrementUsage } from "@/lib/usage/increment-usage";

type RawToolCall = {
  id: string;
  name?: string;
  parameters?: Record<string, unknown>;
  arguments?: Record<string, unknown> | string;
  function?: {
    name?: string;
    arguments?: string | Record<string, unknown>;
    parameters?: Record<string, unknown>;
  };
};

type ToolCallItem = {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
};

type VapiCall = {
  id?: string;
  assistantId?: string;
  startedAt?: string;
  endedAt?: string;
  customer?: { number?: string };
  phoneNumber?: { number?: string };
};

type VapiWebhookBody = {
  message?: {
    type?: string;
    status?: string;
    call?: VapiCall;
    phoneNumber?: { number?: string };
    toolCallList?: RawToolCall[];
    toolWithToolCallList?: Array<{
      name?: string;
      function?: { name?: string };
      toolCall?: {
        id: string;
        parameters?: Record<string, unknown>;
        function?: { name?: string; arguments?: string | Record<string, unknown> };
      };
    }>;
    artifact?: {
      transcript?: string;
      messages?: Array<{ role?: string; message?: string }>;
    };
    analysis?: { summary?: string };
    endedReason?: string;
    assistant?: { id?: string };
  };
};

export function verifyVapiWebhook(req: Request): boolean {
  const secret = getVapiWebhookSecret();
  if (!secret) return true;
  const header = req.headers.get("x-vapi-secret") ?? req.headers.get("authorization");
  if (!header) return false;
  return header === secret || header === `Bearer ${secret}`;
}

function parseToolParameters(
  raw?: Record<string, unknown> | string | null
): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return raw;
}

function pickParams(...sources: Array<Record<string, unknown> | string | null | undefined>) {
  for (const source of sources) {
    const parsed = parseToolParameters(source ?? null);
    if (Object.keys(parsed).length > 0) return parsed;
  }
  return {};
}

function normalizeToolCall(raw: RawToolCall): ToolCallItem | null {
  const id = raw.id;
  const name = raw.name ?? raw.function?.name;
  if (!id || !name) return null;

  const params = pickParams(
    raw.parameters,
    raw.arguments,
    raw.function?.parameters,
    raw.function?.arguments
  );

  return { id, name, parameters: params };
}

function extractToolCalls(body: VapiWebhookBody): ToolCallItem[] {
  const msg = body.message;
  if (!msg) return [];

  const fromList = (msg.toolCallList ?? [])
    .map(normalizeToolCall)
    .filter((t): t is ToolCallItem => Boolean(t));

  if (fromList.length) return fromList;

  if (msg.toolWithToolCallList?.length) {
    return msg.toolWithToolCallList
      .map((t) => {
        const tc = t.toolCall;
        if (!tc?.id) return null;
        const name = t.name ?? t.function?.name ?? tc.function?.name ?? t.toolCall?.function?.name;
        if (!name) return null;
        return {
          id: tc.id,
          name,
          parameters: pickParams(tc.parameters, tc.function?.arguments),
        };
      })
      .filter((t): t is ToolCallItem => Boolean(t));
  }

  return [];
}

function getCallMeta(msg: VapiWebhookBody["message"]) {
  const call = msg?.call;
  return {
    externalCallId: call?.id ?? null,
    assistantId: call?.assistantId ?? msg?.assistant?.id ?? null,
    fromNumber: call?.customer?.number ?? null,
    inboundNumber: msg?.phoneNumber?.number ?? call?.phoneNumber?.number ?? null,
    startedAt: call?.startedAt ?? null,
    endedAt: call?.endedAt ?? null,
  };
}

async function resolveBusinessFromMessage(msg: VapiWebhookBody["message"]) {
  const { inboundNumber, assistantId } = getCallMeta(msg);
  return resolveBusinessId({
    phoneNumber: inboundNumber,
    assistantId,
    defaultBusinessId: getVapiDefaultBusinessId(),
  });
}

function durationSeconds(startedAt?: string | null, endedAt?: string | null): number | null {
  if (!startedAt || !endedAt) return null;
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return ms > 0 ? Math.round(ms / 1000) : null;
}

export async function handleVapiStatusUpdate(body: VapiWebhookBody) {
  const msg = body.message;
  if (!msg || msg.status !== "in-progress") return;

  const businessId = await resolveBusinessFromMessage(msg);
  const { externalCallId, fromNumber, startedAt } = getCallMeta(msg);
  if (!businessId || !externalCallId) return;

  await upsertCallStarted({
    businessId,
    externalCallId,
    fromNumber,
    startedAt,
  });
}

export async function handleVapiToolCalls(body: VapiWebhookBody) {
  const calls = extractToolCalls(body);
  const businessId = await resolveBusinessFromMessage(body.message);
  const { externalCallId } = getCallMeta(body.message);

  if (externalCallId && businessId) {
    await upsertCallStarted({
      businessId,
      externalCallId,
      fromNumber: getCallMeta(body.message).fromNumber,
      startedAt: getCallMeta(body.message).startedAt,
    });
  }

  if (!businessId) {
    return {
      results: calls.map((c) => ({
        toolCallId: c.id,
        result: JSON.stringify({ error: "Business not configured for this number" }),
      })),
    };
  }

  const results = [];
  for (const call of calls) {
    const params = call.parameters ?? {};
    let result: unknown;

    try {
      switch (call.name as VapiToolName) {
        case "check_availability":
          result = await checkAvailability({
            businessId,
            service_id: params.service_id as string | undefined,
            service_name: params.service_name as string | undefined,
            preferred_date: String(params.preferred_date ?? ""),
            preferred_time: params.preferred_time as string | undefined,
            locale: (params.locale as "fr" | "en") ?? "fr",
          });
          break;
        case "create_appointment": {
          result = await createAppointment({
            businessId,
            customer_name: String(params.customer_name ?? ""),
            customer_phone: String(params.customer_phone ?? ""),
            service_id: params.service_id as string | undefined,
            service_name: params.service_name as string | undefined,
            starts_at: String(params.starts_at ?? ""),
            locale: (params.locale as "fr" | "en") ?? "fr",
          });
          if (
            result &&
            typeof result === "object" &&
            "ok" in result &&
            result.ok &&
            externalCallId &&
            "appointment_id" in result
          ) {
            await linkAppointmentToCall({
              businessId,
              externalCallId,
              appointmentId: String(result.appointment_id),
              recoveredRevenueCents:
                "price_cents" in result && typeof result.price_cents === "number"
                  ? result.price_cents
                  : null,
            });
          }
          break;
        }
        case "capture_lead":
          result = await captureLead({
            businessId,
            phone: String(params.phone ?? ""),
            name: params.name as string | undefined,
            intent: String(params.intent ?? "Voice inquiry"),
            locale: (params.locale as "fr" | "en") ?? "fr",
            urgency: params.urgency as "high" | "medium" | "low" | undefined,
            service_needed: params.service_needed as string | undefined,
            diagnostic_data: params.diagnostic_data as string | undefined,
          });
          break;
        default:
          result = { error: `Unknown tool: ${call.name}` };
      }
    } catch (e) {
      result = { error: e instanceof Error ? e.message : "Tool execution failed" };
    }

    results.push({
      toolCallId: call.id,
      result: typeof result === "string" ? result : JSON.stringify(result),
    });
  }

  return { results };
}

export async function handleVapiEndOfCall(body: VapiWebhookBody) {
  const msg = body.message;
  if (!msg) return;

  const businessId = await resolveBusinessFromMessage(msg);
  const { externalCallId, fromNumber, startedAt, endedAt } = getCallMeta(msg);
  if (!businessId || !externalCallId) return;

  const transcript =
    msg.artifact?.transcript ??
    msg.artifact?.messages
      ?.map((m) => `${m.role ?? "unknown"}: ${m.message ?? ""}`)
      .join("\n") ??
    null;

  const finalized = await finalizeCall({
    businessId,
    externalCallId,
    fromNumber,
    startedAt,
    endedAt,
    durationSeconds: durationSeconds(startedAt, endedAt),
    transcript,
    summary: msg.analysis?.summary ?? null,
    endedReason: msg.endedReason ?? null,
  });

  const duration = durationSeconds(startedAt, endedAt);
  if (
    finalized?.outcome === "dropped" &&
    fromNumber &&
    duration != null &&
    duration < 45
  ) {
    const { sendMissedCallRecovery } = await import("@/lib/twilio/missed-call-sms");
    await sendMissedCallRecovery({ businessId, fromNumber }).catch((e) =>
      console.error("[vapi] missed-call SMS:", e)
    );
  }

  if (duration != null && duration > 0) {
    const voiceMinutes = Math.ceil(duration / 60);
    await incrementUsage(businessId, { voiceMinutes });
  }
}