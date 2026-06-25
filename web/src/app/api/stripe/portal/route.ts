import { getApiUser } from "@/lib/auth/api-auth";
import { getSiteUrl } from "@/lib/site-config";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { NextResponse } from "next/server";

export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const auth = await getApiUser();
  if ("error" in auth) return auth.error;
  const { supabase, businessId } = auth;

  const { data: business } = await supabase
    .from("businesses")
    .select("stripe_customer_id")
    .eq("id", businessId)
    .single();

  if (!business?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${getSiteUrl()}/dashboard/settings`,
  });

  return NextResponse.json({ url: session.url });
}