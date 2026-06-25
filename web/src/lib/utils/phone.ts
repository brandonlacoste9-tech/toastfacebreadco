/**
 * Formats a given phone number string into E.164 format (e.g. +15145550199)
 * for use with Twilio, Vapi, etc.
 * 
 * If the number does not include a country code, assumes +1 (US/Canada).
 */
export function ensureE164(phone: string | null | undefined): string | null {
  if (!phone || typeof phone !== "string") return null;

  // Strip all non-digit characters except for a leading plus
  const digitsOnly = phone.replace(/[^\d+]/g, "");

  // If there's literally no digits left, return null
  if (!digitsOnly.match(/\d/)) return null;

  // If it already starts with a plus, assume it's E.164 (or close enough)
  if (digitsOnly.startsWith("+")) {
    return digitsOnly;
  }

  // If it has 10 digits exactly, assume US/CA and prepend +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // If it has 11 digits and starts with 1, assume US/CA and prepend +
  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    return `+${digitsOnly}`;
  }

  // Fallback: just prepend +
  return `+${digitsOnly}`;
}
