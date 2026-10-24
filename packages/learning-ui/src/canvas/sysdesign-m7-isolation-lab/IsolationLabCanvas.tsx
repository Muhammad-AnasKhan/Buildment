"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { RailSlider } from "../primitives/rail-slider";
import { SliderRail } from "../primitives/picture-slider";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES, type Tone as ToneName } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  LEVELS,
  READ_UNCOMMITTED_NOTE,
  STORIES,
  banner,
  dbAt,
  describe,
  latestRow,
  levelsFor,
  message,
  rowLook,
  script,
  stepCount,
  validLevel,
  type LevelId,
  type Row,
  type StoryId,
} from "../models/isolation";
import { wrapWords } from "../models/sorter";

// 7.4: pick a story and an isolation level, then step two transactions
// forward one statement at a time. Three lanes: T1, the database and T2.
// Time runs down. An uncommitted write is dashed and turns solid at commit,
// a waiting statement is hatched, a refused one is red with its error code.

const W = 420;
const H = 348;
const LANE = {
  t1: { x: 8, w: 150, cx: 83 },
  db: { x: 166, w: 88, cx: 210 },
  t2: { x: 262, w: 150, cx: 337 },
} as const;
const TOP = 46;
const BOTTOM = 245;
const ROW0 = 82;
const PITCH = 21;
const BAR_H = 18;
const BAR_W = 144;
const RAIL = { x0: 104, x1: 316, y: 308 };
const STRIP = { y: 251, h: 36 };
const MSG_CHARS = 60;

const rowY = (step: number) => ROW0 + (step - 1) * PITCH;

type BarProps = { row: Row; step: number; current: boolean; pulse: number; hatch: string };

