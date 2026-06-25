import { CallsList } from "@/components/dashboard/calls-list";
import { OutboundSmsBanner } from "@/components/dashboard/outbound-sms-banner";
import { SetupChecklistCard } from "@/components/dashboard/setup-checklist-card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { getSetupChecklist } from "@/lib/onboarding/setup-checklist";
import { getOutboundSmsStatus } from "@/lib/usage/outbound-sms-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Calendar, DollarSign, Phone, TrendingUp, UserX } from "lucide-react";

export default async function DashboardPage() {
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let bookingsToday = 0;
  let activeLeads = 0;
  let voiceCallsToday = 0;
  let aiBookingsToday = 0;
  let recoveredRevenueCents = 0;
  let noShowsToday = 0;
  let calls: Parameters<typeof CallsList>[0]["calls"] = [];
  let checklist = null as Awaited<ReturnType<typeof getSetupChecklist>> | null;
  let bookUrl: string | null = null;
  const smsStatus = await getOutboundSmsStatus(ctx.businessId);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.URL?.trim() ||
    "https://justbookme.ca";

  if (supabase) {
    checklist = await getSetupChecklist(supabase, ctx.businessId);

    const { data: slugRow } = await supabase
      .from("businesses")
      .select("slug")
      .eq("id", ctx.businessId)
      .single();
    if (slugRow?.slug) {
      bookUrl = `${siteUrl.replace(/\/$/, "")}/book/${slugRow.slug}`;
    }
    const { count: apptCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("business_id", ctx.businessId)
      .gte("starts_at", todayStart.toISOString())
      .lte("starts_at", todayEnd.toISOString())
      .neq("status", "cancelled");

    const { count: leadCount } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("business_id", ctx.businessId)
      .in("pipeline_stage", ["new", "contacted"]);

    const { count: noShowCount } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("business_id", ctx.businessId)
      .eq("status", "no_show")
      .gte("starts_at", todayStart.toISOString())
      .lte("starts_at", todayEnd.toISOString());

    bookingsToday = apptCount ?? 0;
    activeLeads = leadCount ?? 0;
    noShowsToday = noShowCount ?? 0;

    const { data: convos, count: callCount } = await supabase
      .from("conversations")
      .select(
        "id, channel, from_number, started_at, duration_seconds, outcome, summary, transcript, recovered_revenue_cents",
        { count: "exact" }
      )
      .eq("business_id", ctx.businessId)
      .in("channel", ["voice", "sms"])
      .gte("started_at", todayStart.toISOString())
      .lte("started_at", todayEnd.toISOString())
      .order("started_at", { ascending: false })
      .limit(15);

    voiceCallsToday = callCount ?? 0;
    calls = (convos ?? []) as typeof calls;
    aiBookingsToday = calls.filter((c) => c.outcome === "booked").length;
    recoveredRevenueCents = calls.reduce(
      (sum, c) => sum + (c.recovered_revenue_cents ?? 0),
      0
    );
  }

  const recoveredLabel =
    recoveredRevenueCents > 0
      ? (recoveredRevenueCents / 100).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", {
          style: "currency",
          currency: "CAD",
          maximumFractionDigits: 0,
        })
      : "$0";

  const stats = [
    {
      label: t.dashboard.stats.bookingsToday,
      value: String(bookingsToday),
      icon: Calendar,
      accent: "text-[var(--primary)]",
      bg: "bg-[var(--primary-light)]",
    },
    {
      label: t.dashboard.stats.voiceCallsToday,
      value: String(voiceCallsToday),
      icon: Phone,
      accent: "text-[var(--accent-hover)]",
      bg: "bg-[var(--accent-light)]",
    },
    {
      label: t.dashboard.stats.recoveredCalls,
      value: String(aiBookingsToday),
      icon: TrendingUp,
      accent: "text-[var(--teal)]",
      bg: "bg-[var(--teal-light)]",
    },
    {
      label: t.dashboard.stats.recoveredRevenue,
      value: recoveredLabel,
      icon: DollarSign,
      accent: "text-[var(--primary)]",
      bg: "bg-[var(--primary-light)]",
    },
    {
      label: t.dashboard.stats.noShowsToday,
      value: String(noShowsToday),
      icon: UserX,
      accent: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: t.dashboard.stats.activeLeads,
      value: String(activeLeads),
      icon: TrendingUp,
      accent: "text-[var(--muted-fg)]",
      bg: "bg-[var(--muted)]",
    },
  ];

  const trialLabel = ctx.trialEndsAt
    ? new Date(ctx.trialEndsAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")
    : "—";

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        {t.dashboard.title}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.dashboard.subtitle}</p>

      <OutboundSmsBanner dict={t} status={smsStatus} />

      {checklist && (
        <SetupChecklistCard dict={t} checklist={checklist} bookUrl={bookUrl} />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card min-w-0 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon className={`h-5 w-5 ${stat.accent}`} />
                </div>
                <span className="font-display text-2xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </span>
              </div>
              <p className="mt-3 break-words text-sm text-[var(--muted-fg)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold text-[var(--foreground)]">{t.dashboard.calls.title}</h2>
        <div className="mt-4">
          <CallsList dict={t} calls={calls} locale={locale} />
        </div>
      </div>

      <div className="card mt-8 p-6">
        <h2 className="font-semibold text-[var(--foreground)]">{t.dashboard.trial.title}</h2>
        <p className="mt-2 text-sm text-[var(--muted-fg)]">
          {t.dashboard.trial.plan}: <span className="font-medium capitalize">{ctx.plan}</span>
        </p>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">
          {t.dashboard.trial.ends}: {trialLabel}
        </p>
      </div>
    </div>
  );
}