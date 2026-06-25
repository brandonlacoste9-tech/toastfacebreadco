import { getDictionary } from "@/lib/i18n/dictionaries";
import { getContactEmail } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n/types";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--primary)] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <Logo showWordmark variant="light" />
            <p className="font-display mt-6 text-2xl font-semibold">{t.footer.cta}</p>
            <p className="mt-2 text-sm text-white/60">{t.footer.rights}</p>
          </div>
          <Link href="/signup" className="btn-primary px-6 py-3 text-sm">
            {locale === "fr" ? "S'inscrire" : "Sign up"}
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-8 text-sm text-white/50">
          <Link href="/privacy" className="transition-colors hover:text-white">
            {t.footer.privacy}
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            {t.footer.terms}
          </Link>
          <a href={`mailto:${getContactEmail()}`} className="transition-colors hover:text-white">
            {getContactEmail()}
          </a>
        </div>
      </div>
    </footer>
  );
}