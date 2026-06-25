"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { montrealLocalToIso } from "@/lib/vapi/timezone";
import { useEffect, useState } from "react";

type Service = { id: string; name: string; duration_minutes: number; price_cents: number };

type Labels = {
  title: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
  submit: string;
  success: string;
  error: string;
  noSlots: string;
  pickService: string;
};

export function PublicBookingForm({
  slug,
  businessName,
  services,
  labels,
}: {
  slug: string;
  businessName: string;
  services: Service[];
  labels: Labels;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([]);
      setTime("");
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    fetch(
      `/api/public/slots?slug=${encodeURIComponent(slug)}&date=${encodeURIComponent(date)}&service_id=${encodeURIComponent(serviceId)}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const next = (data.slots as string[]) ?? [];
        setSlots(next);
        setTime((prev) => (next.includes(prev) ? prev : ""));
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, serviceId, date]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!serviceId || !date || !time) return;
    setStatus("loading");

    const [y, mo, d] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const starts_at = montrealLocalToIso(y, mo, d, hour, minute);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        customer_name: form.get("customer_name"),
        customer_phone: form.get("customer_phone"),
        customer_email: form.get("customer_email"),
        service_id: serviceId,
        starts_at,
        notes: form.get("notes"),
      }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }
    e.currentTarget.reset();
    setDate("");
    setTime("");
    setStatus("done");
  }

  if (services.length === 0) {
    return (
      <p className="p-6 text-sm text-[var(--muted-fg)]">{labels.pickService}</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          {labels.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">{businessName}</p>
      </div>

      <Input name="customer_name" placeholder={labels.name} required />
      <Input name="customer_phone" type="tel" placeholder={labels.phone} />
      <Input name="customer_email" type="email" placeholder={labels.email} />

      <select
        className="select-field w-full"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        required
      >
        <option value="">{labels.service}</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        aria-label={labels.date}
      />

      <select
        className="select-field w-full"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
        disabled={!date || loadingSlots}
        aria-label={labels.time}
      >
        <option value="">{labels.time}</option>
        {slots.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>
      {date && !loadingSlots && slots.length === 0 && (
        <p className="text-xs text-[var(--muted-fg)]">{labels.noSlots}</p>
      )}

      <Input name="notes" placeholder={labels.notes} />

      <Button type="submit" className="w-full" disabled={status === "loading" || !time}>
        {status === "loading" ? "…" : labels.submit}
      </Button>
      {status === "done" && (
        <p className="text-sm font-medium text-green-700">{labels.success}</p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{labels.error}</p>}
    </form>
  );
}