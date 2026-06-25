"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignupForm({ dict, locale }: { dict: Dictionary; locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "pro";
  const interval = searchParams.get("interval") === "year" ? "year" : "month";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const body = {
      email,
      password,
      business_name: form.get("business_name"),
      city: form.get("city"),
      phone: form.get("phone"),
      default_language: form.get("default_language"),
      plan,
      locale,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");

      const supabase = createClient();
      if (supabase) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError) {
          try {
            sessionStorage.setItem("pendingSubscribePlan", plan);
            sessionStorage.setItem("pendingSubscribeInterval", interval);
          } catch {
            /* ignore */
          }
          router.push("/onboarding");
          router.refresh();
          return;
        }
      }

      router.push("/login?registered=1");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Signup failed");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-light)] p-6 text-center">
        <p className="font-medium text-[var(--teal)]">{dict.signup.success}</p>
        <Link href="/login?registered=1" className="mt-4 inline-block text-sm font-semibold text-[var(--primary)] hover:underline">
          {dict.nav.login}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="plan" value={plan} />
      <div>
        <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.email}</label>
        <Input name="email" type="email" required autoComplete="email" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.password}</label>
        <Input name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.businessName}</label>
        <Input name="business_name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.city}</label>
          <Input name="city" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.phone}</label>
          <Input name="phone" type="tel" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">{dict.signup.fields.language}</label>
        <select
          name="default_language"
          defaultValue={locale === "en" ? "en" : "fr"}
          className="select-field"
        >
          <option value="fr">{dict.signup.langOptions.fr}</option>
          <option value="en">{dict.signup.langOptions.en}</option>
        </select>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "…" : dict.signup.submit}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
    </form>
  );
}