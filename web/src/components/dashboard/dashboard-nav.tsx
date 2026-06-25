"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Calendar, Contact, LayoutDashboard, LogOut, Phone, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", icon: LayoutDashboard, key: "today" as const },
  { href: "/dashboard/bookings", icon: Calendar, key: "bookings" as const },
  { href: "/dashboard/calls", icon: Phone, key: "calls" as const },
  { href: "/dashboard/leads", icon: Users, key: "leads" as const },
  { href: "/dashboard/customers", icon: Contact, key: "customers" as const },
  { href: "/dashboard/settings", icon: Settings, key: "settings" as const },
];

export function DashboardNav({
  dict,
  businessName,
}: {
  dict: Dictionary;
  businessName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="z-40 flex w-full shrink-0 flex-col border-b border-[var(--border)] bg-[var(--surface)] lg:fixed lg:inset-y-0 lg:h-dvh lg:w-64 lg:border-b-0 lg:border-r">
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5">
        <Logo href="/" size={32} className="w-fit" />
        <p
          className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-[var(--foreground)] sm:text-base"
          title={businessName}
        >
          {businessName}
        </p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-wrap gap-1 px-3 py-3 lg:flex-col lg:flex-nowrap lg:overflow-y-auto lg:py-4">
        {links.map(({ href, icon: Icon, key }) => {
          const active =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:shrink",
                active
                  ? "bg-[var(--primary-light)] text-[var(--primary)]"
                  : "text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{dict.dashboard.nav[key]}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-fg)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>{dict.dashboard.nav.logout}</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}