"use client";

import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export function CustomersList({
  dict,
  customers,
  locale,
}: {
  dict: Dictionary;
  customers: Customer[];
  locale: string;
}) {
  const router = useRouter();
  const t = dict.dashboard.customers;
  const [draft, setDraft] = useState<Record<string, { name: string; phone: string; email: string }>>(
    {}
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  async function saveCustomer(id: string) {
    const d = draft[id];
    if (!d) return;
    setSaving((s) => ({ ...s, [id]: true }));
    await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        full_name: d.name,
        phone: d.phone,
        email: d.email,
      }),
    });
    setSaving((s) => ({ ...s, [id]: false }));
    router.refresh();
  }

  async function deleteCustomer(id: string) {
    const res = await fetch(`/api/customers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return false;
    router.refresh();
    return true;
  }

  if (customers.length === 0) {
    return <p className="text-sm text-[var(--muted-fg)]">{t.empty}</p>;
  }

  return (
    <ul className="space-y-3">
      {customers.map((c) => {
        const when = new Date(c.created_at).toLocaleDateString(
          locale === "fr" ? "fr-CA" : "en-CA"
        );
        const d = draft[c.id] ?? {
          name: c.full_name,
          phone: c.phone ?? "",
          email: c.email ?? "",
        };
        const dirty =
          d.name !== c.full_name ||
          d.phone !== (c.phone ?? "") ||
          d.email !== (c.email ?? "");

        return (
          <li key={c.id} className="card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="min-w-0 space-y-2">
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                  value={d.name}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [c.id]: { ...d, name: e.target.value },
                    }))
                  }
                />
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  placeholder={t.phone}
                  value={d.phone}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [c.id]: { ...d, phone: e.target.value },
                    }))
                  }
                />
                <input
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                  placeholder={t.email}
                  value={d.email}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      [c.id]: { ...d, email: e.target.value },
                    }))
                  }
                />
                <p className="text-xs text-[var(--muted-fg)]">
                  {t.added} {when}
                </p>
                {dirty && (
                  <button
                    type="button"
                    className="text-xs font-medium text-[var(--primary)]"
                    disabled={saving[c.id]}
                    onClick={() => saveCustomer(c.id)}
                  >
                    {saving[c.id] ? t.saving : t.save}
                  </button>
                )}
              </div>
              <DeleteItemButton
                label={dict.dashboard.common.delete}
                confirmMessage={dict.dashboard.common.deleteConfirmCustomer}
                errorMessage={dict.dashboard.common.deleteError}
                onDelete={() => deleteCustomer(c.id)}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}