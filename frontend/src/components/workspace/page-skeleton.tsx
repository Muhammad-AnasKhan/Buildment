import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageSkeleton({
  variant = "dashboard",
  label = "Loading page",
  className,
}: {
  variant?: "dashboard" | "table" | "cards" | "form" | "detail";
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" aria-label={label} className={cn("mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6", className)}>
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full max-w-md space-y-3">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-9 w-24 shrink-0" />
        </div>
        {variant === "dashboard" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-4 rounded-xl border p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        )}
        {variant === "cards" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <Skeleton className="aspect-video rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="mt-5 h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : variant === "form" || variant === "detail" ? (
          <div className="max-w-3xl space-y-6 rounded-xl border p-5 sm:p-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className={cn("w-full", variant === "detail" && i === 1 ? "h-40" : "h-10")} />
              </div>
            ))}
            <Skeleton className="h-9 w-28" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <div className="flex gap-4 border-b bg-muted/20 p-4">
              <Skeleton className="h-8 w-52 max-w-[70%]" />
              <Skeleton className="ml-auto h-8 w-20" />
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 max-w-64" />
                  <Skeleton className="h-3 w-1/2 max-w-40" />
                </div>
                <Skeleton className="hidden h-5 w-20 sm:block" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
