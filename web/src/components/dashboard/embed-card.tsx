"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useState } from "react";

export function EmbedCard({
  dict,
  slug,
  siteUrl,
}: {
  dict: Dictionary;
  slug: string;
  siteUrl: string;
}) {
  const t = dict.dashboard.embed;
  const base = siteUrl.replace(/\/$/, "");
  const bookUrl = `${base}/book/${slug}`;
  const embedUrl = `${base}/embed/${slug}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="420" style="border:0;border-radius:12px;" title="${t.iframeTitle}"></iframe>`;
  const [copied, setCopied] = useState<"book" | "embed" | null>(null);

  async function copy(text: string, key: "book" | "embed") {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="card mt-8 w-full min-w-0 p-6">
      <h2 className="font-semibold text-[var(--foreground)]">{t.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.subtitle}</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-[var(--muted-fg)]">{t.bookingPage}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-[var(--primary)] hover:underline"
            >
              {bookUrl}
            </a>
            <button
              type="button"
              className="rounded-lg bg-[var(--muted)] px-2 py-1 text-xs font-medium"
              onClick={() => copy(bookUrl, "book")}
            >
              {copied === "book" ? t.copied : t.copy}
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[var(--muted-fg)]">{t.embedCode}</p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--foreground)]">
            {iframeCode}
          </pre>
          <button
            type="button"
            className="mt-2 rounded-lg bg-[var(--primary-light)] px-3 py-1.5 text-xs font-medium text-[var(--primary)]"
            onClick={() => copy(iframeCode, "embed")}
          >
            {copied === "embed" ? t.copied : t.copyEmbed}
          </button>
        </div>
      </div>
    </div>
  );
}