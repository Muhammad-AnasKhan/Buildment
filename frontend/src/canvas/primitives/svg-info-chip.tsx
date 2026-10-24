import { cn } from "@/lib/utils";
import { NEUTRAL, TONES, type Tone } from "./tones";

// A small read-only chip drawn inside a beat picture: a pill with a short
// result in words, such as "writes lost: 300". Not a button. The tone paints
// it good, warn or bad; with no tone it is a plain card.

type InfoChipProps = {
  /** Left edge and top. */
  x: number;
  y: number;
  width: number;
  height?: number;
  text: string;
  tone?: Tone;
};

/** A width that fits a label at the chip's text size, with room on both sides. */
export function infoChipWidth(text: string): number {
  return Math.ceil(text.length * 6.9 + 22);
}

export function InfoChip({ x, y, width, height = 26, text, tone }: InfoChipProps) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={height / 2} className="fill-card" />
      <rect x={x} y={y} width={width} height={height} rx={height / 2} strokeWidth={1.75} className={cn("transition-colors duration-200 motion-reduce:transition-none", tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn("fill-transparent", NEUTRAL.line))} />
      <text x={x + width / 2} y={y + height / 2 + 4.5} textAnchor="middle" className={cn(tone ? TONES[tone].text : NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{text}</text>
    </g>
  );
}
