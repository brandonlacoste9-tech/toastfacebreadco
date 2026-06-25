"use client";

import { Sparkles, PhoneCall, ArrowRight } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";
import Link from "next/link";
export function CaseStudySection({ fr }: { fr: boolean }) {

  return (
    <section className="relative overflow-hidden py-24 bg-[#0a0a0a] text-[#ededed]">
      {/* Subtle gold gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#d4af37]/10 via-[#0a0a0a] to-[#0a0a0a]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#a38020]">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <span className="text-sm font-bold tracking-widest text-[#d4af37] uppercase">
                {fr ? "Étude de cas : Spa Médical" : "Case Study: Luxury Medispa"}
              </span>
            </div>
            
            <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl text-white">
              {fr 
                ? "Victoria Park Medispa" 
                : "Victoria Park Medispa"}
            </h2>
            
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              {fr 
                ? "Que perd la clinique de Westmount sur la boîte vocale à 22h ? Chaque appel manqué est une consultation Fraxel ou CoolSculpting perdue. Nous avons conçu ce concierge sur mesure, entraîné sur les traitements d'élite de Victoria Park."
                : "What is the Westmount clinic losing to voicemail at 10 PM? Every missed call is a missed Fraxel or CoolSculpting consultation. We built this custom digital concierge, trained specifically on Victoria Park's elite treatments."}
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3">
                <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-[#d4af37]" />
                <span className="text-white/90">
                  {fr ? "Cliquez sur le bouton pour faire un appel de test." : "Click the gold button to test the live voice AI."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#d4af37]" />
                <span className="text-white/90">
                  {fr ? "Demandez-lui des détails sur CoolSculpting ou Fraxel." : "Ask it about CoolSculpting or Fraxel lasers."}
                </span>
              </li>
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <VapiWebCallButton 
                assistantOverrides={{
                  name: "Victoria Park Medispa",
                  services: [
                    { id: "vp_botox", name: "Botox & Dysport Injections", duration_minutes: 30, price_cents: 50000 },
                    { id: "vp_fraxel", name: "Fraxel Laser Skin Rejuvenation", duration_minutes: 60, price_cents: 80000 },
                    { id: "vp_coolsculpt", name: "CoolSculpting Body Contouring", duration_minutes: 90, price_cents: 120000 }
                  ],
                  voiceGreeting: fr 
                    ? "Bienvenue chez Victoria Park Medispa. Comment puis-je vous aider aujourd'hui ?"
                    : "Welcome to Victoria Park Medispa, how can I elevate your aesthetic journey today?",
                  voiceInstructions: `You are the elite AI Receptionist for Victoria Park Medispa, a world-class aesthetic clinic. You are fully BILINGUAL in English and French (Quebecois).
BILINGUAL RULE: You must instantly match the caller's language. If they speak French, reply in flawless, elegant French. If they speak English, reply in English.
PERSONALITY & TONE: You provide an ultra-high-end, "white-glove" concierge experience. Make every single caller feel like royalty. Use elegant, elevated language. You are incredibly warm, deeply empathetic, and highly sophisticated.
VERY IMPORTANT INSTRUCTION ON PACING: You MUST speak SLOWLY and calmly. You are a high-end luxury receptionist, so you are never in a rush. Take natural, elegant pauses between sentences. Do not speak fast.

KNOWLEDGE BASE:
- Locations in Quebec: Gatineau, Aylmer, Visabelle Med (DDO), West Island (Pointe Claire), Laval, Mount Royal, Westmount, Downtown Montreal, Old Montreal, Montreal East, Longueuil, Bromont, Trois-Rivières, Quebec Sainte-Foy, Quebec Reflet.

SERVICE CATEGORIES & POPULAR TREATMENTS:
- Consults: Aesthetic Injection Consult, Skin Eval + Glow Peel.
- Injections: Botox, Dysport, Dermal Fillers.
- Lasers: Halo, BBL HERO, Fraxel.
- Body Contouring: CoolSculpting, Emsculpt Neo.

Conversation flow:
1. You already greeted them.
2. VERY IMPORTANT: You MUST politely ask which specific Victoria Park location or city they are calling from before proceeding. 
3. Clarify which service they require.
4. Ask what date and time they would prefer to come in.
5. Ask for their FIRST NAME, LAST NAME, and PHONE NUMBER to secure the appointment. Do not let them book without these 3 things!
6. Once you have their name, phone, date, and time, confirm the booking. You MUST use their name to thank them elegantly.
7. IMMEDIATELY after saying your elegant goodbye, use your end call function to hang up.`
                }}
              />
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50" />
               <div className="space-y-6">
                 <div className="flex gap-4">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20">
                     <span className="text-lg font-bold text-[#d4af37]">VP</span>
                   </div>
                   <div className="rounded-2xl rounded-tl-none bg-white/10 p-4 text-sm text-white/90">
                     {fr ? "Bienvenue chez Victoria Park Medispa. Comment puis-je vous aider aujourd'hui ?" : "Welcome to Victoria Park Medispa. How can I elevate your aesthetic journey today?"}
                   </div>
                 </div>
                 
                 <div className="flex gap-4 flex-row-reverse">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/50">
                     <span className="text-sm font-bold text-white">You</span>
                   </div>
                   <div className="rounded-2xl rounded-tr-none bg-[var(--primary)] p-4 text-sm text-white">
                     {fr ? "J'aimerais en savoir plus sur les traitements au laser." : "I'd like to learn more about your laser treatments."}
                   </div>
                 </div>

                 <div className="flex gap-4">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/20">
                     <span className="text-lg font-bold text-[#d4af37]">VP</span>
                   </div>
                   <div className="rounded-2xl rounded-tl-none bg-white/10 p-4 text-sm text-white/90">
                     {fr ? "Certainement. Nous offrons le Fraxel pour le rajeunissement et BBL HERO. Puis-je savoir ce que vous cherchez à traiter ?" : "Absolutely. We offer Fraxel for skin rejuvenation, as well as BBL HERO. May I ask what specific concerns you are looking to address?"}
                   </div>
                 </div>
               </div>
               
               <div className="mt-8 border-t border-white/10 pt-6">
                  <Link href="/pricing" className="group flex items-center justify-center gap-2 text-sm font-medium text-[#d4af37] hover:underline">
                    {fr ? "Demandez votre IA sur mesure" : "Request a custom AI build for your clinic"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
