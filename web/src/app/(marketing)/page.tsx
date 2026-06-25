"use client";

import Link from "next/link";
import { PhoneCall, Croissant, MapPin, Camera } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";

export default function ToastFaceWebsite() {
  const systemPrompt = `You are Toasty, a fun, enthusiastic artisanal bakery assistant for Toast Face Bread Co., a small-batch sourdough operation run by Angie.
Speak strictly in English.
Your goal is to take bread orders for weekend pickups, answer deep questions about sourdough fermentation, and represent the bakery's passionate artisanal vibe.

BREAD & LOCATION KNOWLEDGE:
You are an expert in artisanal bread making. You know all about slow fermentation, high hydration, sourdough starters, and how minimal intervention lets the dough develop incredible flavor and crust. Be enthusiastic about the science and art of baking!
You also know that the bakery is proudly located in Edmonton, Alberta, very close to downtown.

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
    <div className="min-h-[100dvh] bg-[#FAFAF8] text-slate-900 font-sans selection:bg-[#E07A5F] selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-sm border-b border-[#D4A373]/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex items-center justify-between py-4">
          <Link className="text-2xl font-serif font-bold text-[#D4A373]" href="/">Toast Face</Link>
          <div className="flex items-center gap-8">
            <a className="text-sm font-medium hover:text-[#D4A373] transition-colors" href="#products">Products</a>
            <a className="text-sm font-medium hover:text-[#D4A373] transition-colors" href="#about">About</a>
            <a className="text-sm font-medium hover:text-[#D4A373] transition-colors" href="#contact">Contact</a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-12 lg:pb-32 lg:pt-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E07A5F]/10 via-[#FAFAF8] to-[#FAFAF8]" />
          
          <div className="relative mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-[#D4A373] font-sans font-semibold uppercase tracking-wide mb-4">Toast Face Bread Co</p>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-tight text-slate-900 mb-8">
                  Fresh out of the oven
                </h1>
                <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-lg">
                  Small batch sourdough and artisan bread from Edmonton. Handcrafted daily, available for pickup Saturday & Sunday at Hazeldean.
                </p>
                
                {/* The AI Assistant Integration */}
                <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-xl shadow-orange-900/5 max-w-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E07A5F]/10">
                      <PhoneCall className="h-6 w-6 text-[#E07A5F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Order via AI Assistant</h3>
                      <p className="text-sm text-slate-500">Tap to call Toasty & place your order</p>
                    </div>
                  </div>
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
                        voiceGreeting: "Welcome to Toast Face Bread Co! Are you looking to order some fresh sourdough, focaccia, or bagels for weekend pickup?",
                        systemPrompt: systemPrompt,
                        voice: {
                          provider: "openai",
                          voiceId: "alloy"
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/20 to-[#E07A5F]/20 z-10" />
                <img src="/bakery.png" alt="Fresh sourdough bread coming out of the oven" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-serif font-bold text-slate-900 mb-4">What we make</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our range of fresh, handcrafted breads. Baked fresh weekly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Boule */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-orange-50">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Boule</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-[#D4A373] font-semibold mb-1">Basic Boule</p>
                    <p className="text-slate-500 text-sm">$10</p>
                  </div>
                  <div>
                    <p className="text-[#D4A373] font-semibold mb-2">Inclusion Boule</p>
                    <p className="text-slate-500 text-sm mb-2">$12</p>
                    <ul className="list-disc list-inside text-slate-500 text-sm space-y-1">
                      <li>Cheddar jalapeño</li>
                      <li>Olive, lemon, thyme & parm</li>
                      <li>Sundried tomato parm</li>
                      <li>Cranberry walnut</li>
                      <li>Roasted garlic and rosemary</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Focaccia */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-orange-50">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Focaccia</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#D4A373] font-semibold mb-1">Focaccia Varieties</p>
                    <p className="text-slate-500 text-sm mb-3">$12 – $15</p>
                    <ul className="list-disc list-inside text-slate-500 text-sm space-y-1">
                      <li>Plain</li>
                      <li>Tomato pesto mozza</li>
                      <li>Cinnamon roll</li>
                      <li>Rosemary</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bagels */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-orange-50">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Bagels</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[#D4A373] font-semibold mb-2">Mix and Match</p>
                    <p className="text-slate-500 text-sm mb-3">$15 for 6 / $28 for 12</p>
                    <ul className="list-disc list-inside text-slate-500 text-sm space-y-1">
                      <li>Plain</li>
                      <li>Cheddar jalapeño</li>
                      <li>Everything</li>
                      <li>Sesame</li>
                      <li>Poppyseed</li>
                      <li>Cinnamon crunch</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Guest Specials */}
              <div className="bg-[#FAFAF8] p-8 rounded-2xl border border-orange-50">
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Guest Specials</h3>
                <div className="space-y-4">
                  <p className="text-[#E07A5F] font-semibold">Hot Honey & Feta Focaccia</p>
                  <p className="text-[#E07A5F] font-semibold">Za&apos;atar & Olive Oil Focaccia</p>
                </div>
              </div>
            </div>

            <div className="bg-[#D4A373]/10 border-l-4 border-[#D4A373] p-8 rounded-r-2xl">
              <p className="font-semibold text-slate-900">Pickup: Saturday & Sunday — Hazeldean Location</p>
              <p className="text-slate-600 text-sm mt-2">We bake fresh twice weekly. Pre-order for guaranteed availability.</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-[#E07A5F]/10 flex flex-col items-center justify-center p-12 text-center">
                <Croissant className="w-24 h-24 text-[#E07A5F]/60 mb-6" />
                <h3 className="text-2xl font-serif font-bold text-slate-800">Toast Face Bread Co.</h3>
                <p className="text-slate-600 mt-2 font-medium">Est. 2024</p>
              </div>
              <div>
                <h2 className="text-5xl font-serif font-bold text-slate-900 mb-6">Made with care</h2>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  Toast Face Bread Co is a small-batch sourdough operation run by Angie. Every loaf is handcrafted with locally-sourced ingredients and baked fresh daily.
                </p>
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                  We believe in slow fermentation, minimal intervention, and letting the dough do what it does best—rise, develop flavor, and turn into something special.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-white border-t border-orange-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-serif font-bold text-slate-900 mb-4">Stay connected</h2>
              <p className="text-lg text-slate-600">Follow along for updates, new flavors, and weekend pickup schedules.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mb-12">
              <div className="flex flex-col items-center">
                <div className="bg-[#FAFAF8] p-8 rounded-full mb-4 border border-orange-100 shadow-sm">
                  <Camera className="h-12 w-12 text-[#E07A5F]" />
                </div>
              </div>
              
              <div className="flex flex-col gap-8 text-center lg:text-left">
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Instagram</h3>
                  <a href="https://www.instagram.com/toastfacebreadco/" target="_blank" rel="noopener noreferrer" className="text-[#D4A373] hover:text-[#E07A5F] transition-colors font-medium text-lg">
                    @toastfacebreadco
                  </a>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">Location</h3>
                  <p className="text-slate-600 flex items-center justify-center lg:justify-start gap-2">
                    <MapPin className="h-4 w-4 text-[#D4A373]" /> Hazeldean, Edmonton, AB
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-6">Pickup Schedule</h3>
                <div className="bg-[#D4A373]/10 border-l-4 border-[#D4A373] p-6 w-full rounded-r-2xl">
                  <p className="font-semibold text-slate-900 mb-2">Saturday & Sunday</p>
                  <p className="text-slate-600 text-sm mb-4">Fresh bread baked twice weekly</p>
                  <p className="text-sm text-[#E07A5F] font-semibold">Hazeldean Location</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-[#FAFAF8] py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2024 Toast Face Bread Co. Small batch sourdough from Edmonton.</p>
          <p className="text-sm text-slate-400">Baked with care by Angie</p>
        </div>
      </footer>
    </div>
  );
}