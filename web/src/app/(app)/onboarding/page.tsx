import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireBusinessContext } from "@/lib/auth/get-business-context";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const ctx = await requireBusinessContext();
  if (ctx.onboardingCompleted) redirect("/dashboard");

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <section className="px-4 py-12 sm:px-8">
      <h1 className="font-display text-center text-2xl font-semibold text-[var(--foreground)]">
        {t.onboarding.title}
      </h1>
      <p className="mt-2 text-center text-sm text-[var(--muted-fg)]">{t.onboarding.subtitle}</p>
      <OnboardingWizard dict={t} locale={locale} />
    </section>
  );
}