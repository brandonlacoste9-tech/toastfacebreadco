import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireBusinessContext } from "@/lib/auth/get-business-context";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ctx = await requireBusinessContext();
  const locale = await getLocale();
  const t = getDictionary(locale);

  if (!ctx.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-dvh lg:pl-64">
      <DashboardNav dict={t} businessName={ctx.businessName} />
      <main className="min-w-0 overflow-x-hidden px-4 py-6 pb-12 sm:px-8 sm:py-8">
        {children}
      </main>
    </div>
  );
}