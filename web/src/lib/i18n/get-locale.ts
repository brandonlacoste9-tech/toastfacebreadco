import { DEFAULT_LOCALE, type Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}