import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SetupChecklist } from "@/lib/onboarding/setup-checklist";
import { Check, Circle } from "lucide-react";
import Link from "next/link";

export function SetupChecklistCard({
  dict,
  checklist,
  bookUrl,
}: {
  dict: Dictionary;
  checklist: SetupChecklist;
  bookUrl: string | null;
}) {
  const t = dict.dashboard.setupChecklist;

  if (checklist.allDone) return null;

  const labels: Record<string, string> = {
    services: t.items.services,
    hours: t.items.hours,
    voice: t.items.voice,
    greeting: t.items.greeting,
    bookPage: t.items.bookPage,
  };

  return (
    <div className="card mt-8 border-[var(--accent)]/30 bg-[var(--accent-light)]/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">{t.label}</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[var(--foreground)]">
            {t.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.subtitle}</p>
        </div>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-sm font-medium text-[var(--foreground)]">
          {checklist.completed}/{checklist.total}
        </span>
      </div>

      <ul className="mt-5 space-y-3">
        {checklist.items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--surface)]/80"
            >
              {item.done ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--teal)] text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : (
                <Circle className="h-6 w-6 shrink-0 text-[var(--muted-fg)]" />
              )}
              <span
                className={
                  item.done
                    ? "text-sm text-[var(--muted-fg)] line-through"
                    : "text-sm font-medium text-[var(--foreground)]"
                }
              >
                {labels[item.id] ?? item.id}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {bookUrl && checklist.items.find((i) => i.id === "bookPage")?.done && (
        <p className="mt-4 text-sm text-[var(--muted-fg)]">
          {t.bookLink}{" "}
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
          >
            {bookUrl.replace(/^https?:\/\//, "")}
          </a>
        </p>
      )}
    </div>
  );
}