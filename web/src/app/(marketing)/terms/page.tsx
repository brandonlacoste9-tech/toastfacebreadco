import { LegalPage } from "@/components/legal/legal-page";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return <LegalPage dict={t} type="terms" />;
}