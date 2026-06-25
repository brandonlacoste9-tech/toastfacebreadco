"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function VoiceSettingsCard({
  dict,
  locale,
  assistantId,
  phoneNumber,
  platformPhone,
  initialGreeting,
  initialInstructions,
  initialPersonality,
  initialBilingual,
}: {
  dict: Dictionary;
  locale: string;
  assistantId: string | null;
  phoneNumber: string | null;
  platformPhone: string | null;
  initialGreeting: string | null;
  initialInstructions: string | null;
  initialPersonality: string;
  initialBilingual: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [greeting, setGreeting] = useState(initialGreeting ?? "");
  const [instructions, setInstructions] = useState(initialInstructions ?? "");
  const [personality, setPersonality] = useState(initialPersonality);
  const [bilingual, setBilingual] = useState(initialBilingual);

  const t = dict.dashboard.voice;
  const fr = locale === "fr";
  const line = phoneNumber || platformPhone;
  const ready = Boolean(assistantId);

  const defaultGreeting = fr
    ? `Bonjour, merci d'appeler {votre entreprise}. Comment puis-je vous aider aujourd'hui?`
    : `Hi, thanks for calling {your business}. How can I help you today?`;

  async function saveVoiceSettings(syncOnly = false) {
    setStatus("loading");
    setMessage(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        syncOnly
          ? { sync_voice: true }
          : {
              voice_greeting: greeting,
              voice_instructions: instructions,
              ai_personality: personality,
              bilingual_mode: bilingual,
              sync_voice: true,
            }
      ),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setMessage(data.error ?? t.saveError);
      return;
    }
    setStatus("done");
    setMessage(syncOnly ? t.syncDone : t.customSaved);
    router.refresh();
  }

  return (
    <div className="card mt-8 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)]">
          <Phone className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-[var(--foreground)]">{t.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.subtitle}</p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-4">
              <dt className="text-[var(--muted-fg)]">{t.status}</dt>
              <dd className="font-medium text-[var(--foreground)]">
                {ready ? t.statusReady : t.statusPending}
              </dd>
            </div>
            {line && (
              <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-4">
                <dt className="shrink-0 text-[var(--muted-fg)]">{t.line}</dt>
                <dd className="font-medium text-[var(--foreground)]">{line}</dd>
              </div>
            )}
            {assistantId && (
              <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                <dt className="text-[var(--muted-fg)]">{t.agentId}</dt>
                <dd className="break-all font-mono text-xs text-[var(--muted-fg)]">{assistantId}</dd>
              </div>
            )}
          </dl>

          <p className="mt-4 text-xs text-[var(--muted-fg)]">{t.sharedLineNote}</p>

          <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Customization</h3>
              <p className="mt-1 text-xs text-[var(--muted-fg)]">Configure how your AI assistant speaks and behaves.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">AI Personality</label>
                <p className="mb-2 text-xs text-[var(--muted-fg)]">Select the tone and pacing of your assistant.</p>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                >
                  <option value="friendly">Friendly & Casual (Default)</option>
                  <option value="luxury">Luxury Concierge (White-Glove)</option>
                  <option value="corporate">Corporate Professional (Direct)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Language Capabilities</label>
                <p className="mb-2 text-xs text-[var(--muted-fg)]">Enable native bilingual capabilities.</p>
                <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 cursor-pointer hover:bg-[var(--primary-light)] transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    checked={bilingual}
                    onChange={(e) => setBilingual(e.target.checked)}
                  />
                  <span className="text-sm text-[var(--foreground)]">Native Bilingual Mode (EN/FR)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">{t.customTitle}</h3>
              <p className="mt-1 text-xs text-[var(--muted-fg)]">{t.customSubtitle}</p>
            </div>

            <div>
              <label className="text-sm text-[var(--muted-fg)]">{t.greetingLabel}</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder={defaultGreeting}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-[var(--muted-fg)]">
                {t.greetingHint} ({greeting.length}/500)
              </p>
            </div>

            <div>
              <label className="text-sm text-[var(--muted-fg)]">{t.instructionsLabel}</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t.instructionsPlaceholder}
                maxLength={2000}
              />
              <p className="mt-1 text-xs text-[var(--muted-fg)]">
                {t.instructionsHint} ({instructions.length}/2000)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={status === "loading"}
                onClick={() => saveVoiceSettings(false)}
              >
                {status === "loading" ? t.saving : t.saveCustom}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={status === "loading"}
                onClick={() => saveVoiceSettings(true)}
              >
                {status === "loading" ? t.syncing : t.syncCta}
              </Button>
            </div>
          </div>

          {message && (
            <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-[var(--teal)]"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}