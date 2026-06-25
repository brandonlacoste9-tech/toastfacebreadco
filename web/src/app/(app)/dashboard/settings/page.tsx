import { BillingCard } from "@/components/dashboard/billing-card";
import { OutboundSmsBanner } from "@/components/dashboard/outbound-sms-banner";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";
import { EmbedCard } from "@/components/dashboard/embed-card";
import { StaffCard } from "@/components/dashboard/staff-card";
import { VoiceSettingsCard } from "@/components/dashboard/voice-settings-card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { isStripeConfigured } from "@/lib/stripe/client";
import { getTwilioPhoneNumber } from "@/lib/twilio/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUsageSnapshot } from "@/lib/usage/get-usage";
import { getOutboundSmsStatus } from "@/lib/usage/outbound-sms-status";
import { Suspense } from "react";

export default async function SettingsPage() {
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  let assistantId: string | null = null;
  let phoneNumber: string | null = null;
  let slug = "";
  let voiceGreeting: string | null = null;
  let voiceInstructions: string | null = null;
  let aiPersonality = "friendly";
  let bilingualMode = false;
  let staffRows: { id: string; display_name: string; active: boolean }[] = [];
  let profile = {
    name: ctx.businessName,
    city: null as string | null,
    industry: null as string | null,
    default_language: ctx.defaultLanguage,
    working_hours: {} as Record<string, { open: string; close: string }>,
    forward_to_number: null as string | null,
    phone_number: null as string | null,
    services: [] as {
      id: string;
      name: string;
      duration_minutes: number;
      price_cents: number;
    }[],
  };

  if (supabase) {
    const { data } = await supabase
      .from("businesses")
      .select(
        "name, city, default_language, working_hours, forward_to_number, vapi_assistant_id, phone_number, slug, voice_greeting, voice_instructions, industry, ai_personality, bilingual_mode"
      )
      .eq("id", ctx.businessId)
      .single();

    if (data) {
      assistantId = data.vapi_assistant_id ?? null;
      phoneNumber = data.phone_number ?? null;
      slug = (data.slug as string) ?? "";
      voiceGreeting = (data.voice_greeting as string | null) ?? null;
      voiceInstructions = (data.voice_instructions as string | null) ?? null;
      aiPersonality = (data.ai_personality as string | null) ?? "friendly";
      bilingualMode = Boolean(data.bilingual_mode);
      profile = {
        name: data.name,
        city: data.city,
        industry: data.industry,
        default_language: data.default_language,
        working_hours: (data.working_hours as typeof profile.working_hours) ?? {},
        forward_to_number: data.forward_to_number,
        phone_number: data.phone_number,
        services: [],
      };
    }

    const { data: services } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents")
      .eq("business_id", ctx.businessId)
      .eq("active", true)
      .order("name");

    profile.services = services ?? [];

    const { data: staffData } = await supabase
      .from("staff")
      .select("id, display_name, active")
      .eq("business_id", ctx.businessId)
      .eq("active", true)
      .order("display_name");
    staffRows = staffData ?? [];
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.URL?.trim() ||
    "https://justbookme.ca";

  let billing = {
    plan: ctx.plan,
    trialEndsAt: ctx.trialEndsAt,
    subscriptionStatus: null as string | null,
    currentPeriodEnd: null as string | null,
    hasStripeCustomer: false,
    stripeConfigured: isStripeConfigured(),
    usage: null as Awaited<ReturnType<typeof getUsageSnapshot>> | null,
    pendingSubscribePlan: null as string | null,
  };

  if (supabase) {
    const { data: bizBilling } = await supabase
      .from("businesses")
      .select("plan, trial_ends_at, stripe_customer_id")
      .eq("id", ctx.businessId)
      .single();

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("business_id", ctx.businessId)
      .maybeSingle();

    const plan = sub?.plan ?? bizBilling?.plan ?? ctx.plan;
    const subStatus = sub?.status ?? null;
    const subPlan = sub?.plan ?? plan;
    billing = {
      plan: subPlan,
      trialEndsAt: bizBilling?.trial_ends_at ?? ctx.trialEndsAt,
      subscriptionStatus: subStatus,
      currentPeriodEnd: sub?.current_period_end ?? null,
      hasStripeCustomer: Boolean(bizBilling?.stripe_customer_id),
      stripeConfigured: isStripeConfigured(),
      usage: await getUsageSnapshot({ supabase, businessId: ctx.businessId, plan: subPlan }),
      pendingSubscribePlan:
        subStatus !== "active" && subStatus !== "trialing" && subPlan !== "trial"
          ? subPlan
          : null,
    };
  }

  const smsStatus = await getOutboundSmsStatus(ctx.businessId);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
        {t.dashboard.nav.settings}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-fg)]">{t.dashboard.settings.subtitle}</p>

      <OutboundSmsBanner dict={t} status={smsStatus} />

      <dl className="card mt-8 divide-y divide-[var(--border)]">
        {[
          { label: t.dashboard.settings.email, value: ctx.email },
          { label: t.dashboard.settings.plan, value: ctx.plan },
        ].map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-5 py-4 sm:grid-cols-[minmax(0,10rem)_1fr] sm:items-center sm:gap-4"
          >
            <dt className="text-sm text-[var(--muted-fg)]">{row.label}</dt>
            <dd className="break-words text-sm font-medium text-[var(--foreground)]">{row.value}</dd>
          </div>
        ))}
      </dl>

      <BusinessSettingsForm dict={t} locale={locale} initial={profile} />

      <VoiceSettingsCard
        dict={t}
        locale={locale}
        assistantId={assistantId}
        phoneNumber={phoneNumber}
        platformPhone={getTwilioPhoneNumber()}
        initialGreeting={voiceGreeting}
        initialInstructions={voiceInstructions}
        initialPersonality={aiPersonality}
        initialBilingual={bilingualMode}
      />

      <StaffCard dict={t} initial={staffRows} />

      {slug && <EmbedCard dict={t} slug={slug} siteUrl={siteUrl} />}

      <Suspense fallback={null}>
        <BillingCard dict={t} locale={locale} billing={billing} />
      </Suspense>
    </div>
  );
}