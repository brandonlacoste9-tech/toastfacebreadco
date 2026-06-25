import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getContactEmail } from "@/lib/site-config";
import Link from "next/link";

export function LegalPage({
  dict,
  type,
}: {
  dict: Dictionary;
  type: "privacy" | "terms";
}) {
  const content = dict.legal[type];
  const updated = "24 juin 2026";

  return (
    <article className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← {dict.legal.back}
        </Link>
        <h1 className="font-display mt-6 text-3xl font-semibold text-[var(--foreground)]">
          {content.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-fg)]">
          {dict.legal.updated}: {updated}
        </p>
        <div className="prose-legal mt-10 space-y-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-[var(--muted-fg)]">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-[var(--muted-fg)]">
          {dict.legal.contact}:{" "}
          <a
            href={`mailto:${getContactEmail()}`}
            className="font-medium text-[var(--primary)] hover:underline"
          >
            {getContactEmail()}
          </a>
        </p>
      </div>
    </article>
  );
}