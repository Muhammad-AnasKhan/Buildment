"use client";

import { cn } from "@/lib/utils";

function ShimmerBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-200/80",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[reader-shimmer_1.4s_ease-in-out_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent",
        className
      )}
    />
  );
}

export function ReaderShellSkeleton({ visible }: { visible?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[100dvh] flex-col bg-background transition-opacity duration-300 ease-out",
        visible ? "pointer-events-none opacity-0" : "opacity-100"
      )}
      aria-busy="true"
      aria-label="Loading chapter"
    >
      <div className="shrink-0 border-b border-border px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-3">
          <ShimmerBar className="size-8 rounded-lg" />
          <div className="flex min-w-0 flex-1 gap-2">
            <ShimmerBar className="h-3 w-24 max-w-[40%]" />
            <ShimmerBar className="hidden h-3 w-12 sm:block" />
          </div>
          <ShimmerBar className="hidden h-3 w-16 sm:block" />
          <div className="flex gap-1.5">
            <ShimmerBar className="size-8 rounded-lg" />
            <ShimmerBar className="size-8 rounded-lg" />
            <ShimmerBar className="size-8 rounded-full" />
          </div>
        </div>
        <ShimmerBar className="mt-2 h-px w-full rounded-none bg-neutral-100 after:via-neutral-50/80" />
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-72 shrink-0 border-r border-border bg-card p-4 md:block">
          <ShimmerBar className="h-3 w-20" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ShimmerBar key={i} className={cn("h-4 w-full", i > 2 && "opacity-70")} />
            ))}
          </div>
        </aside>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl space-y-4">
            <ShimmerBar className="h-3 w-14" />
            <ShimmerBar className="h-8 w-4/5 max-w-md" />
            <ShimmerBar className="h-8 w-3/5 max-w-sm" />
            <div className="mt-10 space-y-3 pt-2">
              {(["w-full", "w-[92%]", "w-[88%]", "w-[94%]", "w-[80%]"] as const).map((width) => (
                <ShimmerBar key={width} className={cn("h-4", width)} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function ReaderShellFade({ children }: { visible?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative z-0 flex h-[100dvh] flex-col bg-background text-foreground">{children}</div>
  );
}
