import {
  Check,
  ChevronRight,
  Circle,
  Clock3,
  LockKeyhole,
  MessageSquareText,
} from "lucide-react";

const CHAPTERS = [
  { title: "Project skeleton", state: "done" },
  { title: "Database design", state: "done" },
  { title: "Authentication", state: "current" },
  { title: "Authorization", state: "locked" },
] as const;

export function ProductFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0">
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xl shadow-foreground/5">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-3.5 sm:px-4">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-foreground/20" />
            <span className="size-2 rounded-full bg-foreground/10" />
            <span className="size-2 rounded-full bg-foreground/10" />
          </div>

          <div className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
            <span className="truncate">FreshMarket</span>
            <ChevronRight className="size-3 shrink-0 opacity-50" />
            <span className="truncate text-foreground/80">Authentication</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
            <Clock3 className="size-3" />
            <span>14 min</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-[9.25rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-border/70 bg-muted/15 p-3 sm:block">
            <div className="mb-3 flex items-center justify-between px-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Module 06
              </p>
              <span className="text-[9px] tabular-nums text-muted-foreground">2/4</span>
            </div>

            <ol className="space-y-0.5">
              {CHAPTERS.map((chapter, index) => (
                <li key={chapter.title}>
                  <div
                    className={`flex items-center gap-2 rounded-md px-1.5 py-2 text-[10px] leading-tight ${
                      chapter.state === "current"
                        ? "bg-foreground font-medium text-background"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center">
                      {chapter.state === "done" ? (
                        <Check className="size-3" aria-hidden="true" />
                      ) : chapter.state === "locked" ? (
                        <LockKeyhole className="size-2.5" aria-hidden="true" />
                      ) : chapter.state === "current" ? (
                        <span className="font-mono text-[9px]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      ) : (
                        <Circle className="size-2.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="truncate">{chapter.title}</span>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mx-1.5 mt-4 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/2 rounded-full bg-foreground/70" />
            </div>
            <p className="mt-1.5 px-1.5 text-[9px] text-muted-foreground">
              50% complete
            </p>
          </aside>

          <section className="min-w-0 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-border bg-muted/30 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Open question
              </span>
              <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                2 of 3 checkpoints
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-foreground" />
            </div>

            <div className="mt-5 max-w-[20rem]">
              <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                Check your reasoning
              </p>
              <h3 className="text-[15px] font-semibold leading-snug tracking-tight sm:text-base">
                Where should the session token live after login?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Explain the choice and the security boundary it creates.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-border/80 bg-muted/25 p-3 text-xs leading-relaxed text-foreground/85">
              An HttpOnly cookie on the API domain keeps the token outside
              client-side JavaScript while allowing the browser to send it.
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MessageSquareText className="size-3" aria-hidden="true" />
                Mentor review
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
                Submitted
              </span>
            </div>
          </section>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -inset-x-5 -bottom-5 -z-10 h-24 rounded-full bg-muted/50 blur-3xl"
        aria-hidden="true"
      />
    </div>
  );
}
