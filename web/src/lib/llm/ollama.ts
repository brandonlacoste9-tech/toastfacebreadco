const DEFAULT_BASE = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "gemma4";
const TIMEOUT_MS = 45_000;

export function getOllamaBaseUrl(): string | null {
  const url = process.env.OLLAMA_BASE_URL?.trim();
  if (url === "false" || url === "0") return null;
  return url || DEFAULT_BASE;
}

export function getOllamaModel(): string {
  return process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;
}

export function isOllamaConfigured(): boolean {
  return Boolean(getOllamaBaseUrl());
}

export async function ollamaHealth(): Promise<{ ok: boolean; models?: string[] }> {
  const base = getOllamaBaseUrl();
  if (!base) return { ok: false };

  try {
    const res = await fetch(`${base}/api/tags`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { models?: { name: string }[] };
    return {
      ok: true,
      models: data.models?.map((m) => m.name) ?? [],
    };
  } catch {
    return { ok: false };
  }
}

type ChatMessage = { role: "system" | "user"; content: string };

export async function ollamaChat(
  messages: ChatMessage[],
  options?: { format?: "json"; model?: string }
): Promise<string | null> {
  const base = getOllamaBaseUrl();
  if (!base) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options?.model ?? getOllamaModel(),
        messages,
        stream: false,
        ...(options?.format ? { format: options.format } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}