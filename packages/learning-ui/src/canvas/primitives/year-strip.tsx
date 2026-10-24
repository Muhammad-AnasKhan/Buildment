import { cn } from "../../lib/utils";
import { NEUTRAL, TONES, type Tone } from "./tones";

// One year as a grid of 365 small squares, one per day, seven to a column
// like a contributions calendar. Some days are marked (down time, a spent
// error budget, a busy day), each filled in proportion to how much of the
// day it stands for. An optional cursor marks the week being played.
// Data-driven: availability, SLO and incident pictures can all reuse it.

export type MarkedDay = { day: number; fraction: number; tone: Tone };

export const YEAR_DAYS = 365;
export const WEEK_COLUMNS = Math.ceil(YEAR_DAYS / 7);

type YearStripProps = {
  x: number;
  y: number;
  /** Distance from one square to the next. */
  pitch?: number;
  marked: readonly MarkedDay[];
  /** Week column to outline, 0 to 52. */
  cursorWeek?: number | null;
};

const r2 = (v: number) => Math.round(v * 100) / 100;

export function weekOf(day: number) {
  return Math.floor(day / 7);
}

export function YearStrip({ x, y, pitch = 7.4, marked, cursorWeek = null }: YearStripProps) {
  const size = r2(pitch - 1.4);
  const at = (day: number) => ({ cx: r2(x + weekOf(day) * pitch), cy: r2(y + (day % 7) * pitch) });
  const marks = new Map(marked.map((m) => [m.day, m]));
  return (
    <g aria-hidden>
      {Array.from({ length: YEAR_DAYS }, (_, day) => {
        const { cx, cy } = at(day);
        return <rect key={day} x={cx} y={cy} width={size} height={size} rx={1.2} className={marks.has(day) ? "fill-muted-foreground/15" : "fill-muted-foreground/25"} />;
      })}
      {marked.map((m) => {
        const { cx, cy } = at(m.day);
        const f = Math.max(0, Math.min(1, m.fraction));
        const h = r2(size * f);
        return (
          <g key={`m-${m.day}`}>
            <rect x={cx} y={r2(cy + size - h)} width={size} height={h} rx={1.2} className={TONES[m.tone].solidFill} />
            {/* A thin ring keeps a nearly empty day findable. */}
            {f < 0.5 ? <rect x={cx - 1} y={cy - 1} width={size + 2} height={size + 2} rx={2} className={cn("fill-none", TONES[m.tone].stroke)} strokeWidth={1.2} /> : null}
          </g>
        );
      })}
      {cursorWeek !== null && cursorWeek >= 0 ? (
        <rect x={r2(x + cursorWeek * pitch - 1.6)} y={y - 1.6} width={r2(size + 3.2)} height={r2(7 * pitch - 1.4 + 3.2)} rx={2.5} className={cn("fill-none", NEUTRAL.doneStroke)} strokeWidth={1.5} />
      ) : null}
    </g>
  );
}
