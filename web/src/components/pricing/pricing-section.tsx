"use client";

import { SectionHeading } from "@/components/marketing/section-heading";
import { getDictionary, PLAN_PRICES } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PlanKey = keyof typeof PLAN_PRICES;

export function PricingSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [annual, setAnnual] = useState(false);

  const plans: { key: PlanKey; popular?: boolean }[] = [
    { key: "starter" },
    { key: "white_glove", popular: true },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="section-label">{locale === "fr" ? "Forfaits" : "Plans"}</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-fg)]">{t.pricing.subtitle}</p>

          <div className="mt-10 inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                !annual
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
              )}
            >
              {t.pricing.monthly}
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
                annual
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
              )}
            >
              {t.pricing.annual}
              <span className="ml-1.5 text-xs opacity-80">({t.pricing.save})</span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
          {plans.map(({ key, popular }) => {
            const prices = PLAN_PRICES[key];
            const monthlyDisplay = annual ? Math.round(prices.annual / 12) : prices.monthly;
            const planCopy = t.pricing.plans[key];

            return (
              <div
                key={key}
                className={cn(
                  "card relative flex flex-col p-7 transition-transform hover:-translate-y-1",
                  popular && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
                )}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-1 text-xs font-bold uppercase tracking-wide text-[var(--foreground)]">
                    {t.pricing.popular}
                  </span>
                )}
                <h2 className="font-display text-xl font-semibold">{planCopy.name}</h2>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold text-[var(--primary)]">
                    ${monthlyDisplay}
                  </span>
                  <span className="text-[var(--muted-fg)]">{t.pricing.perMonth}</span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-[var(--muted-fg)]">
                    ${prices.annual} {t.pricing.billedYearly}
                  </p>
                )}
                <ul className="mt-8 flex-1 space-y-3 border-t border-[var(--border)] pt-6">
                  {planCopy.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={key === "white_glove" ? "mailto:info@tryjustbookme.com" : `/signup?plan=${key}&interval=${annual ? "year" : "month"}`}
                  className={cn(
                    "mt-8 block rounded-xl py-3.5 text-center text-sm font-semibold transition-all",
                    popular ? "btn-primary" : "btn-secondary"
                  )}
                >
                  {key === "white_glove" ? t.pricing.contact : t.pricing.cta}
                </Link>
                {key === "white_glove" && (
                  <Link href="/vicpark" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline group">
                    <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    {locale === "fr" ? "Voir un exemple sur mesure" : "View a custom live build"}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-[var(--muted-fg)]">{t.pricing.trialNote}</p>
        <p className="mt-2 text-center text-xs text-[var(--muted-fg)]">{t.pricing.taxNote}</p>

        <div className="mx-auto mt-16 max-w-2xl">
          <SectionHeading title={t.pricing.faqTitle} />
          <dl className="mt-8 space-y-4">
            {t.pricing.billingFaq.map((item) => (
              <div key={item.q} className="card p-5">
                <dt className="font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}