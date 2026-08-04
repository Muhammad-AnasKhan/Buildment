import { cn } from "@/lib/utils";

/**
 * Shared floating "glass" navbar shell used by the marketing header and the
 * authenticated app NavBar (src/components/nav-bar.tsx) — one visual
 * treatment for every top nav in the product instead of each route styling
 * its own header. Deliberately bounded (max-w, side gutters) rather than
 * edge-to-edge, and always light — no dark variant.
 */
export function GlassNavShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-2xl border border-neutral-200/70 bg-white/75 px-3 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_8px_24px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150 sm:px-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
