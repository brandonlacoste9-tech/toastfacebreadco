"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StaffRow = { id: string; display_name: string; active: boolean };

export function StaffCard({
  dict,
  initial,
}: {
  dict: Dictionary;
  initial: StaffRow[];
}) {
  const router = useRouter();
  const t = dict.dashboard.staff;
  const [staff, setStaff] = useState(initial);
  const [newName, setNewName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function addStaff() {
    const name = newName.trim();
    if (!name) return;
    setStatus("loading");
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: name }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setNewName("");
    setStatus("idle");
    router.refresh();
  }

  async function removeStaff(id: string) {
    setStatus("loading");
    const res = await fetch(`/api/staff?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStaff((rows) => rows.filter((r) => r.id !== id));
    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="card mt-8 w-full min-w-0 p-6">
      <h2 className="font-semibold text-[var(--foreground)]">{t.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.subtitle}</p>

      <ul className="mt-4 space-y-2">
        {staff.length === 0 && (
          <li className="text-sm text-[var(--muted-fg)]">{t.empty}</li>
        )}
        {staff.map((row) => (
          <li
            key={row.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
          >
            <span className="text-sm font-medium text-[var(--foreground)]">{row.display_name}</span>
            <button
              type="button"
              className="text-[var(--muted-fg)] hover:text-red-600"
              aria-label={t.remove}
              onClick={() => removeStaff(row.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          placeholder={t.namePlaceholder}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="min-w-0 flex-1"
        />
        <Button type="button" variant="secondary" disabled={status === "loading"} onClick={addStaff}>
          {t.add}
        </Button>
      </div>
      {status === "error" && <p className="mt-2 text-sm text-red-600">{t.error}</p>}
    </div>
  );
}