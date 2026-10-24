"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  FILES,
  ORDERS,
  formatTenths,
  layersOf,
  rebuiltFlags,
  rebuiltLabels,
  totalTenths,
  verdictFor,
  type FileId,
  type OrderId,
} from "./model";

const W = 420;
const H = 396;
const CHIP_Y = 62;
const SLOT = 46;
const CARD = { x: 14, w: 392, h: 40 };
const STACK_TOP = 128;
const SLOTS = 5;
const PILL_W = 84;

/** A number that counts up from zero to its target each time the target changes; it shows the target at once when motion is reduced. */
function useCountUp(target: number, reduced: boolean) {
  const [shown, setShown] = useState(target);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      setShown(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return reduced ? target : shown;
}

function usePrefersReducedMotion() {
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

/** 18.3 beat 2: tap a file to change it, switch the Dockerfile order, and see which layers rebuild. */
export function LayerCacheCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const titleId = useId();
  const descId = useId();
  const reduced = usePrefersReducedMotion();
  const [order, setOrder] = useState<OrderId>("A");
  const [file, setFile] = useState<FileId>("server");

  const layers = layersOf(order);
  const flags = rebuiltFlags(order, file);
  const total = totalTenths(order, file);
  const verdict = verdictFor(order, file);
  const counted = useCountUp(total, reduced);
  const orderInfo = ORDERS.find((o) => o.id === order) ?? ORDERS[0];
  const fileInfo = FILES.find((f) => f.id === file) ?? FILES[0];

  const widths = FILES.map((f) => chipWidth(f.label));
  const chipX = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 10 * (FILES.length - 1))) / 2, 10);
  const slotY = (i: number) => STACK_TOP + (SLOTS - 1 - i) * SLOT;

  const rebuilt = rebuiltLabels(order, file);
  const description = `${orderInfo.title}. ${fileInfo.full} changed. ${rebuilt.length === 0 ? "No layer is rebuilt." : `Rebuilt: ${rebuilt.join(", ")}.`} Total build time ${formatTenths(total)}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>file</b> to change it, then switch the <b>order</b>.
        </>
      }
      controls={<BeatChoice label="Dockerfile order" options={[{ id: "A", label: ORDERS[0].label }, { id: "B", label: ORDERS[1].label }]} value={order} onChange={setOrder} />}
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        <g role="radiogroup" aria-label="File that changed">
          {FILES.map((f, i) => (
            <SvgRadioChip key={f.id} x={chipX[i]} y={CHIP_Y} width={widths[i]} text={f.label} label={`Change ${f.full}`} checked={file === f.id} onSelect={() => setFile(f.id)} />
          ))}
        </g>
        {FILES.map((f, i) => (
          <text key={`note-${f.id}`} x={chipX[i] + widths[i] / 2} y={CHIP_Y + 35} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{f.note}</text>
        ))}

        <text x={CARD.x} y={STACK_TOP - 12} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{orderInfo.title}</text>

        {layers.map((l, i) => {
          const hot = flags[i];
          const tone = hot ? TONES.warn : TONES.good;
          return (
            <g key={l.id} style={{ transform: `translate(0px, ${slotY(i)}px)` }} className="transition-transform duration-500 motion-reduce:transition-none">
              <g className="animate-in fade-in [animation-duration:300ms] motion-reduce:animate-none">
              <rect x={CARD.x} y={3} width={CARD.w} height={CARD.h} rx={12} className="fill-foreground/[0.06]" />
              <rect x={CARD.x} y={0} width={CARD.w} height={CARD.h} rx={12} strokeWidth={hot ? 2 : 1.5} className={cn(NEUTRAL.surface, hot ? TONES.warn.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
              {hot ? <rect x={CARD.x} y={0} width={CARD.w} height={CARD.h} rx={12} className={cn(TONES.warn.softFill, "transition-colors duration-200 motion-reduce:transition-none")} /> : null}
              <text x={CARD.x + 14} y={CARD.h / 2 + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{l.label}</text>
              <rect x={CARD.x + CARD.w - PILL_W - 10} y={(CARD.h - 24) / 2} width={PILL_W} height={24} rx={12} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={CARD.x + CARD.w - PILL_W / 2 - 10} y={CARD.h / 2 + 4.5} textAnchor="middle" className={cn(tone.text, "text-[12px] font-bold tabular-nums")}>{hot ? formatTenths(l.tenths) : "CACHED"}</text>
              </g>
            </g>
          );
        })}

        <text x={W / 2} y={H - 18} textAnchor="middle" className={cn(NEUTRAL.text, "text-[20px] font-bold tabular-nums")}>{`Build time: ${formatTenths(counted)}`}</text>

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
