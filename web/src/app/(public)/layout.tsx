export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">{children}</div>
  );
}