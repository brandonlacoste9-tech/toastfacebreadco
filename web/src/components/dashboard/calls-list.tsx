"use client";

import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { MessageSquare, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type DashboardCall = {
  id: string;
  channel: string;
  from_number: string | null;
  started_at: string;
  duration_seconds: number | null;
  outcome: string;
  summary: string | null;
  transcript: string | null;
  recovered_revenue_cents: number | null;
};

const OUTCOME_STYLES: Record<string, string> = {
  booked: "bg-[var(--primary-light)] text-[var(--primary)]",
  lead_captured: "bg-[var(--teal-light)] text-[var(--teal)]",
  transferred: "bg-[var(--accent-light)] text-[var(--accent-hover)]",
  dropped: "bg-red-50 text-red-700",
  other: "bg-[var(--muted)] text-[var(--muted-fg)]",
};

export function CallsList({
  dict,
  calls,
  locale,
}: {
  dict: Dictionary;
  calls: DashboardCall[];
  locale: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function deleteCall(id: string) {
    const res = await fetch(`/api/conversations?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return false;
    router.refresh();
    return true;
  }

  if (calls.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-fg)]">{dict.dashboard.calls.empty}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {calls.map((call) => {
        const when = new Date(call.started_at).toLocaleString(
          locale === "fr" ? "fr-CA" : "en-CA",
          { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }
        );
        const isSms = call.channel === "sms";
        const duration = isSms
          ? dict.dashboard.calls.sms
          : call.duration_seconds != null
            ? `${Math.max(1, Math.round(call.duration_seconds / 60))} min`
            : "—";
        const outcomeKey = call.outcome as keyof typeof dict.dashboard.calls.outcomes;
        const outcomeLabel =
          dict.dashboard.calls.outcomes[outcomeKey] ?? call.outcome;
        const excerpt =
          call.summary ??
          (call.transcript ? call.transcript.slice(0, 120) + (call.transcript.length > 120 ? "…" : "") : null);
        const recovered =
          call.recovered_revenue_cents && call.recovered_revenue_cents > 0
            ? (call.recovered_revenue_cents / 100).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
                style: "currency",
                currency: "CAD",
              })
            : null;

        return (
          <li key={call.id} className="card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSms ? "bg-[var(--teal-light)]" : "bg-[var(--primary-light)]"}`}
                >
                  {isSms ? (
                    <MessageSquare className="h-4 w-4 text-[var(--teal)]" />
                  ) : (
                    <Phone className="h-4 w-4 text-[var(--primary)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="break-words font-medium text-[var(--foreground)]">
                    {call.from_number ?? dict.dashboard.calls.unknownCaller}
                  </p>
                  <p className="text-sm text-[var(--muted-fg)]">
                    {when} · {duration}
                  </p>
                  {excerpt && (
                    <div className="mt-2">
                      <p
                        className={`break-words text-sm text-[var(--muted-fg)] ${expanded[call.id] ? "" : "line-clamp-2"}`}
                      >
                        {expanded[call.id] && call.transcript ? call.transcript : excerpt}
                      </p>
                      {(call.transcript?.length ?? 0) > 120 && (
                        <button
                          type="button"
                          className="mt-1 text-xs font-medium text-[var(--primary)]"
                          onClick={() =>
                            setExpanded((e) => ({ ...e, [call.id]: !e[call.id] }))
                          }
                        >
                          {expanded[call.id]
                            ? dict.dashboard.calls.showLess
                            : dict.dashboard.calls.showMore}
                        </button>
                      )}
                    </div>
                  )}
                  {recovered && (
                    <p className="mt-1 text-xs font-medium text-[var(--teal)]">
                      {dict.dashboard.calls.recovered}: {recovered}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-start sm:justify-self-end">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${OUTCOME_STYLES[call.outcome] ?? OUTCOME_STYLES.other}`}
                >
                  {outcomeLabel}
                </span>
                <DeleteItemButton
                  label={dict.dashboard.common.delete}
                  confirmMessage={dict.dashboard.common.deleteConfirmCall}
                  errorMessage={dict.dashboard.common.deleteError}
                  onDelete={() => deleteCall(call.id)}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}