import { PublicBookingForm } from "@/components/public/public-booking-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublicServices } from "@/lib/public/public-booking";
import { resolveBusinessBySlug } from "@/lib/public/resolve-business";
import { getSupabaseService } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await resolveBusinessBySlug(slug);
  if (!business) notFound();

  const db = getSupabaseService();
  const services = db ? await getPublicServices(db, business.id) : [];

  const dict = getDictionary(business.default_language === "en" ? "en" : "fr");
  const t = dict.dashboard.publicBook;

  return (
    <PublicBookingForm
      slug={business.slug}
      businessName={business.name}
      services={services}
      labels={{
        title: t.title,
        name: t.name,
        phone: t.phone,
        email: t.email,
        service: t.service,
        date: t.date,
        time: t.time,
        notes: t.notes,
        submit: t.submit,
        success: t.success,
        error: t.error,
        noSlots: t.noSlots,
        pickService: t.pickService,
      }}
    />
  );
}