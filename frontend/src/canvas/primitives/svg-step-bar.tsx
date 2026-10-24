import { cn } from "@/lib/utils";
import { NEUTRAL, TONES } from "./tones";

// A stacked bar of steps in a row, drawn inside a beat picture, with a key
// under it: each step has a swatch, a name and its amount. Used for "how long
// until it is back" pictures, where the steps add up to a total. The bar can be
// part filled (progress 0 to 1 of the total) so a step bar can fill while a
// clock runs. Data-driven: another course can pass its own steps and unit.

export type StepTone = "accent" | "warn" | "good" | "bad" | "neutral";
export type BarStep = { id: string; label: string; amount: number; tone: StepTone };

const FILL: Record<StepTone, string> = {
  accent: TONES.accent.solidFill,
  warn: TONES.warn.solidFill,
  good: TONES.good.solidFill,
  bad: TONES.bad.solidFill,
  neutral: NEUTRAL.doneFill,
};

const GLYPH = 6.5;
const SWATCH = 10;
const KEY_GAP = 14;
const KEY_ROW = 20;

const r1 = (v: number) => Math.round(v * 10) / 10;
const amountText = (a: number) => (Number.isInteger(a) ? String(a) : a.toFixed(1));

export const stepTotal = (steps: readonly BarStep[]) => steps.reduce((sum, s) => sum + s.amount, 0);

/** Where each step starts, in the steps' own unit. */
export function stepStarts(steps: readonly BarStep[]): number[] {
  const out: number[] = [];
  let at = 0;
  for (const s of steps) {
    out.push(at);
    at += s.amount;
  }
  return out;
}

export type KeyItem = { id: string; text: string; x: number; row: number };

/** The key's items, wrapped into rows between x0 and x1. */
export function keyLayout(steps: readonly BarStep[], unit: string, x0: number, x1: number): KeyItem[] {
  const items: KeyItem[] = [];
  let x = x0;
  let row = 0;
  for (const s of steps) {
    const text = `${s.label} ${amountText(s.amount)}${unit ? ` ${unit}` : ""}`;
    const width = SWATCH + 5 + text.length * GLYPH;
    if (x > x0 && x + width > x1) {
      row += 1;
      x = x0;
    }
    items.push({ id: s.id, text, x, row });
    x += width + KEY_GAP;
  }
  return items;
}

/** Height of the key, in viewBox units. */
export function keyHeight(steps: readonly BarStep[], unit: string, x0: number, x1: number): number {
  const rows = keyLayout(steps, unit, x0, x1).reduce((m, i) => Math.max(m, i.row), 0) + 1;
  return rows * KEY_ROW;
}

type StepBarProps = {
  x0: number;
  x1: number;
  /** Top of the bar. */
  y: number;
  h?: number;
  steps: readonly BarStep[];
  /** What the full width stands for, in the steps' unit. */
  scaleMax: number;
  /** 0 to 1 of the total that is filled. */
  progress?: number;
  unit: string;
  /** Top of the key. */
  keyY: number;
  /** Draw the key under the bar (default). */
  showKey?: boolean;
};

export function StepBar({ x0, x1, y, h = 24, steps, scaleMax, progress = 1, unit, keyY, showKey = true }: StepBarProps) {
  const per = (x1 - x0) / scaleMax;
  const cut = Math.max(0, Math.min(1, progress)) * stepTotal(steps);
  const starts = stepStarts(steps);
  const key = showKey ? keyLayout(steps, unit, x0, x1) : [];
  return (
    <g aria-hidden>
      <rect x={x0} y={y} width={x1 - x0} height={h} rx={5} className="fill-muted" />
      {steps.map((s, i) => {
        const shown = Math.max(0, Math.min(s.amount, cut - starts[i]));
        if (shown <= 0) return null;
        return <rect key={s.id} x={r1(x0 + starts[i] * per)} y={y} width={Math.max(1.5, r1(shown * per))} height={h} rx={4} strokeWidth={1.5} className={cn(FILL[s.tone], "stroke-card")} />;
      })}
      {key.map((item, i) => {
        const ky = keyY + item.row * KEY_ROW;
        return (
          <g key={item.id}>
            <rect x={r1(item.x)} y={ky + 4} width={SWATCH} height={SWATCH} rx={3} className={FILL[steps[i].tone]} />
            <text x={r1(item.x + SWATCH + 5)} y={ky + 13.5} className={cn(NEUTRAL.text, "text-[11.5px] font-medium tabular-nums")}>{item.text}</text>
          </g>
        );
      })}
    </g>
  );
}
