export function SectionHeading({
  label,
  title,
  description,
  light = false,
}: {
  label?: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {label && <p className="section-label">{label}</p>}
      <h2
        className={`font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl ${
          light ? "text-white" : "text-[var(--foreground)]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 text-lg leading-relaxed ${
            light ? "text-white/70" : "text-[var(--muted-fg)]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}