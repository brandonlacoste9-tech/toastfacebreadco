import { Sparkles, CheckCircle2 } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function VicParkPromoPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0a] font-sans selection:bg-[#d4af37]/30">
      
      {/* Subtle background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] opacity-70 blur-3xl" />

      {/* Main Card */}
      <main className="relative z-10 w-full max-w-[400px] px-6">
        <div className="flex flex-col items-center rounded-[32px] border border-white/5 bg-[#141414]/80 p-8 pt-12 pb-10 shadow-2xl backdrop-blur-xl">
          
          {/* Top Sparkle Icon */}
          <div className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#eec974] to-[#c19535] p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#b08d26] border border-white/20">
              <Sparkles className="h-6 w-6 text-black" fill="currentColor" />
            </div>
          </div>

          {/* Logo Section */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              {/* Concentric circles SVG recreating the VP logo */}
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1" strokeOpacity="0.8"/>
                <circle cx="20" cy="20" r="14" stroke="white" strokeWidth="1" strokeOpacity="0.8"/>
                <circle cx="20" cy="20" r="10" stroke="white" strokeWidth="1" strokeOpacity="0.8"/>
                <circle cx="20" cy="20" r="6" fill="white"/>
              </svg>
              <div className="flex flex-col">
                <span className="font-sans text-[16px] font-light leading-none tracking-widest text-white uppercase">Victoria Park</span>
                <span className="font-sans text-[14px] font-medium leading-none tracking-widest text-white mt-1 uppercase">Médispa</span>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="mt-14 flex flex-col items-center text-center">
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">
              Digital Concierge
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-white/70">
              Experience our intelligent AI assistant. Trained on our clinical protocols, it is ready to answer questions and secure your consultation instantly.
            </p>
          </div>

          {/* Buttons Section */}
          <div className="mt-10 flex w-full flex-col gap-4">
            <VapiWebCallButton 
              className="shadow-[0_0_30px_rgba(212,175,55,0.25)] ring-1 ring-white/10"
              assistantOverrides={{
                name: "Victoria Park Medispa",
                services: [
                  { id: "vp_botox", name: "Botox & Dysport Injections", duration_minutes: 30, price_cents: 50000 },
                  { id: "vp_fraxel", name: "Fraxel Laser Skin Rejuvenation", duration_minutes: 60, price_cents: 80000 },
                  { id: "vp_coolsculpt", name: "CoolSculpting Body Contouring", duration_minutes: 90, price_cents: 120000 },
                  { id: "vp_prp", name: "PRP Hair Loss Consultation", duration_minutes: 45, price_cents: 40000 }
                ],
                voiceGreeting: "Welcome to Victoria Park Medispa, how can I elevate your aesthetic journey today?"
              }}
            />

            <Link 
              href="/dashboard"
              className="flex items-center justify-center rounded-full bg-white/5 border border-white/5 px-8 py-4 text-sm font-bold tracking-wider text-white transition-all hover:bg-white/10"
            >
              VIEW DASHBOARD
            </Link>
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Availability Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-white/40">
            <CheckCircle2 className="h-3 w-3" />
            <span>Available 24/7 in English & Français</span>
          </div>

        </div>

        {/* Outer Footer */}
        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Staff Login
          </Link>
        </div>
      </main>

      {/* Hidden Theme Toggle for dev purposes */}
      <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100">
        <ThemeToggle />
      </div>

    </div>
  );
}
