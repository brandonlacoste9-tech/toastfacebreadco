import { CustomersList } from "@/components/dashboard/customers-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  let customers: Parameters<typeof CustomersList>[0]["customers"] = [];

  if (supabase) {
    const { data } = await supabase
      .from("customers")
      .select("id, full_name, phone, email, created_at")
      .eq("business_id", ctx.businessId)
      .order("created_at", { ascending: false })
      .limit(200);

    customers = data ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        {t.dashboard.nav.customers}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.dashboard.customers.subtitle}</p>
      <div className="mt-6">
        <CustomersList dict={t} customers={customers} locale={locale} />
      </div>
    </div>
  );
}