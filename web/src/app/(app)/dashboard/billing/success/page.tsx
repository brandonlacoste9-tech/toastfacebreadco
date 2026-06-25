import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import Link from "next/link";

export default async function BillingSuccessPage() {
  await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        {t.dashboard.billing.successTitle}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted-fg)]">{t.dashboard.billing.successBody}</p>
      <Link
        href="/dashboard/settings"
        className="btn-primary mt-8 inline-block px-6 py-3 text-sm"
      >
        {t.dashboard.billing.backToSettings}
      </Link>
    </div>
  );
}