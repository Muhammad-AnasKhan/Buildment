"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { NEUTRAL, TONES, type Tone } from "./tones";

// Small pieces shared by the context picker, flip deck, commit story and word
// sampler: the reduced-motion flag, a banner whose text wraps over several
// lines, and a static pill. They follow the look of svg-parts.tsx.

/** True when the learner asked for reduced motion; false on the server and until the first effect. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  return reduced;
}

const ICON: Record<Tone, typeof CircleCheck> = { good: CircleCheck, bad: CircleX, warn: TriangleAlert, accent: Info };

/** Characters per line that fit a WrapBanner of the standard width at 14px. */
export const BANNER_CHARS = 44;
const LINE = 19;
const PAD = 11;

/** Height of a WrapBanner with `lines` lines of text. */
export function wrapBannerHeight(lines: number) {
  return PAD * 2 + Math.max(1, lines) * LINE - 4;
}

/** A VerdictBanner-style note whose text wraps: an icon, then up to a few lines, across the picture's width. */
export function WrapBanner({ width, y, lines, tone, opacity = 1 }: { width: number; y: number; lines: string[]; tone: Tone; opacity?: number }) {
  const t = TONES[tone];
  const IconCmp = ICON[tone];
  const h = wrapBannerHeight(lines.length);
  const x = 12;
  const w = width - 24;
  return (
    <g opacity={opacity} className="transition-opacity duration-200 motion-reduce:transition-none">
      <rect x={x} y={y} width={w} height={h} rx={16} className="fill-card" />
      <rect x={x} y={y} width={w} height={h} rx={16} className={cn(t.softFill, t.stroke)} strokeWidth={2} />
      <IconCmp x={x + 12} y={y + PAD - 1} width={16} height={16} strokeWidth={2.25} className={cn(t.stroke, "fill-none")} aria-hidden />
      {lines.map((line, i) => (
        <text key={i} x={x + 38} y={y + PAD + 11 + i * LINE} className={cn(t.text, "text-[14px] font-semibold")}>
          {line}
        </text>
      ))}
    </g>
  );
}

/** A small static label pill, 22 units tall, centred on `y` and starting at `x`. Returns its width through `pillWidth`. */
export function pillWidth(text: string, size = 13) {
  return Math.ceil(text.length * size * 0.6 + 18);
}

export function Pill({ x, y, text, tone, solid = false }: { x: number; y: number; text: string; tone?: Tone; solid?: boolean }) {
  const w = pillWidth(text);
  return (
    <g>
      <rect
        x={x}
        y={y - 11}
        width={w}
        height={22}
        rx={11}
        className={cn(
          solid ? "fill-blue-600 dark:fill-blue-400" : tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn("fill-muted", NEUTRAL.line),
          "transition-colors duration-200 motion-reduce:transition-none"
        )}
        strokeWidth={solid ? 0 : 1.25}
      />
      <text
        x={x + w / 2}
        y={y + 4.5}
        textAnchor="middle"
        className={cn("text-[13px] font-semibold", solid ? "fill-white dark:fill-blue-950" : tone ? TONES[tone].text : NEUTRAL.mutedText)}
      >
        {text}
      </text>
    </g>
  );
}
