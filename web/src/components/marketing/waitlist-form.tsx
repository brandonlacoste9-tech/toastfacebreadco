"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function WaitlistForm({ dict, locale }: { dict: Dictionary; locale: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [founderCode, setFounderCode] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? data.warning ?? "failed");
      setFounderCode(data.founder_code ?? null);
      setStatus("success");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    const fr = locale === "fr";
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-light)] p-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--teal)]" />
        <div>
          <p className="text-sm font-medium text-[var(--teal)]">{dict.waitlist.success}</p>
          {founderCode && (
            <p className="mt-2 text-sm text-[var(--foreground)]">
              {fr ? "Votre code fondateur : " : "Your founder code: "}
              <span className="font-mono font-semibold text-[var(--primary)]">{founderCode}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Input name="business_name" placeholder={dict.waitlist.fields.businessName} required />
      <Input name="contact_name" placeholder={dict.waitlist.fields.contactName} required />
      <Input name="email" type="email" placeholder={dict.waitlist.fields.email} required />
      <Input name="phone" type="tel" placeholder={dict.waitlist.fields.phone} />
      <Input name="city" placeholder={dict.waitlist.fields.city} required />
      <select name="staff_count" className="select-field" defaultValue="1-3">
        <option value="1-3">1–3</option>
        <option value="4-8">4–8</option>
        <option value="9+">9+</option>
      </select>
      <select name="primary_pain" className="select-field sm:col-span-2" required>
        <option value="">{dict.waitlist.fields.pain}</option>
        {dict.waitlist.pains.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
          {status === "loading" ? "…" : dict.waitlist.submit}
        </Button>
        {status === "error" && (
          <p className="mt-2 text-sm text-red-600">
            {locale === "fr" ? "Erreur — réessayez." : "Error — please try again."}
          </p>
        )}
      </div>
    </form>
  );
}