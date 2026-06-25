import { planFromPriceId } from "@/lib/stripe/plans";
import { getSupabaseService } from "@/lib/supabase/server";
import type Stripe from "stripe";

function periodEndIso(sub: Stripe.Subscription): string | null {
  const ends = sub.items.data
    .map((item) => item.current_period_end)
    .filter((n): n is number => typeof n === "number");
  const end = ends.length ? Math.max(...ends) : null;
  return end ? new Date(end * 1000).toISOString() : null;
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  const businessId = session.metadata?.business_id;
  const plan = session.metadata?.plan;
  if (!businessId) return;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (customerId) {
    await supabase
      .from("businesses")
      .update({
        stripe_customer_id: customerId,
        ...(plan ? { plan } : {}),
      })
      .eq("id", businessId);
  }

  if (subscriptionId) {
    await supabase.from("subscriptions").upsert(
      {
        business_id: businessId,
        stripe_subscription_id: subscriptionId,
        status: "trialing",
        plan: plan ?? "starter",
      },
      { onConflict: "business_id" }
    );
  }
}

export async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  const businessId = sub.metadata?.business_id;
  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? planFromPriceId(priceId) : null;

  const row = {
    status: sub.status,
    plan: plan ?? sub.metadata?.plan ?? "pro",
    current_period_end: periodEndIso(sub),
    stripe_subscription_id: sub.id,
  };

  if (businessId) {
    await supabase.from("subscriptions").upsert(
      { business_id: businessId, ...row },
      { onConflict: "business_id" }
    );
    if (plan) {
      await supabase.from("businesses").update({ plan }).eq("id", businessId);
    }
  } else {
    await supabase.from("subscriptions").update(row).eq("stripe_subscription_id", sub.id);
    if (plan) {
      const { data } = await supabase
        .from("subscriptions")
        .select("business_id")
        .eq("stripe_subscription_id", sub.id)
        .single();
      if (data?.business_id) {
        await supabase.from("businesses").update({ plan }).eq("id", data.business_id);
      }
    }
  }
}

export async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", sub.id);

  const businessId = sub.metadata?.business_id;
  if (businessId) {
    await supabase.from("businesses").update({ plan: "trial" }).eq("id", businessId);
    return;
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("business_id")
    .eq("stripe_subscription_id", sub.id)
    .single();
  if (data?.business_id) {
    await supabase.from("businesses").update({ plan: "trial" }).eq("id", data.business_id);
  }
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getSupabaseService();
  if (!supabase) return;

  const subRef = invoice.parent?.subscription_details?.subscription;
  const subId = typeof subRef === "string" ? subRef : subRef?.id;
  if (!subId) return;

  await supabase.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
}