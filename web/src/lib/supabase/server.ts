import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function requireEnv() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export async function createSupabaseServerClient() {
  const env = requireEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.anonKey, {
    cookieOptions: { maxAge: 31536000 }, // 1 year (Remember me)
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — ignore
        }
      },
    },
  });
}

export function getSupabaseService() {
  const env = requireEnv();
  if (!env) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) return null;
  return createClient(env.url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Waitlist writes: service role preferred, anon fallback after migration 003. */
export function getWaitlistClient() {
  return getSupabaseService() ?? getSupabaseAnonServer();
}

function getSupabaseAnonServer() {
  const env = requireEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false },
  });
}