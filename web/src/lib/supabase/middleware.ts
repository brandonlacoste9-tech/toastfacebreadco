/**
 * Supabase session refresh for protected routes (dashboard — Phase 1).
 *
 * Not active on Netlify marketing deploy: @supabase/ssr in Edge middleware
 * triggers a bundler error (@opentelemetry/api). Re-enable when /dashboard ships
 * by restoring src/middleware.ts and adding:
 *   npm install @opentelemetry/api
 *
 * See docs/NETLIFY_DEPLOY.md
 */

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}