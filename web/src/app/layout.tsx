import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BRAND_NAME, getSiteUrl } from "@/lib/site-config";
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const siteUrl = getSiteUrl();
  return {
    title: t.meta.title,
    description: t.meta.description,
    keywords: [
      "AI receptionist",
      "Quebec AI",
      "Medispa AI",
      "Salon booking software",
      "Missed calls AI",
      "Bilingual AI receptionist",
      "JustBookMe",
    ],
    authors: [{ name: BRAND_NAME }],
    creator: BRAND_NAME,
    publisher: BRAND_NAME,
    icons: { icon: "/logo.svg", apple: "/logo.svg" },
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: siteUrl,
      siteName: BRAND_NAME,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
      images: [{ url: "/logo.svg", width: 512, height: 512, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary",
      title: t.meta.title,
      description: t.meta.description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale === "fr" ? "fr-CA" : "en-CA"} suppressHydrationWarning>
      <body className={`${dmSans.variable} ${fraunces.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}