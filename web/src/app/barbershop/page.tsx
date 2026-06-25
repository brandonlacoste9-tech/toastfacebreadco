import { Scissors, CheckCircle2 } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BarbershopPromoPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a0a] font-sans selection:bg-[#d4af37]/30">
      
      {/* Subtle background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)] opacity-70 blur-3xl" />

      {/* Main Card */}
      <main className="relative z-10 w-full max-w-[400px] px-6">
        <div className="flex flex-col items-center rounded-[32px] border border-white/5 bg-[#141414]/80 p-8 pt-12 pb-10 shadow-2xl backdrop-blur-xl">
          
          {/* Top Scissors Icon */}
          <div className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#eec974] to-[#c19535] p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#b08d26] border border-white/20">
              <Scissors className="h-6 w-6 text-black" fill="currentColor" />
            </div>
          </div>

          {/* Logo Section */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-center">
                <span className="font-sans text-[20px] font-bold leading-none tracking-widest text-white uppercase">The Classic</span>
                <span className="font-sans text-[14px] font-medium leading-none tracking-widest text-[#d4af37] mt-1 uppercase">Barbershop</span>
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="mt-14 flex flex-col items-center text-center">
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-[#d4af37] uppercase">
              Digital Concierge
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-white/70">
              Experience our intelligent AI assistant. Trained on our barbering protocols, it is ready to answer questions and book your chair instantly.
            </p>
          </div>

          {/* Buttons Section */}
          <div className="mt-10 flex w-full flex-col gap-4">
            <VapiWebCallButton 
              className="shadow-[0_0_30px_rgba(212,175,55,0.25)] ring-1 ring-white/10"
              assistantOverrides={{
                name: "The Classic Barbershop",
                services: [
                  { id: "bb_haircut", name: "Classic Haircut", duration_minutes: 30, price_cents: 3500 },
                  { id: "bb_fade", name: "Skin Fade", duration_minutes: 45, price_cents: 4500 },
                  { id: "bb_shave", name: "Hot Towel Shave", duration_minutes: 30, price_cents: 4000 },
                  { id: "bb_combo", name: "Haircut & Beard Trim Combo", duration_minutes: 60, price_cents: 6500 }
                ],
                voiceGreeting: "Welcome to The Classic Barbershop! Bonjour, bienvenue au barbershop classique! Are you looking to book a fresh cut, a fade, or a hot towel shave today?",
                systemPrompt: `You are a cool, professional barber concierge. You speak English and French fluently.
Your goal is to book appointments and answer basic questions.
You can book: Classic Haircuts, Skin Fades, Hot Towel Shaves, and Combos.
Keep your responses concise, confident, and smooth.
If the customer speaks French, respond strictly in French. If they speak English, respond in English.`,
                voice: {
                  provider: "openai",
                  voiceId: "onyx"
                }
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
