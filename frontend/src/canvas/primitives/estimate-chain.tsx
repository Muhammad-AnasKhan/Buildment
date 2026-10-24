"use client";

import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { NEUTRAL, TONES, type Tone } from "./tones";

// The working of an estimate drawn as a chain of cards: each card holds one
// number with its unit, each link says what was done to get there ("× 20
// each", "÷ 86,400 s"), and dots flow along the links at a rate set by the
// caller. Some numbers are inputs: tap one to pick it, drag it sideways or
// use the arrow keys to change it. Data-driven, so every case study can draw
// its own estimate with the same parts.

export type ChainInput = {
  id: string;
  /** Plain words for the slider and screen readers: "Daily users". */
  label: string;
  steps: readonly number[];
  value: number;
  format: (value: number) => string;
  /** What a screen reader says for the current value. Defaults to "label: formatted value". */
  valueText?: string;
};

export type ChainCard = {
  id: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** The number with its unit: "231 /s". */
  value: string;
  /** What the number is: "a second, average". */
  label: string;
  /** This card is an input the learner can change. */
  input?: string;
  /** Colour of the number when it carries a verdict. */
  tone?: Tone;
  /** A ring around the card: the number that drives the design. */
  mark?: Tone;
};

export type ChainLink = {
  id: string;
  /** The path dots travel along, card centre to card centre. */
  points: readonly [number, number][];
  /** What the step does, written on the link. */
  chip?: string;
  /** Where the chip sits. Defaults to the middle of the path. */
  chipAt?: [number, number];
  /** The chip is an input the learner can change. */
  input?: string;
  /** Dots per second. */
  rate: number;
  tone: Tone;
};

type EstimateChainProps = {
  width: number;
  height: number;
  cards: readonly ChainCard[];
  links: readonly ChainLink[];
  inputs: readonly ChainInput[];
  selected: string;
  onSelect: (id: string) => void;
  onChange: (id: string, value: number) => void;
  seconds: number;
  reduced: boolean;
  verdict: { text: string; tone: Tone };
  description: string;
  /** Optional extra SVG drawn under the cards, for example a line saying what is assumed. */
  footer?: ReactNode;
};

const CARD_W = 124;
const CARD_H = 40;
const DOT_GAP = 24;
const PX_PER_STEP = 22;
const r2 = (v: number) => Math.round(v * 100) / 100;

function pathLength(points: readonly [number, number][]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return total;
}

function pointAt(points: readonly [number, number][], distance: number): [number, number] {
  let left = distance;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (left <= seg || i === points.length - 1) {
      const t = seg > 0 ? Math.min(1, left / seg) : 0;
      return [r2(x0 + (x1 - x0) * t), r2(y0 + (y1 - y0) * t)];
    }
    left -= seg;
  }
  return points[points.length - 1] as [number, number];
}

function stepIndex(input: ChainInput) {
  const i = input.steps.indexOf(input.value);
  return i >= 0 ? i : 0;
}

/** Keyboard, tap and sideways drag for one input drawn in the picture. */
function useInputHandlers(input: ChainInput | undefined, onSelect: (id: string) => void, onChange: (id: string, value: number) => void) {
  const drag = useRef<{ x: number; index: number } | null>(null);
  if (!input) return {};
  const set = (index: number) => onChange(input.id, input.steps[Math.max(0, Math.min(input.steps.length - 1, index))]);
  return {
    role: "slider",
    tabIndex: 0,
    "aria-label": input.label,
    "aria-valuemin": 1,
    "aria-valuemax": input.steps.length,
    "aria-valuenow": stepIndex(input) + 1,
    "aria-valuetext": input.valueText ?? `${input.label}: ${input.format(input.value)}`,
    onFocus: () => onSelect(input.id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") set(stepIndex(input) + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(stepIndex(input) - 1);
      else if (e.key === "Home") set(0);
      else if (e.key === "End") set(input.steps.length - 1);
      else return;
      e.preventDefault();
    },
    onPointerDown: (e: PointerEvent<SVGGElement>) => {
      onSelect(input.id);
      drag.current = { x: e.clientX, index: stepIndex(input) };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<SVGGElement>) => {
      if (drag.current) set(drag.current.index + Math.round((e.clientX - drag.current.x) / PX_PER_STEP));
    },
    onPointerUp: () => (drag.current = null),
    onPointerCancel: () => (drag.current = null),
  } as const;
}

function InputTarget({ input, onSelect, onChange, children }: { input?: ChainInput; onSelect: (id: string) => void; onChange: (id: string, value: number) => void; children: ReactNode }) {
  const handlers = useInputHandlers(input, onSelect, onChange);
  if (!input) return <g>{children}</g>;
  return (
    <g {...handlers} className="group cursor-ew-resize touch-none outline-none">
      {children}
    </g>
  );
}

/** A focus and selection ring around an input, drawn in SVG because CSS rings do not show on SVG shapes. */
function InputRing({ x, y, w, h, rx, selected }: { x: number; y: number; w: number; h: number; rx: number; selected: boolean }) {
  return (
    <>
      <rect x={r2(x - 4)} y={y - 4} width={r2(w + 8)} height={h + 8} rx={rx + 4} className={cn("fill-none", TONES.accent.stroke, selected ? "opacity-60" : "opacity-0")} strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={r2(x - 4)} y={y - 4} width={r2(w + 8)} height={h + 8} rx={rx + 4} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
    </>
  );
}

