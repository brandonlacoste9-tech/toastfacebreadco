import type { SupabaseClient } from "@supabase/supabase-js";

export type SetupCheckItem = {
  id: string;
  done: boolean;
  href: string;
};

export type SetupChecklist = {
  items: SetupCheckItem[];
  completed: number;
  total: number;
  allDone: boolean;
};

export async function getSetupChecklist(
  supabase: SupabaseClient,
  businessId: string
): Promise<SetupChecklist> {
  const [{ data: business }, { count: serviceCount }] = await Promise.all([
    supabase
      .from("businesses")
      .select("slug, vapi_assistant_id, working_hours, voice_greeting")
      .eq("id", businessId)
      .single(),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("active", true),
  ]);

  const hours = business?.working_hours as Record<string, unknown> | null;
  const hasHours = Boolean(hours && Object.keys(hours).length > 0);
  const hasSlug = Boolean(business?.slug?.trim());
  const hasVoice = Boolean(business?.vapi_assistant_id);
  const hasServices = (serviceCount ?? 0) > 0;
  const hasGreeting = Boolean(business?.voice_greeting?.trim());

  const items: SetupCheckItem[] = [
    { id: "services", done: hasServices, href: "/dashboard/settings" },
    { id: "hours", done: hasHours, href: "/dashboard/settings" },
    { id: "voice", done: hasVoice, href: "/dashboard/settings" },
    { id: "greeting", done: hasGreeting, href: "/dashboard/settings" },
    { id: "bookPage", done: hasSlug, href: "/dashboard/settings" },
  ];

  const completed = items.filter((i) => i.done).length;

  return {
    items,
    completed,
    total: items.length,
    allDone: completed === items.length,
  };
}