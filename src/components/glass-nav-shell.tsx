import { cn } from "@/lib/utils";

/**
 * Shared top nav shell for the marketing header and the authenticated app
 * NavBar (src/components/nav-bar.tsx) — one visual treatment for every top
 * nav in the product. Simple bordered bar, Notion/Stripe-style, always light.
 */
export function GlassNavShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
