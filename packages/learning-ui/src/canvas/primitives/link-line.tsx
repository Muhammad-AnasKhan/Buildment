import { NEUTRAL } from "./tones";
import { cn } from "../../lib/utils";

// A link between two cards, drawn as a chain of short pieces. A long diagonal
// line has a big bounding box that reaches over labels it never touches; short
// pieces keep each box close to the line, which is what the text QA measures.

type LinkLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className?: string;
  strokeWidth?: number;
  /** Longest piece, in viewBox units. */
  piece?: number;
};

const r1 = (v: number) => Math.round(v * 10) / 10;

export function LinkLine({ x1, y1, x2, y2, className = NEUTRAL.faintStroke, strokeWidth = 1.75, piece = 18 }: LinkLineProps) {
  const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / piece));
  return (
    <g aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <line
          key={i}
          x1={r1(x1 + ((x2 - x1) * i) / n)}
          y1={r1(y1 + ((y2 - y1) * i) / n)}
          x2={r1(x1 + ((x2 - x1) * (i + 1)) / n)}
          y2={r1(y1 + ((y2 - y1) * (i + 1)) / n)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(className)}
        />
      ))}
    </g>
  );
}
