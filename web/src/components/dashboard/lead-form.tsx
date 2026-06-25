"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LeadForm({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact_name: form.get("contact_name"),
        contact_phone: form.get("contact_phone"),
        source: form.get("source"),
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    e.currentTarget.reset();
    setStatus("idle");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card w-full min-w-0 space-y-4 p-5">
      <h2 className="font-semibold text-[var(--foreground)]">{dict.dashboard.leads.add}</h2>
      <Input name="contact_name" placeholder={dict.dashboard.leads.name} required />
      <Input name="contact_phone" type="tel" placeholder={dict.dashboard.leads.phone} />
      <select name="source" className="select-field" defaultValue="manual">
        <option value="manual">{dict.dashboard.leads.sources.manual}</option>
        <option value="missed_call">{dict.dashboard.leads.sources.missedCall}</option>
        <option value="web_form">{dict.dashboard.leads.sources.webForm}</option>
      </select>
      <Input name="notes" placeholder={dict.dashboard.leads.notes} />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "…" : dict.dashboard.leads.save}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{dict.dashboard.leads.error}</p>}
    </form>
  );
}