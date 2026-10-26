import Image from "next/image";
import { MASCOT_ROLE_MAP, MASCOTS, type MascotRole, type MascotState } from "@/shared/engagement/mascots";
import { cn } from "@/lib/utils";

// A mascot that sits quietly on a page instead of popping up: a still pose beside a short hint.
// It never speaks or moves, so it can sit next to anything. The character comes from the role, so
// recasting a role in mascots.ts recasts it here too.

/** The still pose for a role, falling back to the cast mascot's idle pose. */
function stillFor(role: MascotRole, state: MascotState) {
  const mascot = MASCOTS[MASCOT_ROLE_MAP[role]] ?? Object.values(MASCOTS)[0]!;
  const asset = mascot.states[state] ?? mascot.states.idle;
  return { name: mascot.name, image: asset.image, alt: asset.alt };
}

/** The mascot's picture for an empty state, sized by the caller. */
export function MascotStill({ role, state, className }: { role: MascotRole; state: MascotState; className?: string }) {
  const still = stillFor(role, state);
  return <Image src={still.image} alt={still.alt} width={96} height={96} unoptimized className={className} />;
}

/** A small card with the supporter's tip of the day. */
export function MascotTipCard({ tip, className }: { tip: string; className?: string }) {
  const still = stillFor("supporter", "idle");
  return (
    <section aria-label={`${still.name}'s tip`} className={cn("flex items-start gap-3 rounded-xl border bg-card p-4", className)}>
      <Image src={still.image} alt="" width={48} height={48} unoptimized className="size-12 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{still.name}&apos;s tip</p>
        <p className="mt-1 text-sm leading-6 text-card-foreground">{tip}</p>
      </div>
    </section>
  );
}
