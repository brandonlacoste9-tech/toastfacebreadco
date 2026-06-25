import { SectionHeading } from "@/components/marketing/section-heading";
import { SignupForm } from "@/components/signup/signup-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import Link from "next/link";
import { Suspense } from "react";

export default async function SignupPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <SectionHeading title={t.signup.title} description={t.signup.subtitle} />

        <div className="card mt-8 p-6 sm:p-8">
          <Suspense fallback={<p className="text-sm text-[var(--muted-fg)]">Loading…</p>}>
            <SignupForm dict={t} locale={locale} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted-fg)]">
          {t.signup.hasAccount}{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </div>
    </section>
  );
}