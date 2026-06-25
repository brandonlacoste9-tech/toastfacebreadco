"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Labels = {
  title: string;
  name: string;
  phone: string;
  notes: string;
  submit: string;
  success: string;
  error: string;
};

export function EmbedLeadForm({ slug, labels }: { slug: string; labels: Labels }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        contact_name: form.get("contact_name"),
        contact_phone: form.get("contact_phone"),
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }
    e.currentTarget.reset();
    setStatus("done");
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 p-6">
      <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">{labels.title}</h1>
      <Input name="contact_name" placeholder={labels.name} required />
      <Input name="contact_phone" type="tel" placeholder={labels.phone} />
      <Input name="notes" placeholder={labels.notes} />
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "…" : labels.submit}
      </Button>
      {status === "done" && (
        <p className="text-sm font-medium text-green-700">{labels.success}</p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{labels.error}</p>}
    </form>
  );
}