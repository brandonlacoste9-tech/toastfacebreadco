import { SectionHeading } from "@/components/marketing/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Scissors, Wrench, Building2 } from "lucide-react";

const ICONS = [Scissors, Wrench, Building2];

export function VerticalsSection({ dict }: { dict: Dictionary }) {
  const v = dict.verticals;

  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface-elevated)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading label={v.label} title={v.title} description={v.subtitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {v.items.map((item, i) => {
            const Icon = ICONS[i] ?? Scissors;
            return (
              <div key={item.title} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)]">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-fg)]">{item.desc}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-[var(--foreground)]">
                  {item.examples.map((ex) => (
                    <li key={ex} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}