"use client";

import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function LanguageToggle({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-semibold",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {(["fr", "en"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          className={cn(
            "rounded-md px-2.5 py-1.5 uppercase transition-all",
            locale === lang
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted-fg)] hover:text-[var(--foreground)]"
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}