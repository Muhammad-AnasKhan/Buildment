import { cn } from "../../lib/utils";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "./tones";

// A number card drawn inside a beat picture: a small label over a bold value.
// A tone rings the card and colours the value. Used where a picture needs one
// to three numbers (at most) next to the thing they describe.

type SvgStatProps = {
  x: number;
  y: number;
  width: number;
  /** Words over the value, 11.5 units or more. */
  label: string;
  value: string;
  tone?: Tone | null;
  height?: number;
};

export function SvgStat({ x, y, width, label, value, tone = null, height = 44 }: SvgStatProps) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={12} strokeWidth={tone ? 2 : 1.5} className={cn(NEUTRAL.surface, tone ? TONES[tone].stroke : NEUTRAL.line, SHAPE_TRANSITION)} />
      <text x={x + 10} y={y + 16} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{label}</text>
      <text x={x + 10} y={y + 36} className={cn(tone ? TONES[tone].text : NEUTRAL.text, "text-[17px] font-bold tabular-nums")}>{value}</text>
    </g>
  );
}
