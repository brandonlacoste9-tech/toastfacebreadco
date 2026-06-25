import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey(): string | null {
  return process.env.STRIPE_SECRET_KEY?.trim() || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(getStripeSecretKey());
}

export function getStripe(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}