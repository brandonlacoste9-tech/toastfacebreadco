export type BusinessType = "salon" | "trade" | "office";

export type ServicePreset = {
  name: string;
  duration_minutes: number;
  price_cents: number;
};

export function defaultServicesForType(
  type: BusinessType,
  locale: "fr" | "en"
): ServicePreset[] {
  const fr = locale === "fr";
  if (type === "trade") {
    return fr
      ? [
          { name: "Réparation fuite / évier", duration_minutes: 90, price_cents: 15000 },
          { name: "Débouchage drain", duration_minutes: 60, price_cents: 12000 },
          { name: "Service HVAC", duration_minutes: 90, price_cents: 18000 },
          { name: "Appel d'urgence", duration_minutes: 120, price_cents: 25000 },
        ]
      : [
          { name: "Sink / leak repair", duration_minutes: 90, price_cents: 15000 },
          { name: "Drain unclog", duration_minutes: 60, price_cents: 12000 },
          { name: "HVAC service", duration_minutes: 90, price_cents: 18000 },
          { name: "Emergency call", duration_minutes: 120, price_cents: 25000 },
        ];
  }
  if (type === "office") {
    return fr
      ? [
          { name: "Consultation", duration_minutes: 30, price_cents: 0 },
          { name: "Nettoyage dentaire", duration_minutes: 60, price_cents: 15000 },
          { name: "Examen de routine", duration_minutes: 45, price_cents: 12000 },
          { name: "Nouveau patient", duration_minutes: 60, price_cents: 0 },
        ]
      : [
          { name: "Consultation", duration_minutes: 30, price_cents: 0 },
          { name: "Dental cleaning", duration_minutes: 60, price_cents: 15000 },
          { name: "Routine check-up", duration_minutes: 45, price_cents: 12000 },
          { name: "New patient visit", duration_minutes: 60, price_cents: 0 },
        ];
  }
  return fr
    ? [
        { name: "Coupe", duration_minutes: 45, price_cents: 4500 },
        { name: "Couleur", duration_minutes: 90, price_cents: 12000 },
        { name: "Barbe", duration_minutes: 30, price_cents: 2500 },
      ]
    : [
        { name: "Haircut", duration_minutes: 45, price_cents: 4500 },
        { name: "Color", duration_minutes: 90, price_cents: 12000 },
        { name: "Beard trim", duration_minutes: 30, price_cents: 2500 },
      ];
}

export function defaultVoiceInstructions(
  type: BusinessType,
  locale: "fr" | "en"
): string {
  const fr = locale === "fr";
  if (type === "trade") {
    return fr
      ? "Demandez toujours s'il s'agit d'une urgence (fuite, pas de chauffage). Mentionnez nos estimations gratuites par téléphone. Demandez l'adresse du chantier."
      : "Always ask if it's an emergency (leak, no heat). Mention free phone estimates. Ask for the job site address.";
  }
  if (type === "office") {
    return fr
      ? "Demandez s'il s'agit d'un nouveau patient. Rappelez d'apporter la carte d'assurance-maladie. Restez professionnel et rassurant."
      : "Ask if they are a new patient. Remind them to bring their health card. Stay professional and reassuring.";
  }
  return fr
    ? "Soyez chaleureux et détendu. Proposez coupe, couleur ou barbe selon la demande."
    : "Be warm and relaxed. Offer haircut, color, or beard services based on what they need.";
}