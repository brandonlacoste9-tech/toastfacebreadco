import type { Locale } from "@/lib/i18n/types";
import { Quote } from "lucide-react";

export function SocialProof({ locale }: { locale: Locale }) {
  const fr = locale === "fr";

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface)] py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="section-label text-center">
          {fr ? "Salons & barbershops" : "Salons & barbershops"}
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              stat: "25–40%",
              label: fr ? "Appels manqués en heures de pointe" : "Missed calls at peak hours",
            },
            {
              stat: "$1 600",
              label: fr ? "Perdus par mois (5 appels/semaine)" : "Lost per month (5 calls/week)",
            },
            {
              stat: "14 j",
              label: fr ? "Essai gratuit, sans carte" : "Free trial, no card",
            },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-3xl font-bold text-[var(--primary)]">{item.stat}</p>
              <p className="mt-2 text-sm text-[var(--muted-fg)]">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="card mx-auto mt-10 max-w-2xl p-6">
          <Quote className="h-5 w-5 text-[var(--accent)]" />
          <p className="mt-3 text-[var(--foreground)] italic leading-relaxed">
            {fr
              ? "« On manque 5 à 8 appels par jour quand le salon est plein. Si l'IA en récupère la moitié, ça paie l'abonnement en une semaine. »"
              : "« We miss 5–8 calls a day when we're fully booked. If AI recovers half, the subscription pays for itself in a week. »"}
          </p>
          <p className="mt-3 text-sm text-[var(--muted-fg)]">
            — {fr ? "Propriétaire de salon, Montréal" : "Salon owner, Montreal"}
            <span className="ml-2 rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs">
              {fr ? "Entrevue pilote" : "Pilot interview"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}