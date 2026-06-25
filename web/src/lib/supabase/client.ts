import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey, {
    cookieOptions: { maxAge: 31536000 }, // 1 year (Remember me)
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}