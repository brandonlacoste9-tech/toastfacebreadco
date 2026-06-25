"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

type ServiceRow = {
  id?: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

type HoursRow = Record<string, { open: string; close: string }>;

const DEFAULT_HOURS: HoursRow = {
  mon: { open: "09:00", close: "17:00" },
  tue: { open: "09:00", close: "17:00" },
  wed: { open: "09:00", close: "17:00" },
  thu: { open: "09:00", close: "17:00" },
  fri: { open: "09:00", close: "17:00" },
  sat: { open: "10:00", close: "15:00" },
  sun: { open: "", close: "" },
};

export function BusinessSettingsForm({
  dict,
  locale,
  initial,
}: {
  dict: Dictionary;
  locale: string;
  initial: {
    name: string;
    city: string | null;
    industry: string | null;
    default_language: string;
    working_hours: HoursRow;
    forward_to_number: string | null;
    phone_number: string | null;
    services: ServiceRow[];
  };
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city ?? "");
  const [industry, setIndustry] = useState(initial.industry ?? "");
  const [language, setLanguage] = useState(initial.default_language);
  const [forwardTo, setForwardTo] = useState(initial.forward_to_number ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initial.phone_number ?? "");
  const [buyNumberStatus, setBuyNumberStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [buyNumberAreaCode, setBuyNumberAreaCode] = useState("");
  const [buyNumberError, setBuyNumberError] = useState("");
  const [hours, setHours] = useState<HoursRow>({ ...DEFAULT_HOURS, ...initial.working_hours });
  const [services, setServices] = useState<ServiceRow[]>(
    initial.services.length > 0
      ? initial.services
      : [{ name: locale === "fr" ? "Coupe" : "Haircut", duration_minutes: 45, price_cents: 4500 }]
  );

  const dayLabels = dict.onboarding.days;
  const t = dict.dashboard.settings;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        city,
        industry,
        default_language: language,
        working_hours: hours,
        forward_to_number: forwardTo,
        services,
        sync_voice: true,
      }),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setStatus("done");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 w-full min-w-0 space-y-6 p-6">
      <div>
        <h2 className="font-semibold text-[var(--foreground)]">{t.profileTitle}</h2>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.profileSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-[var(--muted-fg)]">{t.businessName}</label>
          <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm text-[var(--muted-fg)]">{t.city}</label>
          <Input className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-[var(--muted-fg)]">{t.industry}</label>
          <Input className="mt-1" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder={t.industryPlaceholder} />
        </div>
        <div>
          <label className="text-sm text-[var(--muted-fg)]">{t.language}</label>
          <select
            className="select-field mt-1 w-full"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-[var(--muted-fg)]">{t.forwardTo}</label>
          <Input
            className="mt-1"
            type="tel"
            value={forwardTo}
            onChange={(e) => setForwardTo(e.target.value)}
            placeholder={t.forwardToPlaceholder}
          />
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <h3 className="font-medium text-[var(--foreground)]">Dedicated AI Number</h3>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">
          Your AI receptionist&apos;s phone number. Forward your missed calls here.
        </p>
        
        {phoneNumber ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <span className="font-mono text-lg font-medium tracking-wide text-[var(--primary)]">
              {phoneNumber}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--teal)]">
              Active
            </span>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
            <label className="text-sm text-[var(--muted-fg)]">Enter your preferred 3-digit area code (e.g., 514, 438)</label>
            <div className="mt-2 flex gap-3">
              <Input
                className="w-32"
                placeholder="514"
                maxLength={3}
                value={buyNumberAreaCode}
                onChange={(e) => setBuyNumberAreaCode(e.target.value)}
                disabled={buyNumberStatus === "loading"}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={buyNumberStatus === "loading" || buyNumberAreaCode.length !== 3}
                onClick={async () => {
                  setBuyNumberStatus("loading");
                  setBuyNumberError("");
                  const res = await fetch("/api/settings/buy-number", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ areaCode: buyNumberAreaCode }),
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setBuyNumberStatus("error");
                    setBuyNumberError(json.error || "Failed to purchase number.");
                  } else {
                    setPhoneNumber(json.phone_number);
                    setBuyNumberStatus("done");
                  }
                }}
              >
                {buyNumberStatus === "loading" ? "Searching..." : "Get Dedicated Number"}
              </Button>
            </div>
            {buyNumberStatus === "error" && (
              <p className="mt-2 text-sm text-red-600">{buyNumberError}</p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <h3 className="font-medium text-[var(--foreground)]">{dict.onboarding.hours.title}</h3>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">{dict.onboarding.hours.subtitle}</p>
        <div className="mt-4 space-y-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="grid grid-cols-[minmax(0,4rem)_1fr_1fr] items-center gap-2 sm:grid-cols-[5rem_1fr_1fr]"
            >
              <span className="text-sm font-medium">{dayLabels[day]}</span>
              <Input
                type="time"
                value={hours[day]?.open ?? ""}
                onChange={(e) =>
                  setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.value } }))
                }
              />
              <Input
                type="time"
                value={hours[day]?.close ?? ""}
                onChange={(e) =>
                  setHours((h) => ({ ...h, [day]: { ...h[day], close: e.target.value } }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6">
        <h3 className="font-medium text-[var(--foreground)]">{dict.onboarding.services.title}</h3>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">{dict.onboarding.services.subtitle}</p>
        <div className="mt-4 space-y-3">
          {services.map((svc, i) => (
            <div key={svc.id ?? i} className="grid gap-2 sm:grid-cols-[1fr_6rem_6rem_auto] sm:items-center">
              <Input
                value={svc.name}
                onChange={(e) => {
                  const next = [...services];
                  next[i] = { ...next[i], name: e.target.value };
                  setServices(next);
                }}
                placeholder={dict.onboarding.services.name}
              />
              <Input
                type="number"
                value={svc.duration_minutes}
                onChange={(e) => {
                  const next = [...services];
                  next[i] = { ...next[i], duration_minutes: Number(e.target.value) };
                  setServices(next);
                }}
                placeholder={dict.onboarding.services.duration}
              />
              <Input
                type="number"
                value={svc.price_cents / 100}
                onChange={(e) => {
                  const next = [...services];
                  next[i] = {
                    ...next[i],
                    price_cents: Math.round(Number(e.target.value) * 100),
                  };
                  setServices(next);
                }}
                placeholder={dict.onboarding.services.price}
              />
              <button
                type="button"
                aria-label={t.removeService}
                title={t.removeService}
                disabled={services.length <= 1}
                onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--muted-fg)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-3"
          onClick={() =>
            setServices([...services, { name: "", duration_minutes: 60, price_cents: 0 }])
          }
        >
          {dict.onboarding.services.add}
        </Button>
      </div>

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? t.saving : t.save}
      </Button>

      {status === "done" && (
        <p className="text-sm text-[var(--teal)]">{t.saved}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{t.saveError}</p>
      )}
    </form>
  );
}