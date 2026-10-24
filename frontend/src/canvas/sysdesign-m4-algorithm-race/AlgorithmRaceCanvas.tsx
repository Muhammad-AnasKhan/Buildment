"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { RailStrip } from "../primitives/rail-strip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  formatMs,
  LOAD,
  LOAD_LADDER,
  LOAD_SNAPS,
  loadFromFraction,
  loadToFraction,
  PICKERS,
  race,
  raceVerdict,
  SERVERS,
  SNAPSHOT_HZ,
  type QueueView,
} from "../models/balancer-race";

const W = 420;
const H = 304;
const PANEL = { w: 198, h: 124, xs: [8, 214], ys: [46, 176] } as const;
const LANE_X = 40;
const LANE_END = 190;
const DOT_PITCH = 9;
const SLOW_W = 18;
const SLOW_PITCH = 22;

/** Place a line's requests left to right; stop when the lane is full. */
function layout(q: QueueView): { items: { x: number; slow: boolean }[]; more: boolean; end: number } {
  const items: { x: number; slow: boolean }[] = [];
  let x = LANE_X;
  let more = q.length > q.slow.length;
  for (let k = 0; k < q.slow.length; k++) {
    const slow = q.slow[k];
    const width = slow ? SLOW_W : 6.8;
    if (x + width > LANE_END - 14) {
      more = true;
      break;
    }
    items.push({ x, slow });
    x += slow ? SLOW_PITCH : DOT_PITCH;
  }
  return { items, more, end: x };
}

const queueTone = (n: number): Tone => (n >= 4 ? "bad" : n >= 2 ? "warn" : "good");

/** 4.5: drag the load and watch four balancers handle the same requests: their lines, and their p99. */
export function AlgorithmRaceCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [load, setLoad] = useState<number>(LOAD.default);
  const r = race(load);
  const verdict = raceVerdict(r);
  const alike = verdict.tone === "good";

  const snapshotCount = r.runs.random.snapshots.length;
  // Reduced motion shows the moment the lines were longest, which is the story the picture tells.
  let frame = 0;
  if (clock.reduced) {
    let best = -1;
    for (let i = 0; i < snapshotCount; i++) {
      const total = PICKERS.reduce((sum, p) => sum + r.runs[p.id].snapshots[i].reduce((a, q) => a + q.length, 0), 0);
      if (total > best) {
        best = total;
        frame = i;
      }
    }
  } else if (snapshotCount > 0) {
    frame = Math.floor(clock.seconds * SNAPSHOT_HZ) % snapshotCount;
  }

  const p99s = PICKERS.map((p) => r.runs[p.id].p99);
  const lowest = Math.min(...p99s);
  const highest = Math.max(...p99s);
  const rankTone = (v: number): Tone => (alike || v <= lowest * 1.25 ? "good" : v >= lowest * 2 ? "bad" : "warn");

  const summary = `Four balancers share the same requests at ${load}% busy. p99 is ${PICKERS.map((p) => `${p.label.toLowerCase()} ${formatMs(r.runs[p.id].p99)}`).join(", ")}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag across the rail to change the <b>load</b>.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          {PICKERS.map((p, k) => {
            const px = PANEL.xs[k % 2];
            const py = PANEL.ys[Math.floor(k / 2)];
            const run = r.runs[p.id];
            const snap = run.snapshots[frame] ?? [];
            const tone = rankTone(run.p99);
            const t = TONES[tone];
            const barW = Math.max(6, (run.p99 / highest) * 80);
            return (
              <g key={p.id} transform={`translate(${px} ${py})`}>
                <rect x={0} y={3} width={PANEL.w} height={PANEL.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={0} y={0} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={!alike && p.id === r.best ? 2 : 1.5} className={cn(NEUTRAL.surface, !alike && p.id === r.best ? TONES.good.stroke : NEUTRAL.line)} />
                <text x={12} y={19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{p.label}</text>
                {Array.from({ length: SERVERS }, (_, i) => {
                  const q = snap[i] ?? { length: 0, slow: [] };
                  const cy = 38 + i * 17;
                  const lay = layout(q);
                  const qt = TONES[queueTone(q.length)];
                  return (
                    <g key={i}>
                      <rect x={10} y={cy - 6} width={22} height={12} rx={4} strokeWidth={1.5} className={cn(qt.softFill, qt.stroke, "transition-colors duration-150 motion-reduce:transition-none")} />
                      {lay.items.map((it, n) =>
                        it.slow ? (
                          <rect key={n} x={it.x} y={cy - 4} width={SLOW_W} height={8} rx={4} className={TONES.warn.solidFill} />
                        ) : (
                          <circle key={n} cx={it.x + 3.4} cy={cy} r={3.4} className={TONES.accent.solidFill} />
                        )
                      )}
                      {lay.more
                        ? [0, 1, 2].map((m) => <circle key={`more-${m}`} cx={lay.end + 2 + m * 5} cy={cy} r={1.8} opacity={0.85 - m * 0.25} className={TONES.bad.solidFill} />)
                        : null}
                    </g>
                  );
                })}
                <rect x={10} y={PANEL.h - 26} width={88} height={18} rx={9} className={cn(t.softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={54} y={PANEL.h - 13} textAnchor="middle" className={cn(t.text, "text-[11.5px] font-bold tabular-nums")}>{`p99 ${formatMs(run.p99)}`}</text>
                <rect x={106} y={PANEL.h - 21} width={80} height={8} rx={4} className="fill-muted" />
                <rect x={106} y={PANEL.h - 21} width={barW} height={8} rx={4} className={cn(t.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
              </g>
            );
          })}
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <RailStrip
          label="Load on the four servers"
          valueText={`${load}% busy. ${PICKERS.map((p) => `${p.label} p99 ${formatMs(r.runs[p.id].p99)}`).join("; ")}. ${verdict.text}`}
          value={load}
          ladder={LOAD_LADDER}
          fraction={loadToFraction(load)}
          fromFraction={loadFromFraction}
          onChange={setLoad}
          marks={LOAD_SNAPS.map((n) => ({ at: loadToFraction(n), label: `${n}%` }))}
          ends={["10%", "99%"]}
          caption="how busy the servers are"
        />
      </div>
    </BeatFrame>
  );
}
