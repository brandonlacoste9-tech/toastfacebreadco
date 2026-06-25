"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Service = { id: string; name: string };
type StaffMember = { id: string; display_name: string };

type Prefill = {
  customer_name: string;
  customer_phone: string | null;
  notes: string | null;
};

export function BookingForm({
  dict,
  services,
  staff,
  prefill,
  leadId,
}: {
  dict: Dictionary;
  services: Service[];
  staff?: StaffMember[];
  prefill?: Prefill | null;
  leadId?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [name, setName] = useState(prefill?.customer_name ?? "");
  const [phone, setPhone] = useState(prefill?.customer_phone ?? "");
  const [notes, setNotes] = useState(prefill?.notes ?? "");

  useEffect(() => {
    if (prefill) {
      setName(prefill.customer_name);
      setPhone(prefill.customer_phone ?? "");
      setNotes(prefill.notes ?? "");
    }
  }, [prefill]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: form.get("customer_name"),
        customer_phone: form.get("customer_phone"),
        service_id: form.get("service_id") || null,
        staff_id: form.get("staff_id") || null,
        starts_at: form.get("starts_at"),
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    if (leadId) {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, pipeline_stage: "booked" }),
      });
    }

    e.currentTarget.reset();
    setName("");
    setPhone("");
    setNotes("");
    setStatus("idle");
    router.refresh();
    if (leadId) router.replace("/dashboard/bookings");
  }

  return (
    <form onSubmit={onSubmit} className="card w-full min-w-0 space-y-4 p-5">
      <h2 className="font-semibold text-[var(--foreground)]">
        {leadId ? dict.dashboard.leads.bookCta : dict.dashboard.bookings.add}
      </h2>
      {leadId && (
        <p className="text-sm text-[var(--muted-fg)]">{dict.dashboard.leads.bookHint}</p>
      )}
      <Input
        name="customer_name"
        placeholder={dict.dashboard.bookings.customerName}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        name="customer_phone"
        type="tel"
        placeholder={dict.dashboard.bookings.phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <select name="service_id" className="select-field" defaultValue="">
        <option value="">{dict.dashboard.bookings.serviceOptional}</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {staff && staff.length > 0 && (
        <select name="staff_id" className="select-field" defaultValue="">
          <option value="">{dict.dashboard.bookings.staffOptional}</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.display_name}
            </option>
          ))}
        </select>
      )}
      <Input name="starts_at" type="datetime-local" required />
      <Input
        name="notes"
        placeholder={dict.dashboard.bookings.notes}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "…" : dict.dashboard.bookings.save}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-600">{dict.dashboard.bookings.error}</p>
      )}
    </form>
  );
}