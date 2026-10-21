import { Flag, Map, Milestone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapConfig } from "@/shared/blocks/roadmap/schema";
import { readerCardLg, readerEyebrow } from "@/components/learn/reader-theme";

export function RoadmapClient({ title, milestones }: RoadmapConfig) {
  return (
    <section className={cn("not-prose my-8", readerCardLg)} aria-label={title} data-roadmap>
      <header className="border-b border-border bg-muted/25 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <Map className="size-4 text-muted-foreground" aria-hidden />
          <p className={readerEyebrow}>Course roadmap</p>
        </div>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Follow the milestones from foundation to finished project.</p>
      </header>
      <ol className="px-5 py-2 sm:px-6">
        {milestones.map((milestone, index) => {
          const current = milestone.state === "current";
          const goal = milestone.state === "goal";
          return (
            <li key={milestone.id} className="relative flex gap-4 py-4 sm:gap-5">
              {index < milestones.length - 1 ? <span className="absolute bottom-0 left-[17px] top-12 w-px bg-border sm:left-[19px]" aria-hidden /> : null}
              <span className={cn("relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums sm:size-10", current ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground")}>
                {goal ? <Flag className="size-4" aria-hidden /> : current ? <Milestone className="size-4" aria-hidden /> : String(index + 1).padStart(2, "0")}
              </span>
              <div className={cn("min-w-0 flex-1 rounded-xl border px-4 py-3.5", current ? "border-foreground/25 bg-muted/50" : "border-border bg-card")}>
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h4 className="text-sm font-semibold leading-snug text-foreground sm:text-base">{milestone.title}</h4>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", current ? "border-foreground/20 bg-foreground text-background" : "border-border bg-muted/50 text-muted-foreground")}>
                    {current ? "You are here" : goal ? "Goal" : "Upcoming"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