export function EstimateChain({ width, height, cards, links, inputs, selected, onSelect, onChange, seconds, reduced, verdict, description, footer }: EstimateChainProps) {
  const byId = (id?: string) => (id ? inputs.find((i) => i.id === id) : undefined);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label={description} className="block h-auto w-full select-none">
      <DotGrid width={width} height={height} />

      {/* Links first, then the dots on them, so cards cover the ends. */}
      {links.map((link) => (
        <polyline key={link.id} points={link.points.map((p) => p.join(",")).join(" ")} fill="none" strokeWidth={2} strokeLinejoin="round" className={cn(TONES[link.tone].stroke)} opacity={0.4} />
      ))}
      {links.map((link) => {
        const length = pathLength(link.points);
        if (length <= 0) return null;
        const offset = reduced ? DOT_GAP / 2 : (seconds * link.rate * DOT_GAP) % DOT_GAP;
        const dots: [number, number][] = [];
        for (let d = offset; d < length; d += DOT_GAP) dots.push(pointAt(link.points, d));
        return (
          <g key={`dots-${link.id}`} aria-hidden>
            {dots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.2} className={TONES[link.tone].solidFill} />
            ))}
          </g>
        );
      })}

      {cards.map((card) => {
        const w = card.w ?? CARD_W;
        const h = card.h ?? CARD_H;
        const left = card.x - w / 2;
        const top = card.y - h / 2;
        const input = byId(card.input);
        const isSel = !!input && selected === input.id;
        return (
          <InputTarget key={card.id} input={input} onSelect={onSelect} onChange={onChange}>
            {card.mark ? <rect x={left - 6} y={top - 6} width={w + 12} height={h + 12} rx={18} className={cn("fill-none", TONES[card.mark].stroke)} strokeWidth={2.5} /> : null}
            <rect x={left} y={top + 3} width={w} height={h} rx={12} className="fill-foreground/[0.06]" />
            <rect x={left} y={top} width={w} height={h} rx={12} className={NEUTRAL.surface} />
            <rect x={left} y={top} width={w} height={h} rx={12} className={cn(input ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line))} strokeWidth={1.5} />
            {input ? <InputRing x={left} y={top} w={w} h={h} rx={12} selected={isSel} /> : null}
            <text x={card.x} y={top + h / 2 - 1} textAnchor="middle" className={cn(input ? TONES.accent.text : card.tone ? TONES[card.tone].text : NEUTRAL.text, "text-[15.5px] font-bold tabular-nums")}>
              {input ? `‹ ${card.value} ›` : card.value}
            </text>
            <text x={card.x} y={top + h / 2 + 14} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
              {card.label}
            </text>
          </InputTarget>
        );
      })}

      {links.map((link) => {
        if (!link.chip) return null;
        const at = link.chipAt ?? pointAt(link.points, pathLength(link.points) / 2);
        const input = byId(link.input);
        const isSel = !!input && selected === input.id;
        const w = r2(link.chip.length * 6.4 + 18);
        const h = 20;
        return (
          <InputTarget key={`chip-${link.id}`} input={input} onSelect={onSelect} onChange={onChange}>
            {/* A wider, invisible hit area makes the small chip easier to touch. */}
            {input ? <rect x={r2(at[0] - w / 2 - 6)} y={at[1] - 18} width={r2(w + 12)} height={36} className="fill-transparent" /> : null}
            <rect x={r2(at[0] - w / 2)} y={at[1] - h / 2} width={w} height={h} rx={h / 2} className={NEUTRAL.surface} />
            <rect x={r2(at[0] - w / 2)} y={at[1] - h / 2} width={w} height={h} rx={h / 2} className={cn(input ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line))} strokeWidth={1.5} />
            {input ? <InputRing x={r2(at[0] - w / 2)} y={at[1] - h / 2} w={w} h={h} rx={h / 2} selected={isSel} /> : null}
            <text x={at[0]} y={at[1] + 4.2} textAnchor="middle" className={cn(input ? TONES.accent.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
              {link.chip}
            </text>
          </InputTarget>
        );
      })}

      {footer}

      <VerdictBanner width={width} text={verdict.text} tone={verdict.tone} />
    </svg>
  );
}

/** One big slider under the picture for the input picked in the picture. */
export function StepSlider({ input, onChange }: { input: ChainInput; onChange: (id: string, value: number) => void }) {
  const index = stepIndex(input);
  return (
    <div className="w-full rounded-xl border border-border bg-muted/15 px-4 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{input.label}</span>
        <span className="text-sm font-semibold tabular-nums text-blue-800 dark:text-blue-200">{input.format(input.value)}</span>
      </div>
      <Slider
        value={[index]}
        min={0}
        max={input.steps.length - 1}
        step={1}
        onValueChange={(next) => onChange(input.id, input.steps[Array.isArray(next) ? next[0] : next])}
        getAriaLabel={() => input.label}
        getAriaValueText={() => input.format(input.value)}
        className="py-4"
      />
    </div>
  );
}
