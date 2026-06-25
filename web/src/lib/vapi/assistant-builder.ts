import { buildReceptionistSystemPrompt, type BusinessVoiceContext } from "@/lib/vapi/prompt";
import { resolveFirstMessage } from "@/lib/vapi/prompt-utils";
import { VAPI_TOOL_FUNCTIONS } from "@/lib/vapi/tool-schemas";
import { BRAND_NAME, BRAND_PRODUCT_SLUG } from "@/lib/site-config";
import { endCallMessage, getReceptionistVoice, transferMessage } from "@/lib/vapi/voice-config";
import { ensureE164 } from "@/lib/utils/phone";

export function buildJustBookMeAssistantPayload(opts: {
  business: BusinessVoiceContext;
  serverUrl: string;
  transferNumber?: string | null;
  businessId?: string;
}) {
  const systemPrompt = buildReceptionistSystemPrompt(opts.business);

  const modelTools: Record<string, unknown>[] = VAPI_TOOL_FUNCTIONS.map((fn) => ({
    type: "function",
    function: fn,
  }));

  const lang = opts.business.defaultLanguage;

  if (opts.transferNumber) {
    const formattedTransfer = ensureE164(opts.transferNumber);
    if (formattedTransfer) {
      modelTools.push({
        type: "transferCall",
        destinations: [
          {
            type: "number",
            number: formattedTransfer,
            message: transferMessage(lang),
          },
        ],
      });
    }
  }

  return {
    name: `${BRAND_NAME} — ${opts.business.name}`,
    firstMessage: resolveFirstMessage(
      opts.business.name,
      lang,
      opts.business.voiceGreeting
    ),
    firstMessageMode: "assistant-speaks-first",
    endCallMessage: endCallMessage(lang),
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "multi",
      smartFormat: true,
    },
    voice: getReceptionistVoice(lang),
    model: {
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt }],
      tools: modelTools,
    },
    server: {
      url: opts.serverUrl,
    },
    serverMessages: ["tool-calls", "end-of-call-report", "status-update"],
    analysisPlan: {
      summaryPlan: { enabled: true },
    },
    metadata: {
      product: BRAND_PRODUCT_SLUG,
      business_id: opts.businessId ?? null,
      business_name: opts.business.name,
    },
  };
}