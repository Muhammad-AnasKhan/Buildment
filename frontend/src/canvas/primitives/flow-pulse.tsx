import { cn } from "@/lib/utils";

type FlowPulseProps = {
  /** The arrow's path, in the same viewBox units as the arrow. */
  d: string;
  /** Where to sit when motion is reduced. */
  mid: [number, number];
  /** Solid fill and stroke classes, from TONES. */
  stroke: string;
  fill: string;
};

/**
 * A short bright segment that travels along the active arrow, so the eye reads
 * the direction of the step. Pure CSS (a dash offset animation, no SMIL and no
 * JavaScript timer). With reduced motion the segment is hidden and a still dot
 * marks the middle of the arrow instead.
 */
export function FlowPulse({ d, mid, stroke, fill }: FlowPulseProps) {
  return (
    <g aria-hidden>
      <path
        d={d}
        pathLength={100}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        className={cn("canvas-flow-pulse motion-reduce:hidden", stroke)}
      />
      <circle cx={mid[0]} cy={mid[1]} r={4} className={cn("hidden motion-reduce:inline", fill)} />
    </g>
  );
}
