export default function AppShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen leather">{children}</div>;
}