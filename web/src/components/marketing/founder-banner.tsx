import type { Locale } from "@/lib/i18n/types";
import { Sparkles } from "lucide-react";

export function FounderBanner({ locale }: { locale: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="border-b border-[var(--accent)]/30 bg-[var(--accent-light)]">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-sm sm:px-6">
        <Sparkles className="hidden h-4 w-4 shrink-0 text-[var(--accent-hover)] sm:block" />
        <p className="font-medium text-[var(--foreground)]">
          {fr ? (
            <>
              <span className="text-[var(--accent-hover)]">10 places fondateur</span> — configuration
              gratuite + 30 % de rabais à vie pour les premiers salons et barbershops du Québec
            </>
          ) : (
            <>
              <span className="text-[var(--accent-hover)]">10 founder spots</span> — free setup + 30%
              off for life for the first Quebec salons & barbershops
            </>
          )}
        </p>
      </div>
    </div>
  );
}