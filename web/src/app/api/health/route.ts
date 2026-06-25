import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";
import { getSiteUrl } from "@/lib/site-config";
import { getSupabaseService } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, boolean | string> = {
    supabase_url: Boolean(getSupabaseUrl()),
    supabase_anon: Boolean(getSupabaseAnonKey()),
    supabase_service: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    site_url: getSiteUrl(),
    env_overrides: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    ),
    cron_secret: Boolean(process.env.CRON_SECRET?.trim()),
    usage_enforce: process.env.USAGE_ENFORCE?.trim() === "true",
  };

  const db = getSupabaseService();
  if (db) {
    const { error } = await db.from("waitlist_signups").select("id").limit(1);
    checks.database = !error;
    if (error) checks.database_error = error.message;
  } else {
    checks.database = false;
  }

  const ok = checks.supabase_url && checks.supabase_anon && checks.supabase_service && checks.database;

  return NextResponse.json(
    { status: ok ? "ok" : "degraded", checks },
    { status: ok ? 200 : 503 }
  );
}