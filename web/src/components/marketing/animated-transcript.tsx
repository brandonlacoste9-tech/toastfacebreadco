"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";

export type TranscriptMessage = {
  id: number;
  text: string;
  sender: "ai" | "user";
};

interface AnimatedTranscriptProps {
  fr?: boolean;
  customMessages?: TranscriptMessage[];
  title?: string;
}

export function AnimatedTranscript({ fr = false, customMessages, title }: AnimatedTranscriptProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  const defaultMessages: TranscriptMessage[] = fr
    ? [
        { id: 1, sender: "ai", text: "Bonjour, Victoria Park Medispa. Comment puis-je vous aider ?" },
        { id: 2, sender: "user", text: "Salut, j'aimerais prendre rendez-vous pour du Botox." },
        { id: 3, sender: "ai", text: "Absolument. Êtes-vous déjà client chez nous ?" },
        { id: 4, sender: "user", text: "Oui, c'est ma deuxième fois." },
        { id: 5, sender: "ai", text: "Parfait. J'ai une disponibilité ce jeudi à 14h00. Est-ce que cela vous convient ?" },
      ]
    : [
        { id: 1, sender: "ai", text: "Hello, Victoria Park Medispa. How can I help you today?" },
        { id: 2, sender: "user", text: "Hi, I'd like to book an appointment for Botox." },
        { id: 3, sender: "ai", text: "Absolutely. Are you a returning client with us?" },
        { id: 4, sender: "user", text: "Yes, this is my second time." },
        { id: 5, sender: "ai", text: "Perfect. I have an opening this Thursday at 2:00 PM. Does that work for you?" },
      ];

  const messages = customMessages || defaultMessages;

  useEffect(() => {
    if (!isPlaying) return;

    const timeoutIds: NodeJS.Timeout[] = [];
    setVisibleMessages([]); // Reset

    // Sequence the messages appearing one by one
    messages.forEach((msg, index) => {
      const timeoutId = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, (index + 1) * 1500); // 1.5 seconds between each message
      timeoutIds.push(timeoutId);
    });

    // Auto-pause when done
    const finalTimeout = setTimeout(() => {
      setIsPlaying(false);
    }, (messages.length + 1) * 1500);
    timeoutIds.push(finalTimeout);

    return () => timeoutIds.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
            AI
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{title || "Medispa AI"}</p>
            <p className="text-xs text-[var(--muted-fg)]">
              {isPlaying ? (fr ? "En train de taper..." : "Typing...") : (fr ? "Hors ligne" : "Offline")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 pl-0.5" />}
        </button>
      </div>

      <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-gray-50/50 flex flex-col">
        {!isPlaying && visibleMessages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-sm text-[var(--muted-fg)]">
            {fr ? "Appuyez sur Lecture pour entendre une simulation d'appel" : "Press Play to hear a simulated call"}
          </div>
        )}
        
        {messages.filter((m) => visibleMessages.includes(m.id)).map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.sender === "user"
                  ? "bg-[var(--accent)] text-white rounded-br-none"
                  : "bg-white border border-[var(--border)] text-[var(--foreground)] rounded-bl-none shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
