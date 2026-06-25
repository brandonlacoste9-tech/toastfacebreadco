import { PricingSection } from "@/components/pricing/pricing-section";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function PricingPage() {
  const locale = await getLocale();
  return <PricingSection locale={locale} />;
}