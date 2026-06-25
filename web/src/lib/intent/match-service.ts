export type ServiceOption = { id?: string; name: string };

/** Common caller phrases → keywords to match against configured service names. */
const INTENT_KEYWORDS: { keywords: RegExp; hints: string[] }[] = [
  {
    keywords:
      /(?:hair|cheveux|coupe|haircut|trim|cut|coloration|color|dye|balayage|manucure|manicure|barbe|beard|fade|salon)/i,
    hints: ["coupe", "hair", "color", "barbe", "beard", "manicure", "salon"],
  },
  {
    keywords:
      /(?:plumb|plombier|sink|évier|evier|faucet|robinet|drain|clog|bouchon|toilet|toilette|leak|fuite|pipe|tuyau)/i,
    hints: ["plumb", "sink", "drain", "faucet", "leak", "repair", "service", "réparation"],
  },
  {
    keywords:
      /(?:hvac|climatisation|air\s*condition|a\/c|ac\s+unit|chauffage|heating|furnace|fournaise|thermostat|ventilation)/i,
    hints: ["hvac", "ac", "heat", "furnace", "climat", "chauffage", "tune"],
  },
  {
    keywords:
      /(?:dental|dentiste|dentist|tooth|teeth|dent|hygiene|hygiène|cleaning|nettoyage|checkup|exam)/i,
    hints: ["dental", "dent", "hygiene", "clean", "exam", "check"],
  },
  {
    keywords:
      /(?:electric|électricien|electrician|outlet|prise|panel|panneau|wiring|câblage)/i,
    hints: ["electric", "wiring", "panel", "outlet"],
  },
  {
    keywords: /(?:fix|réparer|reparer|repair|install|installation|maintenance|service\s+call|urgent|emergency)/i,
    hints: ["repair", "service", "install", "maintenance", "emergency", "urgence"],
  },
];

function scoreService(name: string, hints: string[], message: string): number {
  const lower = name.toLowerCase();
  const msg = message.toLowerCase();
  let score = 0;
  for (const hint of hints) {
    if (lower.includes(hint)) score += 3;
    if (msg.includes(hint) && lower.includes(hint)) score += 2;
  }
  const words = lower.split(/\s+/);
  for (const word of words) {
    if (word.length > 3 && msg.includes(word)) score += 4;
  }
  return score;
}

export function matchBusinessService(
  message: string,
  services: ServiceOption[]
): { name: string; id?: string } | null {
  if (!services.length) return null;
  const msg = message.trim();
  if (!msg) return null;

  let best: { name: string; id?: string; score: number } | null = null;

  for (const svc of services) {
    let score = scoreService(svc.name, [], msg);
    for (const group of INTENT_KEYWORDS) {
      if (group.keywords.test(msg)) {
        score += scoreService(svc.name, group.hints, msg);
      }
    }
    if (!best || score > best.score) {
      best = { name: svc.name, id: svc.id, score };
    }
  }

  if (best && best.score >= 4) {
    return { name: best.name, id: best.id };
  }

  return null;
}

export function describeCallerNeed(message: string, locale: "fr" | "en"): string | null {
  const msg = message.trim();
  if (!msg) return null;

  for (const group of INTENT_KEYWORDS) {
    if (group.keywords.test(msg)) {
      if (group.hints[0]?.includes("coupe") || /hair|cheveux/i.test(msg)) {
        return locale === "fr" ? "rendez-vous coiffure" : "hair appointment";
      }
      if (/sink|évier|plumb|plombier/i.test(msg)) {
        return locale === "fr" ? "réparation plomberie" : "plumbing repair";
      }
      if (/hvac|climat|chauffage|heating/i.test(msg)) {
        return locale === "fr" ? "service HVAC" : "HVAC service";
      }
      if (/dental|dentiste|dentist/i.test(msg)) {
        return locale === "fr" ? "rendez-vous dentaire" : "dental appointment";
      }
    }
  }

  if (/(?:book|appointment|rendez[- ]?vous|réserver|reserver)/i.test(msg)) {
    return locale === "fr" ? "prise de rendez-vous" : "appointment";
  }

  return null;
}