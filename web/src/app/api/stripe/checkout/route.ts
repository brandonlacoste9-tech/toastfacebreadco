import { getApiUser } from "@/lib/auth/api-auth";
import { getSiteUrl } from "@/lib/site-config";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import {
  getPriceId,
  isValidPlan,
  remainingTrialDays,
  type BillingInterval,
} from "@/lib/stripe/plans";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId, user } = auth;

  const body = await req.json();
  const plan = body.plan as string;
  const interval = (body.interval === "year" ? "year" : "month") as BillingInterval;

  if (!isValidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan, interval);
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 503 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("stripe_customer_id, trial_ends_at, default_language")
    .eq("id", businessId)
    .single();

  const { data: profile } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const siteUrl = getSiteUrl();
  const trialDays = remainingTrialDays(business?.trial_ends_at ?? null);
  const locale = business?.default_language === "en" ? "en" : "fr";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: business?.stripe_customer_id ?? undefined,
      customer_email: business?.stripe_customer_id
        ? undefined
        : (profile?.email ?? user.email ?? undefined),
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { business_id: businessId, plan },
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
      },
      automatic_tax: { enabled: true },
      billing_address_collection: "required",
      customer_update: { address: "auto" },
      tax_id_collection: { enabled: true },
      locale: locale === "fr" ? "fr-CA" : "en",
      success_url: `${siteUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/settings?billing=canceled`,
      metadata: { business_id: businessId, plan, interval },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Checkout session missing URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}