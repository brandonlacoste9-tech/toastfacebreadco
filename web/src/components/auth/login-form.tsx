"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm({ dict, locale }: { dict: Dictionary; locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const next = searchParams.get("next") ?? "/dashboard";
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      setErrorMsg(dict.login.configError);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div>
      {registered && (
        <div className="mb-6 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-light)] p-4 text-sm text-[var(--teal)]">
          {dict.login.registered}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">{dict.login.fields.email}</label>
          <Input name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">{dict.login.fields.password}</label>
          <Input name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "…" : dict.login.submit}
        </Button>
        {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted-fg)]">
        {dict.login.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-[var(--primary)] hover:underline">
          {locale === "fr" ? "Créer un compte" : "Create account"}
        </Link>
      </p>
    </div>
  );
}