const CHAPTERS = [
  { title: "Introduction", state: "done" },
  { title: "Project skeleton", state: "done" },
  { title: "Authentication", state: "current" },
  { title: "Login", state: "next" },
  { title: "Checkout", state: "next" },
] as const;

export function ProductFrame() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Authentication</p>
          <p className="truncate text-xs text-muted-foreground">FreshMarket · Module 6</p>
        </div>
        <p className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">00:14:22</p>
      </div>

      <div className="grid md:grid-cols-[9.5rem_1fr]">
        <ol className="hidden border-r border-border py-2 md:block">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.title}>
              <div
                className={
                  chapter.state === "current"
                    ? "border-l-2 border-foreground bg-muted/60 px-3 py-2 text-sm text-foreground"
                    : "border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground"
                }
              >
                {chapter.title}
              </div>
            </li>
          ))}
        </ol>

        <div className="p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">Open question</p>
          <p className="mt-2 text-sm font-medium leading-snug">
            Where should the session token live after login?
          </p>
          <div className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-3 text-sm leading-relaxed text-foreground">
            An HttpOnly cookie on the API domain. The browser sends it; client JavaScript never reads it.
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">Submitted</span>
            <span className="font-medium text-foreground">Waiting for review</span>
          </div>
        </div>
      </div>
    </div>
  );
}
