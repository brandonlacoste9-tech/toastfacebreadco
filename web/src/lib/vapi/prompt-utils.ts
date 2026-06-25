export function displayBusinessName(name: string): string {
  return name.replace(/\s*test\s*$/i, "").trim() || name;
}

export function montrealTodayIso(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Montreal" });
}

/** Universal greeting — assistant speaks first, then listens for any service need. */
export function receptionistFirstMessage(
  businessName: string,
  locale: "fr" | "en" = "fr"
): string {
  const name = displayBusinessName(businessName);
  if (locale === "en") {
    return `Hi, thanks for calling ${name}. How can I help you today?`;
  }
  return `Bonjour, merci d'appeler ${name}. Comment puis-je vous aider aujourd'hui?`;
}

export function resolveFirstMessage(
  businessName: string,
  locale: "fr" | "en",
  customGreeting?: string | null
): string {
  const custom = customGreeting?.trim();
  if (custom) return custom.slice(0, 500);
  return receptionistFirstMessage(businessName, locale);
}

/** @deprecated Use receptionistFirstMessage */
export function salonFirstMessage(
  businessName: string,
  locale: "fr" | "en" = "fr"
): string {
  return receptionistFirstMessage(businessName, locale);
}