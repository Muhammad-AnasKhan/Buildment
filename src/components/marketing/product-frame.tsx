import { Check, LockKeyhole, MessageSquareText, Timer } from "lucide-react";

const CHAPTERS = [
  { title: "Project skeleton", state: "done" },
  { title: "Database design", state: "done" },
  { title: "Authentication", state: "current" },
  { title: "Authorization", state: "locked" },
] as const;

export function ProductFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[36rem] lg:mx-0">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
            <span className="size-2.5 rounded-full bg-foreground/10" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">FreshMarket · Module 06</p>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1 font-mono text-[10px] tabular-nums text-muted-foreground">
            <Timer className="size-3" /> 14:22
          </div>
        </div>

        <div className="grid sm:grid-cols-[10.5rem_1fr]">
          <div className="hidden border-r border-border bg-muted/20 p-3 sm:block">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Course path</p>
            <ol className="space-y-1">
              {CHAPTERS.map((chapter, index) => (
                <li key={chapter.title}>
                  <div className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${chapter.state === "current" ? "bg-foreground text-background" : "text-muted-foreground"}`}>
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {chapter.state === "done" ? <Check className="size-3.5" /> : chapter.state === "locked" ? <LockKeyhole className="size-3" /> : <span className="font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>}
                    </span>
                    <span className="truncate">{chapter.title}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Open question</span>
              <span className="text-xs text-muted-foreground">2 of 3 checkpoints</span>
            </div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 rounded-full bg-foreground" /></div>
            <h3 className="mt-6 text-lg font-semibold leading-snug tracking-tight">Where should the session token live after login?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Explain the choice and the security boundary it creates.</p>
            <div className="mt-5 rounded-xl border border-border bg-muted/35 p-4 text-sm leading-relaxed">An HttpOnly cookie on the API domain. The browser sends it automatically, while client JavaScript never gets access.</div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><MessageSquareText className="size-3.5" /> Mentor review</span>
              <span className="font-medium text-foreground">Submitted just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
