type BookingSmsParams = {
  businessName: string;
  customerName: string;
  startsAt: Date;
  serviceName?: string | null;
  locale: "fr" | "en";
};

export function bookingConfirmationSms(p: BookingSmsParams): string {
  const when = p.startsAt.toLocaleString(p.locale === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Montreal",
  });

  if (p.locale === "fr") {
    const svc = p.serviceName ? ` (${p.serviceName})` : "";
    return `${p.businessName}: Bonjour ${p.customerName}, votre rendez-vous${svc} est confirmé pour ${when}. Répondez ANNULER pour annuler.`;
  }

  const svc = p.serviceName ? ` (${p.serviceName})` : "";
  return `${p.businessName}: Hi ${p.customerName}, you're all set${svc} for ${when}. Reply CANCEL if you need to cancel.`;
}

export function bookingReminderSms(p: BookingSmsParams): string {
  const time = p.startsAt.toLocaleString(p.locale === "fr" ? "fr-CA" : "en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Montreal",
  });

  if (p.locale === "fr") {
    return `${p.businessName}: Rappel — rendez-vous demain à ${time}. Répondez OUI pour confirmer ou ANNULER.`;
  }

  return `${p.businessName}: Friendly reminder — your appointment is tomorrow at ${time}. Reply YES to confirm or CANCEL to cancel.`;
}

export function bookingReminder2hSms(p: BookingSmsParams): string {
  const time = p.startsAt.toLocaleString(p.locale === "fr" ? "fr-CA" : "en-CA", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Montreal",
  });

  if (p.locale === "fr") {
    return `${p.businessName}: Rappel — rendez-vous dans 2 h (${time}). Répondez OUI pour confirmer ou ANNULER.`;
  }

  return `${p.businessName}: Reminder — your appointment is in 2 hours (${time}). Reply YES to confirm or CANCEL to cancel.`;
}