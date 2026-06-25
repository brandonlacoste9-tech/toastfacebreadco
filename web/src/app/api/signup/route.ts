import { getSupabaseService } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      business_name,
      city,
      phone,
      default_language = "fr",
      plan = "pro",
      locale = "fr",
    } = body;

    if (!email || !password || !business_name || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const service = getSupabaseService();
    if (!service) {
      console.warn("[signup] Supabase not configured");
      return NextResponse.json(
        { error: "Signup unavailable — server not configured." },
        { status: 503 }
      );
    }

    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: business_name },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        return NextResponse.json(
          { error: "An account already exists with this email. Try the waitlist or use another email." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }

    const slug = business_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    const { data: business, error: bizError } = await service
      .from("businesses")
      .insert({
        name: business_name,
        slug: `${slug}-${userId.slice(0, 8)}`,
        city: city ?? null,
        default_language,
        plan: "trial",
        trial_ends_at: trialEnds.toISOString(),
      })
      .select("id")
      .single();

    if (bizError) {
      console.error("[signup] business", bizError);
      await service.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: bizError.message }, { status: 500 });
    }

    const { error: userError } = await service.from("users").insert({
      id: userId,
      business_id: business.id,
      role: "owner",
      full_name: business_name,
      email,
      phone: phone ?? null,
      preferred_language: locale,
    });

    if (userError) {
      console.error("[signup] user", userError);
      await service.from("businesses").delete().eq("id", business.id);
      await service.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    const { error: subError } = await service.from("subscriptions").insert({
      business_id: business.id,
      status: "trialing",
      plan,
    });

    if (subError) {
      console.error("[signup] subscription", subError);
    }

    return NextResponse.json({
      ok: true,
      business_id: business.id,
      message: "Account created. We will contact you within 48 hours to activate your trial.",
    });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}