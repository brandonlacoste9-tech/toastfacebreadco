import { getCalendlyUrl, isCalendlyExternal } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type DemoLinkProps = {
  children: React.ReactNode;
  className?: string;
};

export function DemoLink({ children, className }: DemoLinkProps) {
  const url = getCalendlyUrl();
  const external = isCalendlyExternal();

  return (
    <a
      href={url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {children}
    </a>
  );
}

export function DemoNavLink({ children, className }: DemoLinkProps) {
  const url = getCalendlyUrl();
  const external = isCalendlyExternal();

  return (
    <a
      href={url}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn("transition-colors hover:text-[var(--primary)]", className)}
    >
      {children}
    </a>
  );
}