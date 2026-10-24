"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { clampLag, LAG_BOUNDS, LOG_LENGTH, replicaBehindFrame } from "./model";

const CELL = 26;
const GAP = 3;
const LEFT = 112;
const cellX = (i: number) => LEFT + i * (CELL + GAP);

/** Beat 2 of 8.4: the log fills on the leader and later on each replica; drag to change the lag. */
export function ReplicaBehindCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(ref);
  const [lag, setLag] = useState<number>(LAG_BOUNDS.default);
  const drag = useRef<{ x: number; lag: number; scale: number } | null>(null);
  const f = replicaBehindFrame(clock.seconds, lag);

  const rows = [
    { id: "leader", label: "Leader", sub: `${f.leader} writes`, pos: f.leader, y: 70 },
    { id: "r1", label: "Replica 1", sub: `${f.r1LagMs} ms behind`, pos: f.r1, y: 136 },
    { id: "r2", label: "Replica 2", sub: `${f.lagMs} ms behind`, pos: f.r2, y: 202 },
  ];

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setLag((v) => clampLag(v + LAG_BOUNDS.step));
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setLag((v) => clampLag(v - LAG_BOUNDS.step));
    else return;
    e.preventDefault();
  };

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag <b>sideways</b> on the picture: right makes replica 2 fall further behind.</>}>
      <div
        ref={ref}
        className={cn("cursor-ew-resize touch-none rounded-xl", FOCUS_RING)}
        tabIndex={0}
        role="slider"
        aria-label="Replica 2 lag"
        aria-valuemin={LAG_BOUNDS.min}
        aria-valuemax={LAG_BOUNDS.max}
        aria-valuenow={lag}
        aria-valuetext={`replica 2 is ${lag} milliseconds behind`}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          clock.freeze();
          // Scale pointer pixels to milliseconds by the rendered width.
          const width = e.currentTarget.getBoundingClientRect().width || 420;
          drag.current = { x: e.clientX, lag, scale: 1500 / width };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current) setLag(clampLag(drag.current.lag + (e.clientX - drag.current.x) * drag.current.scale));
        }}
        onPointerUp={() => {
          drag.current = null;
          clock.unfreeze();
        }}
        onPointerCancel={() => {
          drag.current = null;
          clock.unfreeze();
        }}
      >
        <svg viewBox="0 0 420 240" role="img" aria-label={`The leader has ${f.leader} writes, replica 1 has ${f.r1}, replica 2 has ${f.r2}. Replica 2 is ${f.lagMs} ms behind.`} className="block h-auto w-full select-none">
          <DotGrid width={420} height={240} />
          <VerdictBanner width={420} tone={f.lagMs === 0 ? "good" : "warn"} text={f.lagMs === 0 ? "Replicas keep up with the leader" : `Replica 2 is ${f.behindWrites} ${f.behindWrites === 1 ? "write" : "writes"} behind`} />
          {rows.map((row) => (
            <g key={row.id}>
              <text x={12} y={row.y - 2} className={cn(NEUTRAL.text, "text-[14px] font-semibold")}>{row.label}</text>
              <text x={12} y={row.y + 16} className={cn(NEUTRAL.mutedText, "text-[12px] tabular-nums")}>{row.sub}</text>
              {Array.from({ length: LOG_LENGTH }, (_, i) => {
                const applied = i < row.pos;
                const missing = !applied && i < f.leader;
                const newest = applied && i === row.pos - 1;
                return (
                  <rect
                    key={i}
                    x={cellX(i)}
                    y={row.y - CELL / 2}
                    width={CELL}
                    height={CELL}
                    rx={6}
                    strokeWidth={2}
                    strokeDasharray={missing ? "4 3" : undefined}
                    className={cn(
                      applied ? (newest ? TONES.accent.solidFill : TONES.accent.softFill) : NEUTRAL.surface,
                      applied ? TONES.accent.stroke : missing ? TONES.warn.stroke : NEUTRAL.line
                    )}
                  />
                );
              })}
            </g>
          ))}
          <text x={LEFT} y={232} className={cn(NEUTRAL.mutedText, "text-[12px]")}>dashed box: the leader has it, the replica not yet</text>
        </svg>
      </div>
    </BeatFrame>
  );
}
