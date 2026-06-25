"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AiPhoneFrameProps {
  children: ReactNode;
  avatarSrc?: string;
  name?: string;
  title?: string;
}

export function AiPhoneFrame({ 
  children,
  avatarSrc = "/ai-avatar.png",
  name = "Chloé",
  title = "Medispa AI Concierge"
}: AiPhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Animated glowing orb behind the phone */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -inset-4 z-0 rounded-full bg-[var(--primary)] blur-3xl"
      />

      {/* The actual phone glass container */}
      <div className="relative z-10 overflow-hidden rounded-[40px] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
        {/* Phone Speaker Notch */}
        <div className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/20" />
        
        <div className="mt-6 flex flex-col items-center justify-center">
          <div className="mb-6 h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-white/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
            <img 
              src={avatarSrc} 
              alt="AI Receptionist"
              className="h-full w-full object-cover"
            />
          </div>
          
          <h3 className="mb-1 font-display text-lg font-semibold text-white">{name}</h3>
          <p className="mb-8 text-sm text-white/70">{title}</p>
          
          {children}
          
          <p className="mt-6 text-center text-xs font-medium text-white/60">
            Microphone required to speak
          </p>
        </div>
        
        {/* Phone Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
