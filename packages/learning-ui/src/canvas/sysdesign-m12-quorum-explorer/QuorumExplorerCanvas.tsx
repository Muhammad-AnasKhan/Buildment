"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { chipWidth } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULTS,
  N_LADDER,
  RESPONSE_MS,
  clampQuorum,
  majority,
  pingAt,
  quorumState,
  survivePill,
  timePill,
  toggleDown,
} from "../models/quorum-explorer";

const W = 420;
const H = 402;
const ROW_Y = 98;
const TAG_Y = 53;
const LEGEND_Y = 168;
const PILL_Y = [200, 234];
const RAIL_Y = [284, 330, 376];
const RAIL_X0 = 138;
const RAIL_X1 = 386;
const PING_PERIOD = 3.2;
const PING_LENGTH = 0.6;

const r1 = (v: number) => Math.round(v * 10) / 10;

type Kind = "n" | "w" | "r";

const KNOB: Record<Kind, { fill: string; text: string; trail: string; label: string }> = {
  n: { fill: "fill-foreground", text: "fill-background", trail: "stroke-foreground", label: NEUTRAL.text },
  w: { fill: TONES.accent.solidFill, text: "fill-white dark:fill-blue-950", trail: TONES.accent.stroke, label: TONES.accent.text },
  r: { fill: TONES.warn.solidFill, text: "fill-white dark:fill-amber-950", trail: TONES.warn.stroke, label: TONES.warn.text },
};

type RailProps = {
  svgRef: React.RefObject<SVGSVGElement | null>;
  kind: Kind;
  y: number;
  label: string;
  ariaLabel: string;
  valueText: string;
  values: readonly number[];
  value: number;
  onChange: (v: number) => void;
};

/** One snap rail: a dot for every allowed value and a knob with the number on it. */
function QuorumRail({ svgRef, kind, y, label, ariaLabel, valueText, values, value, onChange }: RailProps) {
  const last = values.length - 1;
  const xs = values.map((_, i) => r1(RAIL_X0 + (i * (RAIL_X1 - RAIL_X0)) / last));
  const at = Math.max(0, values.indexOf(value));
  const k = KNOB[kind];
  const onKey = (v: number, key: string) => {
    const i = Math.max(0, values.indexOf(v));
    switch (key) {
      case "ArrowRight":
      case "ArrowUp":
        return values[Math.min(last, i + 1)];
      case "ArrowLeft":
      case "ArrowDown":
        return values[Math.max(0, i - 1)];
      case "Home":
        return values[0];
      case "End":
        return values[last];
      default:
        return null;
    }
  };
  return (
    <g>
      <text x={14} y={y + 4.5} className={cn(k.label, "text-[12.5px] font-semibold")}>{label}</text>
      <TightRailSlider
        svgRef={svgRef}
        x0={RAIL_X0}
        x1={RAIL_X1}
        y={y}
        label={ariaLabel}
        valueText={valueText}
        value={value}
        min={values[0]}
        max={values[last]}
        fromFraction={(f) => values[Math.max(0, Math.min(last, Math.round(f * last)))]}
        onKey={onKey}
        onChange={onChange}
      >
        <g aria-hidden>
          <line x1={RAIL_X0} x2={RAIL_X1} y1={y} y2={y} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
          <line x1={RAIL_X0} x2={xs[at]} y1={y} y2={y} strokeWidth={5} strokeLinecap="round" className={cn(k.trail, "transition-all duration-200 motion-reduce:transition-none")} />
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={y} r={3} className={i <= at ? "fill-card" : NEUTRAL.faintFill} />
          ))}
          <g style={{ transform: `translate(${xs[at]}px, ${y}px)` }} className="transition-transform duration-200 motion-reduce:transition-none">
            <circle r={19} className={cn(kind === "n" ? "fill-foreground/10" : kind === "w" ? TONES.accent.softFill : TONES.warn.softFill)} />
            <circle r={13} className={cn(k.fill, "stroke-card")} strokeWidth={2.5} />
            <text y={4.8} textAnchor="middle" className={cn(k.text, "text-[14px] font-bold tabular-nums")}>{value}</text>
          </g>
        </g>
      </TightRailSlider>
    </g>
  );
}

function Pill({ x, y, text, tone }: { x: number; y: number; text: string; tone: Tone }) {
  const w = chipWidth(text);
  return (
    <g>
      <rect x={x} y={y - 14} width={w} height={28} rx={14} className={cn(TONES[tone].softFill, TONES[tone].stroke)} strokeWidth={1.75} />
      <text x={x + w / 2} y={y + 4.5} textAnchor="middle" className={cn(TONES[tone].text, "text-[12.5px] font-semibold tabular-nums")}>{text}</text>
    </g>
  );
}

