import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { FounderBanner } from "@/components/marketing/founder-banner";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <>
      <Header locale={locale} />
      <FounderBanner locale={locale} />
      <main>{children}</main>
      <Footer locale={locale} />
    </>
  );
}