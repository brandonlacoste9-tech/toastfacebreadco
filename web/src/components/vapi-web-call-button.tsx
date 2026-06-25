"use client";

import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { PhoneCall, Mic, Loader2 } from "lucide-react";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "dd33bebc-4d35-43e2-8d2f-31cc3a750fca";

export function VapiWebCallButton({ 
  assistantOverrides 
}: { 
  assistantOverrides?: Record<string, unknown> 
}) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "loading" | "active">("idle");

  useEffect(() => {
    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    
    vapiInstance.on("call-start", () => setCallStatus("active"));
    vapiInstance.on("call-end", () => setCallStatus("idle"));
    vapiInstance.on("error", (e: unknown) => {
      console.error(e);
      setCallStatus("idle");
    });

    setVapi(vapiInstance);
    
    return () => {
      vapiInstance.removeAllListeners();
    };
  }, []);

  const toggleCall = async () => {
    if (callStatus === "active") {
      vapi?.stop();
    } else {
      setCallStatus("loading");
      
      const { 
        voiceGreeting, 
        voiceInstructions, 
        services,
        systemPrompt: customSystemPrompt,
        name,
        ...restOverrides 
      } = assistantOverrides || {};

      const finalSystemPrompt = customSystemPrompt || `
${voiceInstructions || "You are a helpful assistant."}

${services ? `Services available:\n${JSON.stringify(services, null, 2)}` : ""}
      `.trim();

      const assistant = {
        name: name as string || "Demo Assistant",
        firstMessage: voiceGreeting as string | undefined,
        firstMessageMode: "assistant-speaks-first",
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: finalSystemPrompt }],
        },
        voice: {
          provider: "openai",
          voiceId: "alloy",
        },
        ...restOverrides
      };

      try {
        // @ts-expect-error - Vapi SDK types conflict with loosely typed overrides
        await vapi?.start(assistant);
      } catch (err) {
        console.error("Failed to start call:", err);
        setCallStatus("idle");
      }
    }
  };

  return (
    <button
      onClick={toggleCall}
      disabled={!vapi || callStatus === "loading"}
      className={`flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-semibold transition-all shadow-xl ${
        callStatus === "active" 
          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
          : "bg-gradient-to-r from-[#d4af37] to-[#a38020] text-black hover:scale-105"
      }`}
    >
      {callStatus === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
      {callStatus === "idle" && <PhoneCall className="h-6 w-6" />}
      {callStatus === "active" && <Mic className="h-6 w-6" />}
      
      {callStatus === "loading" ? "Connecting..." : callStatus === "active" ? "End Call" : "Call the Concierge"}
    </button>
  );
}
