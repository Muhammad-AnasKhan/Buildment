"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surfaces the real cause in the browser console; the API server logs the same request.
    console.error("Admin segment failed:", error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto my-12 max-w-xl rounded-2xl border border-destructive/30 bg-card p-6 text-card-foreground shadow-sm"
    >
      <h1 className="text-lg font-semibold">This admin page could not load</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The API may be temporarily unavailable, or you may no longer have access. Try again, or return
        to the overview.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/admin"
          className="inline-flex h-8 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          Back to overview
        </Link>
      </div>
    </section>
  );
}
