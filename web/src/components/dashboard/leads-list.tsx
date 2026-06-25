"use client";

import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Lead = {
  id: string;
  contact_name: string;
  contact_phone: string | null;
  source: string;
  pipeline_stage: string;
  notes: string | null;
  captured_at: string;
  metadata?: Record<string, string | null> | null;
};

const STAGES = ["new", "contacted", "booked", "lost"] as const;

export function LeadsList({
  dict,
  leads,
  locale,
}: {
  dict: Dictionary;
  leads: Lead[];
  locale: string;
}) {
  const router = useRouter();
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  async function updateStage(id: string, pipeline_stage: string) {
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pipeline_stage }),
    });
    router.refresh();
  }

  async function saveNotes(id: string) {
    const notes = notesDraft[id];
    if (notes === undefined) return;
    setSavingNotes((s) => ({ ...s, [id]: true }));
    await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes }),
    });
    setSavingNotes((s) => ({ ...s, [id]: false }));
    router.refresh();
  }

  async function deleteLead(id: string) {
    const res = await fetch(`/api/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return false;
    router.refresh();
    return true;
  }

  if (leads.length === 0) {
    return <p className="text-sm text-[var(--muted-fg)]">{dict.dashboard.leads.empty}</p>;
  }

  const stageLabels: Record<string, string> = {
    new: dict.dashboard.leads.stages.new,
    contacted: dict.dashboard.leads.stages.contacted,
    booked: dict.dashboard.leads.stages.booked,
    lost: dict.dashboard.leads.stages.lost,
  };

  const sourceLabels: Record<string, string> = {
    manual: dict.dashboard.leads.sources.manual,
    missed_call: dict.dashboard.leads.sources.missedCall,
    web_form: dict.dashboard.leads.sources.webForm,
    sms: dict.dashboard.leads.sources.sms,
    phone_ai: dict.dashboard.leads.sources.missedCall,
  };

  return (
    <ul className="space-y-3">
      {leads.map((lead) => {
        const when = new Date(lead.captured_at).toLocaleDateString(
          locale === "fr" ? "fr-CA" : "en-CA"
        );
        const draft = notesDraft[lead.id] ?? lead.notes ?? "";
        const notesDirty = draft !== (lead.notes ?? "");

        return (
          <li key={lead.id} className="card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="min-w-0">
                <p className="break-words font-medium text-[var(--foreground)]">{lead.contact_name}</p>
                {lead.contact_phone && (
                  <p className="break-all text-sm text-[var(--muted-fg)]">{lead.contact_phone}</p>
                )}
                <p className="mt-1 break-words text-xs text-[var(--muted-fg)]">
                  {sourceLabels[lead.source] ?? lead.source} · {when}
                </p>
                {lead.metadata?.urgency && (
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      lead.metadata.urgency === "high"
                        ? "bg-red-100 text-red-700"
                        : lead.metadata.urgency === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {lead.metadata.urgency} Urgency
                  </span>
                )}
                {lead.metadata?.service_needed && (
                  <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                    Service: <span className="font-normal">{lead.metadata.service_needed}</span>
                  </p>
                )}
                {lead.metadata?.diagnostic_data && (
                  <p className="mt-1 text-sm text-[var(--muted-fg)]">
                    <span className="font-medium text-[var(--foreground)]">Diagnostics:</span>{" "}
                    {lead.metadata.diagnostic_data}
                  </p>
                )}
                <label className="mt-3 block text-xs text-[var(--muted-fg)]">
                  {dict.dashboard.leads.notes}
                  <textarea
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                    rows={2}
                    value={draft}
                    onChange={(e) =>
                      setNotesDraft((d) => ({ ...d, [lead.id]: e.target.value }))
                    }
                  />
                </label>
                {notesDirty && (
                  <button
                    type="button"
                    className="mt-1 text-xs font-medium text-[var(--primary)]"
                    disabled={savingNotes[lead.id]}
                    onClick={() => saveNotes(lead.id)}
                  >
                    {savingNotes[lead.id]
                      ? dict.dashboard.leads.savingNotes
                      : dict.dashboard.leads.saveNotes}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-self-end">
                <Link
                  href={`/dashboard/bookings?lead=${lead.id}`}
                  className="rounded-lg bg-[var(--primary-light)] px-3 py-2 text-sm font-medium text-[var(--primary)] hover:opacity-90"
                >
                  {dict.dashboard.leads.bookCta}
                </Link>
                <select
                  className="select-field w-full sm:w-auto sm:min-w-[140px]"
                  value={lead.pipeline_stage}
                  onChange={(e) => updateStage(lead.id, e.target.value)}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {stageLabels[s]}
                    </option>
                  ))}
                </select>
                <DeleteItemButton
                  label={dict.dashboard.common.delete}
                  confirmMessage={dict.dashboard.common.deleteConfirmLead}
                  errorMessage={dict.dashboard.common.deleteError}
                  onDelete={() => deleteLead(lead.id)}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}