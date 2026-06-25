import { LoginForm } from "@/components/auth/login-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { Suspense } from "react";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <SectionHeading title={t.login.title} description={t.login.subtitle} />
        <div className="card mt-8 p-6 sm:p-8">
          <Suspense fallback={<p className="text-sm text-[var(--muted-fg)]">Loading…</p>}>
            <LoginForm dict={t} locale={locale} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}