import { Skeleton } from "@/components/ui/skeleton";

// Homepage-specific fallback. Without it the root loading.tsx ("Loading workspace", a dashboard
// skeleton) would flash on the public landing page while the catalog is fetched.
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex-1">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true">
        <div className="h-16 border-b border-border" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8 lg:py-20">
          <div className="space-y-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-12 w-3/5" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
            <div className="flex gap-3 pt-3">
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-28" />
            </div>
          </div>
          <Skeleton className="h-[26rem] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