function Bar({ row, step, current, pulse, hatch }: BarProps) {
  const look = rowLook(row, step);
  const lane = LANE[row.lane];
  const cy = rowY(row.step);
  const small = row.style === "begin" || row.style === "commit" || row.style === "rollback";
  const text = look === "ghost" ? row.ghost : row.text;
  const w = small ? 84 : BAR_W;
  const x = lane.cx - w / 2;
  const y = cy - BAR_H / 2;

  const tone: ToneName | null =
    look === "ghost"
      ? null
      : row.style === "error"
        ? "bad"
        : row.style === "done"
          ? "good"
          : row.style === "commit"
            ? "good"
            : row.style === "rollback"
              ? "warn"
              : row.style === "wait"
                ? "warn"
                : row.style === "write" && look !== "undone"
                  ? "accent"
                  : null;
  const dashed = look === "ghost" || look === "pending" || look === "undone";
  const filled = tone && look !== "undone" && row.style !== "begin" && row.style !== "commit" && row.style !== "rollback" && row.style !== "wait";
  const textClass =
    look === "ghost" || look === "undone" ? NEUTRAL.mutedText : tone && row.style !== "commit" && row.style !== "rollback" ? TONES[tone].text : NEUTRAL.text;

  return (
    <g>
      {current ? <rect x={x - 3} y={y - 3} width={w + 6} height={BAR_H + 6} rx={9} strokeWidth={2.25} opacity={pulse} className={cn("fill-none", TONES.accent.stroke)} /> : null}
      {look === "ghost" ? (
        <rect x={x} y={y} width={w} height={BAR_H} rx={6} strokeWidth={1.25} strokeDasharray="4 3" className={cn("fill-none", NEUTRAL.faintStroke)} />
      ) : row.style === "wait" ? (
        <>
          <rect x={x} y={y} width={w} height={BAR_H} rx={6} className="fill-card" />
          <rect x={x} y={y} width={w} height={BAR_H} rx={6} fill={`url(#${hatch})`} />
          <rect x={x} y={y} width={w} height={BAR_H} rx={6} strokeWidth={1.5} className={cn("fill-none", TONES.warn.stroke)} />
        </>
      ) : (
        <rect
          x={x}
          y={y}
          width={w}
          height={BAR_H}
          rx={small ? BAR_H / 2 : 6}
          strokeWidth={1.5}
          strokeDasharray={dashed ? "4 3" : undefined}
          className={cn(filled ? TONES[tone as ToneName].softFill : NEUTRAL.surface, look === "undone" ? NEUTRAL.faintStroke : tone ? TONES[tone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")}
        />
      )}
      <text x={lane.cx} y={cy + 4.2} textAnchor="middle" className={cn(textClass, row.style === "wait" && look !== "ghost" && LABEL_HALO, "text-[11.5px] font-semibold", look === "ghost" && "font-medium")} textDecoration={look === "undone" ? "line-through" : undefined}>
        {text}
      </text>
    </g>
  );
}

export function IsolationLabCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const hatch = useId().replace(/:/g, "");
  const [story, setStory] = useState<StoryId>("lost-app");
  const [level, setLevel] = useState<LevelId>("read-committed");
  const [step, setStep] = useState(0);

  const lvl = validLevel(story, level);
  const sc = script(story, lvl);
  const n = stepCount(sc);
  const at = Math.min(step, n);
  const bn = banner(sc, at);
  const db = dbAt(sc, at);
  const msg = message(sc, at) || "T1 and T2 share one row. Time runs down the picture.";
  const msgLines = wrapWords(msg, MSG_CHARS).slice(0, 2);
  const latest = latestRow(sc, at);
  const ladder = Array.from({ length: n + 1 }, (_, i) => i);
  const pulse = clock.reduced ? 1 : 0.65 + 0.35 * Math.sin(clock.seconds * 4);
  const shift = clock.reduced ? 0 : Math.round(clock.seconds * 10) % 8;

  const changeStory = (s: StoryId) => {
    const atEnd = at >= n;
    const next = script(s, validLevel(s, level));
    setStory(s);
    setLevel(validLevel(s, level));
    setStep(atEnd ? stepCount(next) : 0);
  };

  const valueText = `Step ${at} of ${n}. ${latest ? latest.note : "Nothing has run yet"}.`;
  const description = `${STORIES.find((s) => s.id === story)?.label} at ${LEVELS.find((l) => l.id === lvl)?.label}. ${describe(sc, at)} ${at >= n ? `${bn.text}. ${msg}` : ""}`;

  const chips = [{ step: 1, text: sc.start, pending: false, key: "start" }, ...db.chips.map((c, i) => ({ ...c, key: `c${i}` }))];
  const currentChip = chips.reduce((acc, c, i) => (c.pending ? acc : i), 0);

  const navButton = (x: number, label: string, enabled: boolean, onPress: () => void) => (
    <SvgButton x={x} y={RAIL.y - 22} width={64} height={44} rx={22} label={label} onPress={() => enabled && onPress()}>
      <rect x={x} y={RAIL.y - 15} width={64} height={30} rx={15} strokeWidth={1.5} className={cn(enabled ? NEUTRAL.surface : "fill-muted", enabled ? NEUTRAL.line : "stroke-transparent")} />
      <text x={x + 32} y={RAIL.y + 4.5} textAnchor="middle" className={cn(enabled ? NEUTRAL.text : NEUTRAL.mutedText, "text-[12.5px] font-semibold")}>{label}</text>
    </SvgButton>
  );

  return (
    <BeatFrame
      label={title}
      limits={`${limits}${lvl === "read-uncommitted" ? ` ${READ_UNCOMMITTED_NOTE}` : ""}`}
      hint={lvl === "read-uncommitted" ? READ_UNCOMMITTED_NOTE : <>Step forward, then change the <b>level</b> and compare the ending.</>}
      controls={
        <>
          <BeatSegmented label="Story" options={STORIES} value={story} onChange={changeStory} />
          <BeatSegmented label="Level" options={LEVELS.filter((l) => levelsFor(story).includes(l.id))} value={lvl} onChange={setLevel} />
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
          <defs>
            <pattern id={hatch} width={8} height={8} patternUnits="userSpaceOnUse" patternTransform={`translate(${shift} 0) rotate(45)`}>
              <line x1={0} y1={0} x2={0} y2={8} strokeWidth={3} className={cn(TONES.warn.stroke, "opacity-60")} />
            </pattern>
          </defs>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={bn.text} tone={bn.tone} />

          {/* Lanes. */}
          {(["t1", "db", "t2"] as const).map((k) => (
            <g key={k}>
              <rect x={LANE[k].x} y={TOP} width={LANE[k].w} height={BOTTOM - TOP} rx={12} className="fill-muted/50" />
              <text x={LANE[k].cx} y={TOP + 15} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{k === "t1" ? "T1" : k === "t2" ? "T2" : "Database"}</text>
            </g>
          ))}

          {/* The database lane: the value over time. */}
          <line x1={LANE.db.cx} x2={LANE.db.cx} y1={TOP + 22} y2={BOTTOM - 6} strokeWidth={1.5} strokeDasharray="3 4" className={NEUTRAL.faintStroke} />
          {chips.map((c, i) => {
            const w = Math.min(84, Math.round(c.text.length * 6.4 + 16));
            const x = LANE.db.cx - w / 2;
            const y = rowY(c.step) - 10;
            const current = i === currentChip;
            const tone: ToneName | null = current ? (at >= n ? (sc.verdict.tone === "bad" ? "bad" : "good") : "accent") : null;
            return (
              <g key={c.key} className="animate-in fade-in duration-300 motion-reduce:animate-none">
                <rect x={x} y={y} width={w} height={20} rx={10} strokeWidth={tone ? 2 : 1.5} strokeDasharray={c.pending ? "4 3" : undefined} className={cn(tone ? TONES[tone].softFill : NEUTRAL.surface, tone ? TONES[tone].stroke : c.pending ? NEUTRAL.faintStroke : NEUTRAL.line)} />
                <text x={LANE.db.cx} y={y + 14.2} textAnchor="middle" className={cn(c.pending ? NEUTRAL.mutedText : tone ? TONES[tone].text : NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{c.text}</text>
              </g>
            );
          })}

          {/* The statements. */}
          {sc.rows.map((r) => (
            <Bar key={`${story}-${r.step}`} row={r} step={at} current={r.step === at} pulse={pulse} hatch={hatch} />
          ))}

          {/* The message: what happened, and the error code if there is one. */}
          <rect x={8} y={STRIP.y} width={404} height={STRIP.h} rx={12} className={cn(NEUTRAL.surface, bn.tone === "bad" && at >= n ? TONES.bad.stroke : NEUTRAL.line)} strokeWidth={1.5} />
          {msgLines.map((line, i) => (
            <text key={i} x={W / 2} y={STRIP.y + (msgLines.length === 1 ? 22 : 15) + i * 14.5} textAnchor="middle" className={cn(msg.startsWith("ERROR") ? TONES.bad.text : NEUTRAL.text, "text-[11.5px] font-medium")}>{line}</text>
          ))}

          {/* Back, the timeline and Next. */}
          {navButton(12, "Back", at > 0, () => setStep(at - 1))}
          <RailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Step along the timeline"
            valueText={valueText}
            value={at}
            ladder={ladder}
            fromFraction={(f) => Math.round(Math.max(0, Math.min(1, f)) * n)}
            onChange={setStep}
          >
            <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={n === 0 ? 0 : at / n} marks={ladder.map((i) => ({ at: i / n }))} ends={["start", "end"]} caption={`Step ${at} of ${n}`} />
          </RailSlider>
          {navButton(344, "Next", at < n, () => setStep(at + 1))}
        </svg>
      </div>
    </BeatFrame>
  );
}
