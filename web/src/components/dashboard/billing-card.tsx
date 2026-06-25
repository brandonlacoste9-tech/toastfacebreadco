"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { usagePercent } from "@/lib/usage/plan-limits";
import { softLimitLevel, worstSoftLimitLevel } from "@/lib/usage/soft-limit";
import type { UsageSnapshot } from "@/lib/usage/get-usage";
import { isValidPlan } from "@/lib/stripe/plans";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type BillingState = {
  plan: string;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  stripeConfigured: boolean;
  usage: UsageSnapshot | null;
  pendingSubscribePlan: string | null;
};

function UsageMeter({
  label,
  used,
  limit,
  unlimitedLabel,
  meterWarn,
  meterCritical,
}: {
  label: string;
  used: number;
  limit: number | null;
  unlimitedLabel: string;
  meterWarn: string;
  meterCritical: string;
}) {
  const pct = usagePercent(used, limit);
  const level = softLimitLevel(used, limit);
  const displayLimit = limit === null ? unlimitedLabel : String(limit);

  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-[var(--muted-fg)]">{label}</span>
        <span className="font-medium text-[var(--foreground)]">
          {used} / {displayLimit}
          {level === "warn" && (
            <span className="ml-1 text-amber-700">· {meterWarn}</span>
          )}
          {level === "critical" && (
            <span className="ml-1 text-red-600">· {meterCritical}</span>
          )}
        </span>
      </div>
      {pct !== null && (
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
          <div
            className={`h-full rounded-full transition-all ${
              level === "critical"
                ? "bg-red-500"
                : level === "warn"
                  ? "bg-amber-500"
                  : "bg-[var(--primary)]"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingCard({
  dict,
  locale,
  billing,
}: {
  dict: Dictionary;
  locale: string;
  billing: BillingState;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("billing") === "canceled";
  const subscribeParam = searchParams.get("subscribe");
  const intervalParam = searchParams.get("interval");
  const autoStarted = useRef(false);

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [interval, setInterval] = useState<"month" | "year">(
    intervalParam === "year" ? "year" : "month"
  );
  const t = dict.dashboard.billing;

  const trialEndLabel = billing.trialEndsAt
    ? new Date(billing.trialEndsAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")
    : null;

  const periodEndLabel = billing.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")
    : null;

  const hasActiveSubscription =
    billing.subscriptionStatus === "active" || billing.subscriptionStatus === "trialing";

  const canSubscribe = billing.stripeConfigured && !hasActiveSubscription;

  async function startCheckout(plan: string) {
    setStatus("loading");
    setErrorDetail(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setStatus("error");
      setErrorDetail(data.error ?? t.error);
      return;
    }
    window.location.href = data.url;
  }

  async function openPortal() {
    setStatus("loading");
    setErrorDetail(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok || !data.url) {
      setStatus("error");
      setErrorDetail(data.error ?? t.error);
      return;
    }
    window.location.href = data.url;
  }

  useEffect(() => {
    if (autoStarted.current || !canSubscribe) return;
    const plan =
      subscribeParam && isValidPlan(subscribeParam)
        ? subscribeParam
        : billing.pendingSubscribePlan && isValidPlan(billing.pendingSubscribePlan)
          ? billing.pendingSubscribePlan
          : null;
    if (!plan) return;
    autoStarted.current = true;
    startCheckout(plan).finally(() => {
      router.replace("/dashboard/settings");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPastDue = billing.subscriptionStatus === "past_due";

  return (
    <div className="card mt-8 w-full min-w-0 p-6">
      <h2 className="font-semibold text-[var(--foreground)]">{t.title}</h2>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.subtitle}</p>

      {!billing.stripeConfigured && (
        <p className="mt-4 text-sm text-[var(--muted-fg)]">{t.notConfigured}</p>
      )}

      {billing.stripeConfigured && (
        <>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-4">
              <dt className="text-[var(--muted-fg)]">{t.currentPlan}</dt>
              <dd className="font-medium capitalize text-[var(--foreground)]">{billing.plan}</dd>
            </div>
            {trialEndLabel && !hasActiveSubscription && (
              <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                <dt className="text-[var(--muted-fg)]">{t.trialEnds}</dt>
                <dd className="font-medium text-[var(--foreground)]">{trialEndLabel}</dd>
              </div>
            )}
            {periodEndLabel && hasActiveSubscription && (
              <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                <dt className="text-[var(--muted-fg)]">{t.nextBilling}</dt>
                <dd className="font-medium text-[var(--foreground)]">{periodEndLabel}</dd>
              </div>
            )}
            {billing.subscriptionStatus && (
              <div className="grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-4">
                <dt className="text-[var(--muted-fg)]">{t.status}</dt>
                <dd className="font-medium capitalize text-[var(--foreground)]">
                  {t.statuses[billing.subscriptionStatus as keyof typeof t.statuses] ??
                    billing.subscriptionStatus}
                </dd>
              </div>
            )}
          </dl>

          {billing.usage && (
            <div className="mt-6 space-y-3 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium text-[var(--foreground)]">{t.usageTitle}</p>
              {(() => {
                const u = billing.usage!;
                const overall = worstSoftLimitLevel([
                  { used: u.bookings, limit: u.limits.bookings },
                  { used: u.sms, limit: u.limits.sms },
                  { used: u.voiceMinutes, limit: u.limits.voiceMinutes },
                  { used: u.staff, limit: u.limits.staff },
                ]);
                if (overall === "ok") return null;
                return (
                  <p
                    className={`text-sm ${overall === "critical" ? "text-red-700" : "text-amber-800"}`}
                    role="status"
                  >
                    {overall === "critical" ? t.usageCritical : t.usageWarn}
                  </p>
                );
              })()}
              <UsageMeter
                label={t.usageBookings}
                used={billing.usage.bookings}
                limit={billing.usage.limits.bookings}
                unlimitedLabel={t.unlimited}
                meterWarn={t.usageMeterWarn}
                meterCritical={t.usageMeterCritical}
              />
              <UsageMeter
                label={t.usageSms}
                used={billing.usage.sms}
                limit={billing.usage.limits.sms}
                unlimitedLabel={t.unlimited}
                meterWarn={t.usageMeterWarn}
                meterCritical={t.usageMeterCritical}
              />
              <UsageMeter
                label={t.usageVoice}
                used={billing.usage.voiceMinutes}
                limit={billing.usage.limits.voiceMinutes}
                unlimitedLabel={t.unlimited}
                meterWarn={t.usageMeterWarn}
                meterCritical={t.usageMeterCritical}
              />
              <UsageMeter
                label={t.usageStaff}
                used={billing.usage.staff}
                limit={billing.usage.limits.staff}
                unlimitedLabel={t.unlimited}
                meterWarn={t.usageMeterWarn}
                meterCritical={t.usageMeterCritical}
              />
            </div>
          )}

          {canceled && (
            <p className="mt-4 text-sm text-[var(--muted-fg)]">{t.checkoutCanceled}</p>
          )}

          {isPastDue && (
            <p className="mt-4 text-sm font-medium text-red-600">{t.pastDue}</p>
          )}

          {canSubscribe && !isPastDue && trialEndLabel && (
            <p className="mt-4 text-sm text-amber-700">{t.trialBanner}</p>
          )}

          {canSubscribe && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-sm ${interval === "month" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}
                  onClick={() => setInterval("month")}
                >
                  {t.monthly}
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-sm ${interval === "year" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}
                  onClick={() => setInterval("year")}
                >
                  {t.annual}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(["starter", "white_glove"] as const).map((plan) => (
                  <Button
                    key={plan}
                    type="button"
                    variant={plan === "white_glove" ? "primary" : "secondary"}
                    disabled={status === "loading"}
                    onClick={() => startCheckout(plan)}
                  >
                    {t.subscribe} {plan}
                  </Button>
                ))}
              </div>
            </>
          )}

          {hasActiveSubscription && billing.hasStripeCustomer && (
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={status === "loading"}
                onClick={openPortal}
              >
                {t.manageBilling}
              </Button>
            </div>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm text-red-600">{errorDetail ?? t.error}</p>
          )}
        </>
      )}
    </div>
  );
}