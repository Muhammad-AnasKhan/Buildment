"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { A_CENTER, B_BOUNDS, bandOverlap, clampB, OVERLAP_AXIS_MS, OVERLAP_EPS } from "./model";

const X0 = 30;
const X1 = 390;
const X = (ms: number) => X0 + (ms / OVERLAP_AXIS_MS) * (X1 - X0);
const M = (x: number) => ((x - X0) / (X1 - X0)) * OVERLAP_AXIS_MS;

/** Beat 3 of 10.6: drag B's band; overlapping bands mean the order is unknown. */
export function BandOverlapCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [b, setB] = useState<number>(B_BOUNDS.default);
  const [dragging, setDragging] = useState(false);
  const v = bandOverlap(A_CENTER, b);
  const sure = v.order !== "unknown";
  const tone = sure ? TONES.good : TONES.warn;

  const follow = (e: PointerEvent) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    setB(clampB(M(p.matrixTransform(m.inverse()).x)));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") setB((x) => clampB(x + 1));
    else if (e.key === "ArrowLeft") setB((x) => clampB(x - 1));
    else return;
    e.preventDefault();
  };
  const verdict = v.order === "unknown" ? "Order unknown" : v.order === "a-first" ? "A first, for sure" : "B first, for sure";

  const band = (center: number, y: number, cls: string, label: string) => (
    <g>
      <rect x={X(center - OVERLAP_EPS)} y={y} width={X(center + OVERLAP_EPS) - X(center - OVERLAP_EPS)} height={34} rx={10} className={cls} strokeWidth={2} />
      <text x={X(center)} y={y + 22} textAnchor="middle" className={cn(NEUTRAL.text, LABEL_HALO, "text-[14px] font-semibold")}>{label}</text>
    </g>
  );

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag <b>B&apos;s band</b> left and right.</>}>
      <div
        className={cn("cursor-ew-resize touch-none rounded-xl", FOCUS_RING)}
        tabIndex={0}
        role="slider"
        aria-label="Position of B's write"
        aria-valuemin={B_BOUNDS.min}
        aria-valuemax={B_BOUNDS.max}
        aria-valuenow={b}
        aria-valuetext={`B at ${b} milliseconds: ${verdict}`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          setDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          follow(e);
        }}
        onPointerMove={(e) => dragging && follow(e)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <svg ref={svg} viewBox="0 0 420 200" role="img" aria-label={`A's band around ${A_CENTER} ms and B's band around ${b} ms. ${verdict}.`} className="block h-auto w-full select-none">
          <DotGrid width={420} height={200} />
          <VerdictBanner width={420} text={verdict} tone={sure ? "good" : "warn"} />
          {v.overlap ? <rect x={X(v.overlap[0])} y={54} width={X(v.overlap[1]) - X(v.overlap[0])} height={84} rx={8} className={TONES.warn.softFill} /> : null}
          {band(A_CENTER, 58, cn(TONES.accent.softFill, TONES.accent.stroke), "A's write")}
          {band(b, 100, cn(tone.softFill, tone.stroke), "B's write")}
          <line x1={X0} x2={X1} y1={150} y2={150} className={NEUTRAL.line} strokeWidth={2} />
          {[0, 10, 20, 30, 40].map((m) => (
            <text key={m} x={X(m)} y={172} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{m} ms</text>
          ))}
        </svg>
      </div>
    </BeatFrame>
  );
}
