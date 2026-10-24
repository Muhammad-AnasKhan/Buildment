"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid } from "../primitives/svg-parts";
import { FOCUS_RING, LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { BAND_AXIS_MS, clampEpsilon, clockBandFrame, EPS_BOUNDS } from "./model";

const X0 = 24;
const X1 = 396;
const X = (ms: number) => X0 + (ms / BAND_AXIS_MS) * (X1 - X0);

/** Beat 2 of 10.6: drag sideways on the picture to make the clock more or less sure. */
export function ClockBandCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(ref);
  const [eps, setEps] = useState<number>(EPS_BOUNDS.default);
  const [dragging, setDragging] = useState(false);
  const f = clockBandFrame(clock.seconds, eps);

  const toX = (e: PointerEvent) => {
    const el = svg.current;
    if (!el) return null;
    const p = el.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const m = el.getScreenCTM();
    return m ? p.matrixTransform(m.inverse()).x : null;
  };
  const follow = (e: PointerEvent) => {
    const x = toX(e);
    if (x !== null) setEps(clampEpsilon((Math.abs(x - X(f.clockMs)) / (X1 - X0)) * BAND_AXIS_MS));
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") setEps((v) => clampEpsilon(v + EPS_BOUNDS.step));
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") setEps((v) => clampEpsilon(v - EPS_BOUNDS.step));
    else return;
    e.preventDefault();
  };

  const right = X(f.latest) + 22;
  const labelOnRight = right < X1 - 96;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Press and drag <b>sideways</b> on the picture to make the clock more or less sure.</>}>
      <div
        ref={ref}
        className={cn("cursor-ew-resize touch-none rounded-xl", FOCUS_RING)}
        tabIndex={0}
        role="slider"
        aria-label="Clock uncertainty, epsilon"
        aria-valuemin={EPS_BOUNDS.min}
        aria-valuemax={EPS_BOUNDS.max}
        aria-valuenow={eps}
        aria-valuetext={`epsilon ${eps} milliseconds`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          clock.freeze();
          setDragging(true);
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          follow(e);
        }}
        onPointerMove={(e) => dragging && follow(e)}
        onPointerUp={() => {
          setDragging(false);
          clock.unfreeze();
        }}
        onPointerCancel={() => {
          setDragging(false);
          clock.unfreeze();
        }}
      >
        <svg ref={svg} viewBox="0 0 420 206" role="img" aria-label={`The clock shows ${f.clockMs.toFixed(1)} ms; real time is ${f.realMs.toFixed(1)} ms, inside the band from ${f.earliest.toFixed(1)} to ${f.latest.toFixed(1)} ms.`} className="block h-auto w-full select-none">
          <DotGrid width={420} height={206} />
          <line x1={X0} x2={X1} y1={172} y2={172} className={NEUTRAL.line} strokeWidth={2} />
          {[0, 10, 20, 30].map((m) => (
            <g key={m}>
              <line x1={X(m)} x2={X(m)} y1={172} y2={178} className={NEUTRAL.faintStroke} />
              <text x={X(m)} y={196} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] tabular-nums")}>{m} ms</text>
            </g>
          ))}
          <rect x={X(f.earliest)} y={86} width={Math.max(4, X(f.latest) - X(f.earliest))} height={56} rx={14} className={cn(TONES.accent.softFill, TONES.accent.stroke)} strokeWidth={2} />
          <rect x={X(f.latest) - 12} y={78} width={24} height={72} rx={9} className={TONES.accent.solidFill} />
          <line x1={X(f.realMs)} x2={X(f.realMs)} y1={44} y2={172} className="stroke-foreground" strokeWidth={3} />
          <text x={X(f.realMs)} y={34} textAnchor="middle" className={cn(NEUTRAL.text, LABEL_HALO, "text-[14px] font-semibold")}>real time</text>
          <circle cx={X(f.clockMs)} cy={114} r={10} className={TONES.accent.solidFill} />
          <text x={X(f.clockMs)} y={162} textAnchor="middle" className={cn(NEUTRAL.mutedText, LABEL_HALO, "text-[13px]")}>clock shows</text>
          <text
            x={labelOnRight ? right : X(f.earliest) - 14}
            y={120}
            textAnchor={labelOnRight ? "start" : "end"}
            className={cn(TONES.accent.text, LABEL_HALO, "text-[18px] font-bold tabular-nums")}
          >
            ε = {eps} ms
          </text>
        </svg>
      </div>
    </BeatFrame>
  );
}
