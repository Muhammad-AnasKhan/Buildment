import Link from "next/link";
import type { AdminPageInfo } from "@/shared/api/admin";
import { cn } from "@/lib/utils";

// Numbered pagination shared by the admin lists. Server-rendered Links (no client
// JS); changing page is a real page change, so it scrolls to the top by design.

const linkClass =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-background px-2 text-sm font-medium tabular-nums transition-colors hover:bg-muted";
const currentClass = "border-transparent bg-foreground text-background";
const disabledClass = "pointer-events-none opacity-40";

/** First, last, and the pages around the current one, with "gap" for the jumps. */
function pageWindow(page: number, pageCount: number, span = 1): Array<number | "gap"> {
  const wanted = new Set<number>([1, pageCount]);
  for (let candidate = page - span; candidate <= page + span; candidate += 1) {
    if (candidate >= 1 && candidate <= pageCount) wanted.add(candidate);
  }
  const sorted = [...wanted].sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) items.push("gap");
    items.push(value);
    previous = value;
  }
  return items;
}

export function AdminPagination({
  page,
  hrefFor,
}: {
  page: AdminPageInfo;
  hrefFor: (page: number) => string;
}) {
  const { page: current, pageCount, total, pageSize } = page;
  const first = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const last = Math.min(current * pageSize, total);

  if (pageCount <= 1) {
    return (
      <p className="mt-4 text-center text-xs text-muted-foreground">
        {total} result{total === 1 ? "" : "s"}
      </p>
    );
  }

  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {first}–{last} of {total} · page {current} of {pageCount}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {current > 1 ? (
          <Link href={hrefFor(current - 1)} rel="prev" className={linkClass}>
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(linkClass, disabledClass)}>
            Previous
          </span>
        )}

        {pageWindow(current, pageCount).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : item === current ? (
            <span key={item} aria-current="page" className={cn(linkClass, currentClass)}>
              {item}
            </span>
          ) : (
            <Link key={item} href={hrefFor(item)} className={linkClass} aria-label={`Page ${item}`}>
              {item}
            </Link>
          )
        )}

        {current < pageCount ? (
          <Link href={hrefFor(current + 1)} rel="next" className={linkClass}>
            Next
          </Link>
        ) : (
          <span aria-disabled="true" className={cn(linkClass, disabledClass)}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
