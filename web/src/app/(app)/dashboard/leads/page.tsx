import { LeadForm } from "@/components/dashboard/lead-form";
import { LeadsList } from "@/components/dashboard/leads-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  let leads: Parameters<typeof LeadsList>[0]["leads"] = [];

  if (supabase) {
    const { data } = await supabase
      .from("leads")
      .select("id, contact_name, contact_phone, source, pipeline_stage, notes, captured_at, metadata")
      .eq("business_id", ctx.businessId)
      .order("captured_at", { ascending: false })
      .limit(100);

    leads = data ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <LeadForm dict={t} />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {t.dashboard.nav.leads}
          </h1>
          <div className="mt-6">
            <LeadsList dict={t} leads={leads} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}