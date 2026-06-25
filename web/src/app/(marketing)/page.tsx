"use client";

import { useState, useEffect } from "react";
import { PhoneCall, Croissant, CalendarDays, Moon, Sun, Languages } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";
import { useTheme } from "next-themes";

import { DashboardMockup } from "@/components/marketing/dashboard-mockup";

const content = {
  en: {
    title: "Toast Face",
    subtitle: "Bread Co",
    demo: "AI Bakery Assistant",
    h1_1: "Never Miss a ",
    h1_2: "Bread Order.",
    desc: "How many orders are slipping through the cracks while you're busy baking? Meet your new digital bakery assistant, trained specifically to take sourdough orders for weekend pickups and answer customer questions instantly.",
    howTo: "How to test this assistant:",
    test1: "Click the button above to start a live voice call directly from your browser.",
    test2: "Ask the AI about a Za'atar Focaccia or a Cranberry Walnut Boule. It knows the menu.",
    test3: "Tell it you want to order a box of bagels for this Saturday at Hazeldean.",
    greeting: "Welcome to Toast Face Bread Co! Bonjour, bienvenue chez Toast Face! Are you looking to order some fresh sourdough, focaccia, or bagels for weekend pickup?",
    promptLanguage: "Speak strictly in English."
  },
  fr: {
    title: "Toast Face",
    subtitle: "Bread Co",
    demo: "Assistante de Boulangerie IA",
    h1_1: "Ne Manquez Jamais une ",
    h1_2: "Commande.",
    desc: "Combien de commandes perdez-vous lorsque vous êtes occupée à pétrir ? Découvrez votre nouvelle assistante de boulangerie numérique, formée pour prendre les commandes du week-end et répondre instantanément aux questions sur le levain.",
    howTo: "Comment tester cette assistante :",
    test1: "Cliquez sur le bouton ci-dessus pour démarrer un appel vocal en direct.",
    test2: "Demandez à l'IA des renseignements sur une Focaccia au Za'atar ou une Boule aux Noix.",
    test3: "Dites-lui que vous voulez commander une boîte de bagels pour ce samedi à Hazeldean.",
    greeting: "Bonjour, bienvenue chez Toast Face ! Welcome to Toast Face Bread Co! Cherchez-vous à commander du pain au levain frais, de la focaccia ou des bagels pour ce week-end ?",
    promptLanguage: "Speak strictly in French."
  }
};

