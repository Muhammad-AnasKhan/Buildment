import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div role="status" aria-label="Loading editor" className="min-h-96 overflow-hidden rounded-xl border bg-card">
      <span className="sr-only">Loading editor…</span>
      <div aria-hidden="true">
        <div className="flex flex-wrap gap-2 border-b p-3">
          {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="size-8" />)}
        </div>
        <div className="space-y-4 p-5 sm:p-8">
          <Skeleton className="mb-7 h-8 w-1/2" />
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((width, i) => (
            <Skeleton key={i} className={`h-4 ${width}`} />
          ))}
          <Skeleton className="mt-8 h-28 w-full" />
        </div>
      </div>
    </div>
  );
}