/** 12.3 beat 2: move N, W and R and tap copies to fail them; the picture shows where a read and a write must meet. */
export function QuorumExplorerCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [q, setQ] = useState<{ n: number; w: number; r: number; down: number[] }>({ ...DEFAULTS, down: [] });
  const titleId = useId();
  const descId = useId();
  const s = quorumState(q.n, q.w, q.r, q.down);

  const setN = (n: number) => {
    const c = clampQuorum(n, q.w, q.r);
    setQ({ ...c, down: q.down.filter((i) => i < c.n) });
  };
  const setW = (w: number) => setQ({ ...q, w });
  const setR = (r: number) => setQ({ ...q, r });
  const flip = (i: number) => setQ({ ...q, down: toggleDown(q.down, i) });

  const pitch = Math.min(56, 400 / s.n);
  const xOf = (i: number) => r1(210 + (i - (s.n - 1) / 2) * pitch);
  const gapX = s.gap ? r1((xOf(s.gap[0]) + xOf(s.gap[1])) / 2) : 210;
  const showTag = !s.guaranteed && !s.writeBlocked && !s.readBlocked;
  const tagW = chipWidth("a read can miss a write");
  const tagX = Math.max(8, Math.min(W - 8 - tagW, gapX - tagW / 2));

  const wTone: Tone = s.writesSurvive === 0 ? "warn" : "good";
  const rTone: Tone = s.readsSurvive === 0 ? "warn" : "good";
  const survA = survivePill("writes", s.writesSurvive);
  const survB = survivePill("reads", s.readsSurvive);
  const wA = chipWidth(survA);
  const wB = chipWidth(survB);
  const rowX = (W - (wA + wB + 10)) / 2;
  const timeText = timePill(s);
  const timeW = chipWidth(timeText);
  const timeTone: Tone = s.writeBlocked || s.readBlocked ? "bad" : "accent";

  const t = clock.reduced ? -1 : clock.seconds % PING_PERIOD;
  const ping = (ms: number, extra: number) => {
    if (t < 0) return null;
    const local = t - pingAt(ms) - extra;
    return local >= 0 && local < PING_LENGTH ? local / PING_LENGTH : null;
  };

  const legend: { key: string; text: string; mark: React.ReactNode; w: number }[] = [
    { key: "w", text: "write group", w: 78, mark: <circle r={6} className={cn("fill-none", TONES.accent.stroke)} strokeWidth={2.5} /> },
    { key: "r", text: "read group", w: 74, mark: <circle r={6} className={cn("fill-none", TONES.warn.stroke)} strokeWidth={2.5} /> },
    { key: "b", text: "both", w: 34, mark: <circle r={6} className={TONES.good.solidFill} /> },
    { key: "d", text: "failed", w: 40, mark: <circle r={6} className="fill-muted stroke-muted-foreground/60" strokeWidth={1.5} /> },
  ];
  const legendTotal = legend.reduce((a, l) => a + 18 + l.w, 0) + 16 * (legend.length - 1);
  let lx = (W - legendTotal) / 2;

  const description = `${s.n} copies, write to ${s.w}, read from ${s.r}. ${s.verdict.text}. ${s.down.length ? `Failed: ${s.down.map((i) => `replica ${i + 1}`).join(", ")}.` : "All copies up."}`;

  return (
    <BeatFrame label={title} limits={limits} hint={<>Drag the three rails. Tap a copy to fail it or bring it back.</>}>
      <div ref={box}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <g role="status" aria-live="polite">
            <VerdictBanner width={W} text={s.verdict.text} tone={s.verdict.tone} />
          </g>

          {/* The gap between the two groups, and what it means. */}
          <g aria-hidden className="transition-opacity duration-200 motion-reduce:transition-none" opacity={showTag ? 1 : 0}>
            <g style={{ transform: `translate(${gapX}px, 0px)` }} className="transition-transform duration-300 motion-reduce:transition-none">
              {s.gap ? <line x1={0} x2={0} y1={66} y2={146} strokeWidth={2} strokeDasharray="4 4" className={TONES.warn.stroke} /> : null}
            </g>
            <rect x={tagX} y={TAG_Y - 14} width={tagW} height={28} rx={14} className={cn(TONES.warn.softFill, TONES.warn.stroke)} strokeWidth={1.75} />
            <text x={tagX + tagW / 2} y={TAG_Y + 4.5} textAnchor="middle" className={cn(TONES.warn.text, "text-[12.5px] font-semibold")}>a read can miss a write</text>
          </g>

          {/* The copies, fastest on the left. */}
          {Array.from({ length: s.n }, (_, i) => {
            const down = s.down.includes(i);
            const inW = s.writeGroup.includes(i);
            const inR = s.readGroup.includes(i);
            const both = s.shared.includes(i);
            const ms = RESPONSE_MS[i];
            const wPing = inW ? ping(ms, 0) : null;
            const rPing = inR ? ping(ms, 0.12) : null;
            return (
              <g key={i} transform={`translate(${xOf(i)} ${ROW_Y})`}>
                <SvgButton
                  x={-22}
                  y={-26}
                  width={44}
                  height={74}
                  rx={12}
                  label={`replica ${i + 1}, ${ms} ms, ${down ? "failed" : "up"}; press to ${down ? "bring back" : "fail"}`}
                  onPress={() => flip(i)}
                >
                  <circle cy={3} r={14.5} className="fill-foreground/[0.06]" />
                  <circle
                    r={14.5}
                    strokeWidth={1.75}
                    className={cn(
                      "transition-colors duration-200 motion-reduce:transition-none",
                      both ? "fill-emerald-600 stroke-emerald-700 dark:fill-emerald-500 dark:stroke-emerald-300" : down ? "fill-muted stroke-muted-foreground/50" : cn(NEUTRAL.surface, NEUTRAL.line)
                    )}
                  />
                  <circle r={18} strokeWidth={2.5} className={cn("fill-none transition-opacity duration-200 motion-reduce:transition-none", TONES.accent.stroke)} opacity={inW ? 1 : 0} />
                  <circle r={21.2} strokeWidth={2.5} className={cn("fill-none transition-opacity duration-200 motion-reduce:transition-none", TONES.warn.stroke)} opacity={inR ? 1 : 0} />
                  {wPing !== null ? <circle r={r1(18 + wPing * 9)} strokeWidth={2} opacity={r1(0.7 * (1 - wPing))} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                  {rPing !== null ? <circle r={r1(21 + rPing * 8)} strokeWidth={2} opacity={r1(0.7 * (1 - rPing))} className={cn("fill-none", TONES.warn.stroke)} /> : null}
                  {both ? (
                    <polyline points="-6,0.5 -1.5,5 6.5,-4.5" fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="stroke-white dark:stroke-emerald-950" />
                  ) : down ? (
                    <g aria-hidden strokeWidth={2.5} strokeLinecap="round" className="stroke-muted-foreground">
                      <line x1={-5} y1={-5} x2={5} y2={5} />
                      <line x1={5} y1={-5} x2={-5} y2={5} />
                    </g>
                  ) : (
                    <text y={4.8} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{i + 1}</text>
                  )}
                  <text y={42} textAnchor="middle" className={cn(down ? NEUTRAL.faintFill : NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{ms} ms</text>
                </SvgButton>
              </g>
            );
          })}

          {/* Legend. */}
          <g aria-hidden>
            {legend.map((l) => {
              const x = lx;
              lx += 18 + l.w + 16;
              return (
                <g key={l.key}>
                  <g transform={`translate(${r1(x + 6)} ${LEGEND_Y})`}>{l.mark}</g>
                  <text x={x + 18} y={LEGEND_Y + 4.5} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{l.text}</text>
                </g>
              );
            })}
          </g>

          <Pill x={rowX} y={PILL_Y[0]} text={survA} tone={wTone} />
          <Pill x={rowX + wA + 10} y={PILL_Y[0]} text={survB} tone={rTone} />
          <Pill x={(W - timeW) / 2} y={PILL_Y[1]} text={timeText} tone={timeTone} />

          <QuorumRail
            svgRef={svgRef}
            kind="n"
            y={RAIL_Y[0]}
            label="Nodes (N)"
            ariaLabel="Number of nodes, N"
            valueText={`${s.n} nodes, a majority is ${majority(s.n)}`}
            values={N_LADDER}
            value={s.n}
            onChange={setN}
          />
          <QuorumRail
            svgRef={svgRef}
            kind="w"
            y={RAIL_Y[1]}
            label="Write to (W)"
            ariaLabel="Write waits for W nodes"
            valueText={`write waits for ${s.w} of ${s.n}, survives ${s.writesSurvive} failures`}
            values={Array.from({ length: s.n }, (_, i) => i + 1)}
            value={s.w}
            onChange={setW}
          />
          <QuorumRail
            svgRef={svgRef}
            kind="r"
            y={RAIL_Y[2]}
            label="Read from (R)"
            ariaLabel="Read asks R nodes"
            valueText={`read asks ${s.r} of ${s.n}, survives ${s.readsSurvive} failures`}
            values={Array.from({ length: s.n }, (_, i) => i + 1)}
            value={s.r}
            onChange={setR}
          />
        </svg>
      </div>
    </BeatFrame>
  );
}