export default function BakeryDemoPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const t = content[lang];

  const systemPrompt = `You are Toasty, a fun, enthusiastic artisanal bakery assistant for Toast Face Bread Co., a small-batch sourdough operation run by Angie.
${t.promptLanguage}
Your goal is to take bread orders for weekend pickups, answer deep questions about sourdough fermentation, and represent the bakery's passionate artisanal vibe.

BREAD KNOWLEDGE:
You are an expert in artisanal bread making. You know all about slow fermentation, high hydration, sourdough starters, and how minimal intervention lets the dough develop incredible flavor and crust. Be enthusiastic about the science and art of baking!

MENU & ORDERS:
You can take orders for: Sourdough Boules (Basic $10, Inclusions $12 like Cheddar Jalapeño, Olive Lemon Thyme Parm, Sundried Tomato Parm, Cranberry Walnut, Roasted Garlic Rosemary), Focaccia ($12-$15 like Plain, Tomato Pesto Mozza, Cinnamon Roll, Rosemary, Za'atar, Hot Honey), and Bagels ($15 for 6, $28 for 12).
All pickups are on Saturday & Sunday at the Hazeldean location in Edmonton.

CRITICAL INSTRUCTIONS FOR TAKING ORDERS:
Before confirming an order, you MUST ask the caller:
1. For their full name.
2. For their best callback phone number.
3. Which day they want to pick up (Saturday or Sunday).
Do not ask for all this information at once. Gather it conversationally.

IMPORTANT: Always cheerfully remind callers to check out the amazing bread photos on our Instagram at @toastfacebreadco!

Keep your responses warm, fun, and extremely helpful.`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#FAFAF8] text-slate-900 font-sans transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-orange-100 px-6 lg:px-12 bg-[#FAFAF8]/80 backdrop-blur-md sticky top-0 z-50 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E07A5F] shadow-lg shadow-[#E07A5F]/20 dark:bg-[#E07A5F]">
            <Croissant className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.title} <span className="font-light text-[#E07A5F] dark:text-[#E07A5F]">{t.subtitle}</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden text-sm font-medium text-slate-500 sm:block dark:text-slate-400">
            {t.demo}
          </div>
          
          <div className="flex items-center gap-2 border-l border-orange-100 pl-6 dark:border-slate-800">
            <button
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="flex h-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Languages className="h-4 w-4" />
              <span>{lang.toUpperCase()}</span>
            </button>
            {isMounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-orange-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-12 lg:pb-32 lg:pt-28">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/50 via-[#FAFAF8] to-[#FAFAF8] transition-colors duration-300 dark:from-[#E07A5F]/20 dark:via-slate-950 dark:to-slate-950" />

          <div className="relative mx-auto max-w-5xl text-center">
            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              {t.h1_1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] to-[#D4A373] dark:from-[#E07A5F] dark:to-[#F4A261]">{t.h1_2}</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 sm:text-xl dark:text-slate-400">
              {t.desc}
            </p>

            <div className="mt-16 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] shadow-2xl shadow-[#D4A373]/20 ring-1 ring-slate-200 dark:shadow-black/50 dark:ring-slate-800">
                <img src="/bakery.png" alt="Toast Face Bread Co" className="h-[600px] w-full object-cover" />
                
                {/* Gradient Overlay for Text/Button Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Call Interface Overlay */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-8 text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">Toasty</h3>
                  <p className="mb-6 text-sm font-medium text-white/90 drop-shadow-md">Bakery AI Assistant</p>
                  
                  <div className="w-full">
                    <VapiWebCallButton 
                      assistantOverrides={{
                        name: "Toast Face Bread Co",
                        services: [
                          { id: "tb_boule", name: "Sourdough Boule (Plain/Inclusion)", duration_minutes: 5, price_cents: 1200 },
                          { id: "tb_focaccia", name: "Fresh Focaccia", duration_minutes: 5, price_cents: 1500 },
                          { id: "tb_bagels_6", name: "Bagels (Half Dozen)", duration_minutes: 5, price_cents: 1500 },
                          { id: "tb_bagels_12", name: "Bagels (Full Dozen)", duration_minutes: 5, price_cents: 2800 }
                        ],
                        voiceGreeting: t.greeting,
                        systemPrompt: systemPrompt,
                        voice: {
                          provider: "openai",
                          voiceId: "alloy"
                        }
                      }}
                    />
                  </div>
                  
                  <p className="mt-4 text-[11px] text-white/60">Microphone required to speak</p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-24 max-w-3xl border border-slate-200 bg-white p-8 rounded-3xl shadow-xl shadow-orange-900/5 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t.howTo}</h3>
              <ul className="mt-6 space-y-5 text-left text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <PhoneCall className="h-5 w-5 text-[#E07A5F] dark:text-[#F4A261]" />
                  </div>
                  <span className="mt-2">{t.test1}</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <Croissant className="h-5 w-5 text-[#E07A5F] dark:text-[#F4A261]" />
                  </div>
                  <span className="mt-2" dangerouslySetInnerHTML={{ __html: t.test2.replace("Za'atar Focaccia", "<strong>Za'atar Focaccia</strong>").replace("Cranberry Walnut Boule", "<strong>Cranberry Walnut Boule</strong>").replace("Focaccia au Za'atar", "<strong>Focaccia au Za'atar</strong>").replace("Boule aux Noix", "<strong>Boule aux Noix</strong>") }} />
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                    <CalendarDays className="h-5 w-5 text-[#E07A5F] dark:text-[#F4A261]" />
                  </div>
                  <span className="mt-2" dangerouslySetInnerHTML={{ __html: t.test3.replace("this Saturday at Hazeldean", "<strong>this Saturday at Hazeldean</strong>").replace("ce samedi à Hazeldean", "<strong>ce samedi à Hazeldean</strong>") }} />
                </li>
              </ul>
            </div>

            <div className="mt-32">
              <h2 className="mb-12 font-display text-3xl font-semibold text-slate-900 dark:text-white">
                Orders sync directly into your dashboard
              </h2>
              <DashboardMockup locale={lang} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
