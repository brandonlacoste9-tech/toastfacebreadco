import { CallsList } from "@/components/dashboard/calls-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CallsPage() {
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  let calls: Parameters<typeof CallsList>[0]["calls"] = [];

  if (supabase) {
    const { data } = await supabase
      .from("conversations")
      .select(
        "id, channel, from_number, started_at, duration_seconds, outcome, summary, transcript, recovered_revenue_cents"
      )
      .eq("business_id", ctx.businessId)
      .in("channel", ["voice", "sms"])
      .order("started_at", { ascending: false })
      .limit(50);

    calls = (data ?? []) as typeof calls;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        {t.dashboard.nav.calls}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.dashboard.calls.historySubtitle}</p>
      <div className="mt-6">
        <CallsList dict={t} calls={calls} locale={locale} />
      </div>
    </div>
  );
}