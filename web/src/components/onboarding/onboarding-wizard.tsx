"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  defaultServicesForType,
  type BusinessType,
} from "@/lib/onboarding/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const BUSINESS_TYPES: BusinessType[] = ["salon", "trade", "office"];

export function OnboardingWizard({ dict, locale }: { dict: Dictionary; locale: string }) {
  const router = useRouter();
  const fr = locale === "fr";
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [businessType, setBusinessType] = useState<BusinessType>("salon");
  const [industry, setIndustry] = useState("");
  const [hours, setHours] = useState<Record<string, { open: string; close: string }>>({
    mon: { open: "09:00", close: "17:00" },
    tue: { open: "09:00", close: "17:00" },
    wed: { open: "09:00", close: "17:00" },
    thu: { open: "09:00", close: "17:00" },
    fri: { open: "09:00", close: "17:00" },
    sat: { open: "10:00", close: "15:00" },
    sun: { open: "", close: "" },
  });
  const [services, setServices] = useState(
    defaultServicesForType("salon", fr ? "fr" : "en")
  );

  const ot = dict.onboarding;
  const typeLabels: Record<BusinessType, { title: string; desc: string }> = {
    salon: { title: ot.businessTypes.salon, desc: ot.businessTypes.salonDesc },
    trade: { title: ot.businessTypes.trade, desc: ot.businessTypes.tradeDesc },
    office: { title: ot.businessTypes.office, desc: ot.businessTypes.officeDesc },
  };

  async function saveStep(payload: Record<string, unknown>) {
    setStatus("loading");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setStatus("error");
      return false;
    }
    setStatus("idle");
    return true;
  }

  function selectType(type: BusinessType) {
    setBusinessType(type);
    setServices(defaultServicesForType(type, fr ? "fr" : "en"));
  }

  async function nextFromType() {
    const ok = await saveStep({ business_type: businessType, industry });
    if (ok) setStep(2);
  }

  async function nextFromHours() {
    const ok = await saveStep({ working_hours: hours });
    if (ok) setStep(3);
  }

  async function nextFromServices() {
    const ok = await saveStep({ services });
    if (ok) setStep(4);
  }

  async function finish() {
    setStatus("loading");
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("idle");

    let subscribe = "";
    let interval = "month";
    try {
      subscribe = sessionStorage.getItem("pendingSubscribePlan") ?? "";
      interval = sessionStorage.getItem("pendingSubscribeInterval") ?? "month";
      sessionStorage.removeItem("pendingSubscribePlan");
      sessionStorage.removeItem("pendingSubscribeInterval");
    } catch {
      /* ignore */
    }

    if (subscribe && ["starter", "white_glove"].includes(subscribe)) {
      router.push(
        `/dashboard/settings?subscribe=${subscribe}&interval=${interval === "year" ? "year" : "month"}`
      );
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  const dayLabels: Record<string, string> = dict.onboarding.days;

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-sm font-medium text-[var(--primary)]">
        {dict.onboarding.step} {step}/4
      </p>

      {step === 1 && (
        <div className="card mt-6 space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">{ot.businessTypes.title}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{ot.businessTypes.subtitle}</p>
          <div className="space-y-2">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => selectType(type)}
                className={cn(
                  "w-full rounded-xl border p-4 text-left transition-colors",
                  businessType === type
                    ? "border-[var(--primary)] bg-[var(--primary-light)]"
                    : "border-[var(--border)] hover:border-[var(--primary)]/40"
                )}
              >
                <p className="font-semibold text-[var(--foreground)]">{typeLabels[type].title}</p>
                <p className="mt-1 text-sm text-[var(--muted-fg)]">{typeLabels[type].desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <label className="text-sm font-medium text-[var(--foreground)]">{dict.dashboard.settings.industry}</label>
            <p className="mb-2 text-sm text-[var(--muted-fg)]">
              {fr ? "Quel est votre domaine exact? (ex: Clinique Dentaire)" : "What is your exact field? (e.g. Dental Clinic)"}
            </p>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder={dict.dashboard.settings.industryPlaceholder}
            />
          </div>
          <Button type="button" onClick={nextFromType} disabled={status === "loading"} className="mt-4">
            {dict.onboarding.next}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="card mt-6 space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">{dict.onboarding.hours.title}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{dict.onboarding.hours.subtitle}</p>
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
              <span className="text-sm font-medium">{dayLabels[day]}</span>
              <Input
                type="time"
                value={hours[day].open}
                onChange={(e) =>
                  setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.value } }))
                }
              />
              <Input
                type="time"
                value={hours[day].close}
                onChange={(e) =>
                  setHours((h) => ({ ...h, [day]: { ...h[day], close: e.target.value } }))
                }
              />
            </div>
          ))}
          <Button type="button" onClick={nextFromHours} disabled={status === "loading"}>
            {dict.onboarding.next}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="card mt-6 space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">{dict.onboarding.services.title}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{dict.onboarding.services.subtitle}</p>
          {services.map((svc, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-3">
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
                  next[i] = { ...next[i], price_cents: Math.round(Number(e.target.value) * 100) };
                  setServices(next);
                }}
                placeholder={dict.onboarding.services.price}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setServices([...services, { name: "", duration_minutes: 60, price_cents: 0 }])
            }
          >
            {dict.onboarding.services.add}
          </Button>
          <Button type="button" onClick={nextFromServices} disabled={status === "loading"}>
            {dict.onboarding.next}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="card mt-6 space-y-4 p-6 text-center">
          <h2 className="font-display text-xl font-semibold">{dict.onboarding.done.title}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{dict.onboarding.done.subtitle}</p>
          <Button type="button" size="lg" onClick={finish} disabled={status === "loading"}>
            {dict.onboarding.done.cta}
          </Button>
        </div>
      )}

      {status === "error" && (
        <p className="mt-4 text-sm text-red-600">{dict.onboarding.error}</p>
      )}
    </div>
  );
}