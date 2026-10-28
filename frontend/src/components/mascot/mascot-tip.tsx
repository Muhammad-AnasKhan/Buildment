import { Dot } from "@/components/brand/dot";
import { dotMoodForState } from "@/components/mascot/dot-mood";
import type { MascotRole, MascotState } from "@/shared/engagement/mascots";
import { cn } from "@/lib/utils";

// Dot sitting quietly on a page instead of popping up: a still mood beside a short hint. It never
// speaks or moves, so it can sit next to anything.

/** Dot for an empty state, sized by the caller. The role is kept so callers do not change. */
export function MascotStill({ state, className }: { role?: MascotRole; state: MascotState; className?: string }) {
  return (
    <div className={className}>
      <Dot mood={state === "begin" ? "sleep" : dotMoodForState(state)} size={112} />
    </div>
  );
}

/** A small card with the tip of the day. */
export function MascotTipCard({ tip, className }: { tip: string; className?: string }) {
  return (
    <section aria-label="Dot's tip" className={cn("flex items-start gap-3 rounded-lg border border-border bg-card p-4", className)}>
      <Dot mood="happy" size={56} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-muted-foreground">Dot&apos;s tip</p>
        <p className="mt-1 text-base leading-6 text-card-foreground">{tip}</p>
      </div>
    </section>
  );
}
