"use client";

import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Booking = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  starts_at: string;
  status: string;
  service_id: string | null;
  notes: string | null;
  services: { name: string } | null;
};

type Service = { id: string; name: string };

const STATUSES = ["booked", "confirmed", "cancelled", "no_show", "completed"] as const;
type Filter = "upcoming" | "past" | "all";

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookingsList({
  dict,
  bookings,
  services,
  locale,
}: {
  dict: Dictionary;
  bookings: Booking[];
  services: Service[];
  locale: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ starts_at: string; service_id: string; notes: string }>({
    starts_at: "",
    service_id: "",
    notes: "",
  });
  const [smsStatus, setSmsStatus] = useState<Record<string, "idle" | "loading" | "done" | "error">>(
    {}
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const statusLabels: Record<string, string> = {
    booked: dict.dashboard.bookings.statuses.booked,
    confirmed: dict.dashboard.bookings.statuses.confirmed,
    cancelled: dict.dashboard.bookings.statuses.cancelled,
    no_show: dict.dashboard.bookings.statuses.noShow,
    completed: dict.dashboard.bookings.statuses.completed,
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    return bookings.filter((b) => {
      const t = new Date(b.starts_at).getTime();
      if (filter === "upcoming") return t >= now && b.status !== "cancelled";
      if (filter === "past") return t < now || b.status === "cancelled";
      return true;
    });
  }, [bookings, filter]);

  function startEdit(b: Booking) {
    setEditingId(b.id);
    setEditDraft({
      starts_at: isoToDatetimeLocal(b.starts_at),
      service_id: b.service_id ?? "",
      notes: b.notes ?? "",
    });
    setSaveError(null);
  }

  async function saveEdit(id: string) {
    setSaveError(null);
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        starts_at: new Date(editDraft.starts_at).toISOString(),
        service_id: editDraft.service_id || null,
        notes: editDraft.notes,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.error ?? dict.dashboard.bookings.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function sendSms(id: string, template: "confirmation" | "reminder") {
    setSmsStatus((s) => ({ ...s, [id]: "loading" }));
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: id, template }),
    });
    setSmsStatus((s) => ({ ...s, [id]: res.ok ? "done" : "error" }));
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  async function deleteBooking(id: string) {
    const res = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return false;
    router.refresh();
    return true;
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "upcoming", label: dict.dashboard.bookings.filterUpcoming },
    { key: "past", label: dict.dashboard.bookings.filterPast },
    { key: "all", label: dict.dashboard.bookings.filterAll },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.key
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--foreground)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted-fg)]">{dict.dashboard.bookings.empty}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((b) => {
            const when = new Date(b.starts_at).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA");
            const sms = smsStatus[b.id];
            const editing = editingId === b.id;

            return (
              <li key={b.id} className="card p-4">
                {editing ? (
                  <div className="space-y-3">
                    <p className="font-medium text-[var(--foreground)]">{b.customer_name}</p>
                    <Input
                      type="datetime-local"
                      value={editDraft.starts_at}
                      onChange={(e) => setEditDraft((d) => ({ ...d, starts_at: e.target.value }))}
                    />
                    <select
                      className="select-field w-full"
                      value={editDraft.service_id}
                      onChange={(e) => setEditDraft((d) => ({ ...d, service_id: e.target.value }))}
                    >
                      <option value="">{dict.dashboard.bookings.serviceOptional}</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={editDraft.notes}
                      placeholder={dict.dashboard.bookings.notes}
                      onChange={(e) => setEditDraft((d) => ({ ...d, notes: e.target.value }))}
                    />
                    {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={() => saveEdit(b.id)}>
                        {dict.dashboard.bookings.saveEdit}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        {dict.dashboard.bookings.cancelEdit}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="break-words font-medium text-[var(--foreground)]">{b.customer_name}</p>
                      <p className="text-sm text-[var(--muted-fg)]">{when}</p>
                      {b.services?.name && (
                        <p className="break-words text-sm text-[var(--muted-fg)]">{b.services.name}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:justify-self-end">
                      <select
                        className="select-field min-w-[120px] text-sm"
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(b)}>
                        {dict.dashboard.bookings.edit}
                      </Button>
                      {b.customer_phone && b.status !== "cancelled" && (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={sms === "loading"}
                            onClick={() => sendSms(b.id, "confirmation")}
                          >
                            {sms === "done" ? dict.dashboard.bookings.smsSent : dict.dashboard.bookings.sendSms}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={sms === "loading"}
                            onClick={() => sendSms(b.id, "reminder")}
                          >
                            {dict.dashboard.bookings.sendReminder}
                          </Button>
                        </>
                      )}
                      {sms === "error" && (
                        <span className="text-xs text-red-600">{dict.dashboard.bookings.smsError}</span>
                      )}
                      <DeleteItemButton
                        label={dict.dashboard.common.delete}
                        confirmMessage={dict.dashboard.common.deleteConfirmBooking}
                        errorMessage={dict.dashboard.common.deleteError}
                        onDelete={() => deleteBooking(b.id)}
                      />
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}