import type { Locale } from "@/lib/i18n/types";
import { Calendar, Phone, TrendingUp } from "lucide-react";

export function DashboardMockup({ locale }: { locale: Locale }) {
  const fr = locale === "fr";

  return (
    <div className="card-dark relative overflow-hidden p-5 shadow-[var(--shadow-hero)] sm:p-6">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--hero-glow)] blur-2xl" />

      <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            {fr ? "Tableau de bord" : "Dashboard"}
          </p>
          <p className="font-display mt-1 text-lg font-semibold text-white">
            {fr ? "Aujourd'hui" : "Today"}
          </p>
        </div>
        <span className="rounded-full bg-[var(--teal)]/20 px-3 py-1 text-xs font-medium text-emerald-300">
          {fr ? "En direct" : "Live"}
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-3">
        {[
          {
            icon: Phone,
            value: "3",
            label: fr ? "Appels récupérés" : "Calls recovered",
            color: "text-amber-300",
          },
          {
            icon: Calendar,
            value: "8",
            label: fr ? "Rendez-vous" : "Bookings",
            color: "text-sky-300",
          },
          {
            icon: TrendingUp,
            value: "$420",
            label: fr ? "Revenus" : "Revenue",
            color: "text-emerald-300",
          },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="rounded-xl bg-white/5 p-3">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="font-display mt-2 text-xl font-bold text-white">{value}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-4 space-y-2">
        {[
          { time: "14:00", name: fr ? "Sophie L." : "Sophie L.", service: fr ? "Coupe + couleur" : "Cut + colour" },
          { time: "15:30", name: fr ? "Marc T." : "Marc T.", service: fr ? "Manucure" : "Manicure" },
        ].map((appt) => (
          <div
            key={appt.time}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5"
          >
            <span className="text-xs font-medium text-white/40">{appt.time}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{appt.name}</p>
              <p className="truncate text-xs text-white/45">{appt.service}</p>
            </div>
            <span className="shrink-0 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              {fr ? "Confirmé" : "Confirmed"}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
          <Phone className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <p className="text-xs font-medium text-amber-200/80">
            {fr ? "Appel manqué → réservé" : "Missed call → booked"}
          </p>
          <p className="mt-0.5 text-sm text-white/90">
            {fr
              ? "« Bonjour, je voudrais une coupe demain… »"
              : "« Hi, I'd like a haircut tomorrow… »"}
          </p>
        </div>
      </div>
    </div>
  );
}