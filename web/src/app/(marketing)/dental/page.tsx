import { PhoneCall, Sparkles, CalendarDays } from "lucide-react";
import { VapiWebCallButton } from "@/components/vapi-web-call-button";
import { AiPhoneFrame } from "@/components/marketing/ai-phone-frame";
import { AnimatedTranscript } from "@/components/marketing/animated-transcript";

export default function DentalDemoPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="flex h-20 items-center justify-between border-b border-slate-200 px-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Dr. Smith <span className="font-light text-teal-600">Dentistry</span></span>
        </div>
        <div className="hidden text-sm font-medium text-slate-500 sm:block">
          AI Concierge Demo Environment
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-24 pt-20 lg:px-12 lg:pb-32 lg:pt-28">
          {/* Subtle teal gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-white to-white" />

          <div className="relative mx-auto max-w-5xl text-center">
            <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Never Miss a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">New Patient.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 sm:text-xl">
              How many Invisalign leads are you losing when the front desk is busy with patients? 
              Meet your new digital concierge, trained specifically on high-end dental procedures and emergency triage.
            </p>

            <div className="mt-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <AiPhoneFrame 
                avatarSrc="/dental-avatar.png" 
                name="Sarah" 
                title="Dental AI Concierge"
              >
                <VapiWebCallButton 
                  assistantOverrides={{
                    name: "Dr. Smith Dentistry",
                    services: [
                      { id: "dental_cleaning", name: "Routine Cleaning & Exam", duration_minutes: 45, price_cents: 15000 },
                      { id: "teeth_whitening", name: "Professional Teeth Whitening", duration_minutes: 60, price_cents: 35000 },
                      { id: "invisalign_consult", name: "Invisalign Consultation", duration_minutes: 30, price_cents: 0 },
                      { id: "emergency_triage", name: "Emergency Dental Care", duration_minutes: 30, price_cents: 20000 }
                    ],
                    voiceGreeting: "Hello, thank you for calling Dr. Smith Dentistry! My name is Sarah. Are you calling to book a cleaning, an Invisalign consult, or are you experiencing a dental emergency?",
                    systemPrompt: `You are Sarah, a highly professional dental receptionist for Dr. Smith Dentistry.
Your goal is to book appointments and answer basic questions.
You can book: Routine Cleanings, Teeth Whitening, and Invisalign Consults.
If the patient mentions pain, bleeding, or an emergency, immediately express empathy and prioritize an emergency triage booking.
Keep your responses concise, empathetic, and professional.`
                  }}
                />
              </AiPhoneFrame>
              <div className="w-full max-w-md hidden lg:block">
                <AnimatedTranscript 
                  title="Dental AI"
                  customMessages={[
                    { id: 1, sender: "ai", text: "Hello, Dr. Smith Dentistry. How can I help you today?" },
                    { id: 2, sender: "user", text: "Hi, I'm in a lot of pain and need to see someone ASAP." },
                    { id: 3, sender: "ai", text: "I'm so sorry to hear that. I'm prioritizing your call as an emergency. Are you currently bleeding?" },
                    { id: 4, sender: "user", text: "No bleeding, just severe tooth pain." },
                    { id: 5, sender: "ai", text: "Thank you for letting me know. We have an emergency triage opening at 3:15 PM today. I'm putting you in for that slot right now." }
                  ]} 
                />
              </div>
            </div>

            <div className="mx-auto mt-24 max-w-3xl border border-slate-200 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-900">How to test this concierge:</h3>
              <ul className="mt-6 space-y-5 text-left text-slate-600">
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
                    <PhoneCall className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="mt-2">Click the button above to start a live voice call directly from your browser.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="mt-2">Ask the AI about <strong>Invisalign</strong> or <strong>Teeth Whitening</strong>. It understands the treatments.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50">
                    <CalendarDays className="h-5 w-5 text-rose-500" />
                  </div>
                  <span className="mt-2">Tell it you are in <strong>severe pain</strong>. Notice how it instantly shifts to emergency triage mode.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
