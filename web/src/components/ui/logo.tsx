"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({
  className,
  showWordmark = true,
  size = 36,
  variant = "dark",
  href = "/",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  variant?: "dark" | "light";
  href?: string;
}) {
  return (
    <a
      href={href}
      className={cn("group relative z-50 inline-flex items-center", className)}
      aria-label="JustBookMe home"
    >
      <img
        src="/logo-new.png"
        alt="JustBookMe"
        className="pointer-events-none h-12 w-auto shrink-0 rounded-xl transition-transform group-hover:scale-105"
      />
    </a>
  );
}