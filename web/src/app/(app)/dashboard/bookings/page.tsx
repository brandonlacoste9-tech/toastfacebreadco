import { BookingForm } from "@/components/dashboard/booking-form";
import { BookingsList } from "@/components/dashboard/bookings-list";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { requireOnboardedContext } from "@/lib/auth/get-business-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireOnboardedContext();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const supabase = await createSupabaseServerClient();

  let bookings: Parameters<typeof BookingsList>[0]["bookings"] = [];
  let services: { id: string; name: string }[] = [];
  let staff: { id: string; display_name: string }[] = [];
  let leadPrefill: Parameters<typeof BookingForm>[0]["prefill"] = null;
  const leadId = params.lead ?? null;

  if (supabase) {
    if (leadId) {
      const { data: lead } = await supabase
        .from("leads")
        .select("contact_name, contact_phone, notes")
        .eq("id", leadId)
        .eq("business_id", ctx.businessId)
        .maybeSingle();
      if (lead) {
        leadPrefill = {
          customer_name: lead.contact_name,
          customer_phone: lead.contact_phone,
          notes: lead.notes,
        };
      }
    }

    const { data: appts } = await supabase
      .from("appointments")
      .select("id, customer_name, starts_at, status, service_id, notes, services(name), customers(phone)")
      .eq("business_id", ctx.businessId)
      .order("starts_at", { ascending: true })
      .limit(50);

    const [{ data: svc }, { data: staffRows }] = await Promise.all([
      supabase
        .from("services")
        .select("id, name")
        .eq("business_id", ctx.businessId)
        .eq("active", true),
      supabase
        .from("staff")
        .select("id, display_name")
        .eq("business_id", ctx.businessId)
        .eq("active", true)
        .order("display_name"),
    ]);

    bookings = (appts ?? []).map((a) => {
      const svcJoin = a.services as { name: string } | { name: string }[] | null;
      const service = Array.isArray(svcJoin) ? (svcJoin[0] ?? null) : svcJoin;
      const custJoin = a.customers as { phone: string | null } | { phone: string | null }[] | null;
      const customer = Array.isArray(custJoin) ? (custJoin[0] ?? null) : custJoin;
      return {
        id: a.id as string,
        customer_name: a.customer_name as string,
        customer_phone: customer?.phone ?? null,
        starts_at: a.starts_at as string,
        status: a.status as string,
        service_id: (a.service_id as string | null) ?? null,
        notes: (a.notes as string | null) ?? null,
        services: service,
      };
    });
    services = svc ?? [];
    staff = staffRows ?? [];
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <BookingForm dict={t} services={services} staff={staff} prefill={leadPrefill} leadId={leadId} />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {t.dashboard.nav.bookings}
          </h1>
          <div className="mt-6">
            <BookingsList dict={t} bookings={bookings} services={services} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}