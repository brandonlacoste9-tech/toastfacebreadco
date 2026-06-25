import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]/80 bg-[var(--background)]/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--muted-fg)] md:flex">
          <Link href="/pricing" className="transition-colors hover:text-[var(--primary)]">
            {t.nav.pricing}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageToggle locale={locale} />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--muted-fg)] transition-colors hover:text-[var(--primary)]"
          >
            {t.nav.login}
          </Link>
          <Link href="/signup" className="btn-primary px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
            {t.nav.trial}
          </Link>
        </div>
      </div>
    </header>
  );
}