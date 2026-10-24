import { cn } from "@/lib/utils";
import { NEUTRAL, TONES } from "./tones";

// A horizontal gauge drawn inside a beat picture: a title and a value over a
// bar, with a marker for the limit and its label under the bar. The bar is
// good (green) within the limit and bad (red) over it, and the verdict is
// always written next to it, so colour is never the only signal. Dots flow
// along the filled part at a speed the caller sets. Data-driven: another
// course can draw its own limit (a budget, a quota, an error rate).

export const GAUGE_H = 58;

type LimitGaugeProps = {
  x: number;
  y: number;
  width: number;
  /** Words over the bar, at the left. */
  title: string;
  /** The value, at the right of the title row. */
  value: string;
  /** 0 to 1 of the full scale. */
  fill: number;
  /** 0 to 1 of the full scale: where the limit marker stands. */
  limitAt: number;
  /** Under the marker, for example "plan 150,000". */
  limitLabel: string;
  /** Right side, under the bar. */
  note?: string;
  over: boolean;
  /** Dots a second along the filled part; 0 or less draws none. */
  flow?: number;
  /** Seconds on the beat clock. */
  seconds?: number;
};

const r1 = (v: number) => Math.round(v * 10) / 10;
const BAR_H = 14;
const DOT_GAP = 26;

export function LimitGauge({ x, y, width, title, value, fill, limitAt, limitLabel, note, over, flow = 0, seconds = 0 }: LimitGaugeProps) {
  const tone = over ? "bad" : "good";
  const fillW = r1(Math.max(0, Math.min(1, fill)) * width);
  const markX = r1(x + Math.max(0, Math.min(1, limitAt)) * width);
  const barY = y + 20;
  const dots: number[] = [];
  if (flow > 0 && fillW > 10) {
    const offset = (seconds * flow * DOT_GAP) % DOT_GAP;
    for (let d = offset; d < fillW - 8; d += DOT_GAP) dots.push(r1(x + 6 + d));
  }
  // Keep the label inside the picture: centred on the marker, pushed in near the ends.
  const labelHalf = limitLabel.length * 3.3;
  const labelX = r1(Math.max(x + labelHalf, Math.min(x + width - labelHalf, markX)));
  return (
    <g>
      <text x={x} y={y + 12} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
        {title}
      </text>
      <text x={x + width} y={y + 12} textAnchor="end" className={cn(TONES[tone].text, "text-[12.5px] font-bold tabular-nums")}>
        {value}
      </text>
      <rect x={x} y={barY} width={width} height={BAR_H} rx={BAR_H / 2} className="fill-muted" />
      <rect x={x} y={barY} width={fillW} height={BAR_H} rx={BAR_H / 2} style={{ width: fillW }} className={cn(TONES[tone].solidFill, "transition-[width,fill] duration-300 motion-reduce:transition-none")} />
      {dots.map((cx, i) => (
        <circle key={i} cx={cx} cy={barY + BAR_H / 2} r={2.6} className="fill-card" opacity={0.9} aria-hidden />
      ))}
      <line x1={markX} x2={markX} y1={barY - 4} y2={barY + BAR_H + 4} strokeWidth={2.5} strokeLinecap="round" className="stroke-foreground" />
      <text x={labelX} y={y + 52} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium tabular-nums")}>
        {limitLabel}
      </text>
      {note ? (
        <text x={x + width} y={y + 52} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium tabular-nums")}>
          {note}
        </text>
      ) : null}
    </g>
  );
}
