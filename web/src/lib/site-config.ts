export const BRAND_NAME = "JustBookMe";
export const BRAND_DOMAIN = "justbookme.ca";
export const BRAND_PRODUCT_SLUG = "justbookme";

export function getContactEmail(): string {
  return (
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || `info@${BRAND_DOMAIN}`
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    `https://${BRAND_DOMAIN}`
  );
}

export function getCalendlyUrl(): string {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
  if (url) return url;
  return `mailto:${getContactEmail()}?subject=Demo%2015%20min%20%E2%80%94%20${encodeURIComponent(BRAND_NAME)}`;
}

export function isCalendlyExternal(): boolean {
  const url = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim();
  return Boolean(url && url.startsWith("http"));
}