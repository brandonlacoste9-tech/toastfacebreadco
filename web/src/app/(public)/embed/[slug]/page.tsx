import { EmbedLeadForm } from "@/components/public/embed-lead-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveBusinessBySlug } from "@/lib/public/resolve-business";
import { notFound } from "next/navigation";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  const dict = getDictionary(business.default_language === "en" ? "en" : "fr");
  const t = dict.dashboard.embedForm;

  return (
    <EmbedLeadForm
      slug={business.slug}
      labels={{
        title: business.name,
        name: t.name,
        phone: t.phone,
        notes: t.notes,
        submit: t.submit,
        success: t.success,
        error: t.error,
      }}
    />
  );
}