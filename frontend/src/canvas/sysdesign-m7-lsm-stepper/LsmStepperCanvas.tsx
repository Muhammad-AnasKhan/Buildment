"use client";

import { useEffect, useMemo, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { INITIAL_STEPPER, stepperActionForKey, stepperReducer } from "../primitives/stepper";
import { FOCUS_RING, LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  MEMTABLE_LIMIT,
  PROBE_KEY,
  STEP_COUNT,
  describeStep,
  diskWrites,
  fileRange,
  formatAmp,
  lsmState,
  lsmVerdict,
  readProbe,
  type LsmFile,
} from "../models/lsm-stepper";

// 7.3: step an LSM tree through puts, flushes and merges. Two counters on the
// picture: files a read must open, and disk writes for each put. A toggle
// turns Bloom filters on, so a read skips files that cannot hold its key.

const W = 420;
const H = 346;
const PLAY_MS = 1700;

const MEM = { x: 12, y: 48, w: 236, h: 70 };
const SLOT = { w: 52, h: 30, gap: 4, x0: 22, y: 76 };
const COUNTER = { x: 260, w: 148, h: 33, y1: 48, y2: 85 };
const FILE = { w: 124, h: 88, gap: 12, x0: 12, y: 154 };
const GUIDE_Y = 148;
const BAR = { x0: 84, w: 324, h: 14, y1: 254, y2: 276 };
const LEGEND_Y = 308;
const CELL = { w: 12, gap: 3, cols: 7 };

/** The disk writes at the end of the script: the longest bar. */
const MAX_DISK = diskWrites(lsmState(STEP_COUNT));

const fileX = (slot: number) => FILE.x0 + slot * (FILE.w + FILE.gap);
const slotX = (i: number) => SLOT.x0 + i * (SLOT.w + SLOT.gap);

const APPEAR = "animate-in fade-in duration-300 motion-reduce:animate-none";
const FLUSH_IN = "animate-in fade-in slide-in-from-top-6 duration-500 motion-reduce:animate-none";
const MERGE_IN = "animate-in fade-in slide-in-from-right-16 duration-500 motion-reduce:animate-none";

const pill = cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-4 text-sm font-semibold sm:h-10", FOCUS_RING);

/** Where the read dot is: it walks the guide line, stopping above each file it opens. */
function dotAt(xs: number[], seconds: number, still: boolean): number {
  if (still || xs.length < 2) return xs[xs.length - 1];
  const n = xs.length - 1;
  const t = seconds % (n + 0.4);
  const i = Math.min(n, Math.floor(t) + 1);
  const into = t - (i - 1);
  const move = Math.min(1, into / 0.55);
  const ease = move < 0.5 ? 2 * move * move : 1 - (-2 * move + 2) ** 2 / 2;
  return xs[i - 1] + (xs[i] - xs[i - 1]) * ease;
}

function FileCard({ file, slot, mode, isNew, merged }: { file: LsmFile; slot: number; mode: "found" | "opened" | "skipped" | "idle"; isNew: boolean; merged: boolean }) {
  const lit = mode === "found" || mode === "opened";
  const tone = mode === "found" ? TONES.good : TONES.accent;
  const label = mode === "found" ? "found" : mode === "opened" ? "opened" : mode === "skipped" ? "skipped" : "";
  return (
    <g style={{ transform: `translate(${fileX(slot)}px, ${FILE.y}px)` }} className="transition-transform duration-500 motion-reduce:transition-none">
      <g className={isNew ? (merged ? MERGE_IN : FLUSH_IN) : undefined}>
        <rect x={0} y={3} width={FILE.w} height={FILE.h} rx={12} className="fill-foreground/[0.06]" />
        <rect x={0} y={0} width={FILE.w} height={FILE.h} rx={12} strokeWidth={lit ? 2.5 : 1.5} strokeDasharray={mode === "skipped" ? "5 4" : undefined} className={cn(NEUTRAL.surface, lit ? tone.stroke : mode === "skipped" ? NEUTRAL.faintStroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
        <text x={10} y={21} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>{`File ${file.id}`}</text>
        {label ? (
          <g className={APPEAR}>
            <rect x={FILE.w - 63} y={8} width={55} height={19} rx={9.5} className={lit ? tone.softFill : "fill-muted"} />
            <text x={FILE.w - 35.5} y={21.5} textAnchor="middle" className={cn(lit ? tone.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{label}</text>
          </g>
        ) : null}
        <text x={10} y={43} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{fileRange(file)}</text>
        {file.keys.map((k, i) => {
          const col = i % CELL.cols;
          const row = Math.floor(i / CELL.cols);
          const probe = k === PROBE_KEY;
          const sold = file.sold.includes(k);
          return (
            <rect
              key={k}
              x={10 + col * (CELL.w + CELL.gap)}
              y={53 + row * (CELL.w + CELL.gap)}
              width={CELL.w}
              height={CELL.w}
              rx={3}
              className={probe ? TONES.accent.solidFill : sold ? TONES.warn.solidFill : NEUTRAL.faintFill}
            />
          );
        })}
      </g>
    </g>
  );
}

export function LsmStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const reducer = useMemo(() => stepperReducer(STEP_COUNT + 1), []);
  const [st, dispatch] = useReducer(reducer, INITIAL_STEPPER);
  const [bloom, setBloom] = useState(false);
  const step = st.active;

  useEffect(() => {
    if (!st.playing) return;
    const t = window.setTimeout(() => dispatch({ type: "tick" }), PLAY_MS);
    return () => window.clearTimeout(t);
  }, [st.playing, st.active]);

  const s = lsmState(step);
  const prev = step > 0 ? lsmState(step - 1) : null;
  const probe = readProbe(s, PROBE_KEY, bloom);
  const verdict = lsmVerdict(s, bloom);
  const disk = diskWrites(s);
  const scale = BAR.w / MAX_DISK;
  const prevIds = new Set(prev?.files.map((f) => f.id) ?? []);
  const prevMem = new Set(prev?.memory.map((m) => m.key) ?? []);

  const modeOf = (f: LsmFile): "found" | "opened" | "skipped" | "idle" =>
    probe.foundIn === f.id ? "found" : probe.opened.includes(f.id) ? "opened" : probe.skipped.includes(f.id) ? "skipped" : "idle";

  const stops = probe.opened.map((id) => {
    const slot = s.files.findIndex((f) => f.id === id);
    return fileX(slot) + FILE.w / 2;
  });
  const dotXs = [14, ...stops];
  const showDot = !probe.inMemory && stops.length > 0;
  const dotX = showDot ? dotAt(dotXs, clock.seconds, clock.reduced) : 0;

  const filesTone = probe.checks >= 3 ? TONES.warn : probe.checks <= 1 ? TONES.good : TONES.accent;
  const ampTone = disk / Math.max(1, s.puts) >= 3 ? TONES.warn : TONES.accent;

  const description = `Step ${step} of ${STEP_COUNT}. Memory table holds ${s.memory.length} of ${MEMTABLE_LIMIT} keys. ${s.files.length} file${s.files.length === 1 ? "" : "s"} on disk. A read for ${PROBE_KEY} opens ${probe.checks} file${probe.checks === 1 ? "" : "s"}${bloom ? " with Bloom filters" : ""}. ${s.puts} puts caused ${disk} disk writes${s.puts ? `, ${formatAmp(s)} for each put` : ""}. ${verdict.text}.`;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const a = stepperActionForKey(e.key);
    if (!a) return;
    e.preventDefault();
    dispatch(a);
  };

  const legend = [
    { id: "log", text: "log", cls: NEUTRAL.doneFill, x: BAR.x0 },
    { id: "flush", text: "flush", cls: TONES.accent.solidFill, x: BAR.x0 + 70 },
    { id: "merge", text: "merge", cls: TONES.warn.solidFill, x: BAR.x0 + 150 },
  ];
  const logW = s.logWrites * scale;
  const flushW = s.flushWrites * scale;
  const mergeW = s.mergeWrites * scale;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Press <b>Next</b>. Switch <b>Bloom filters</b> on and off to see how many files a read opens.</>}
      controls={
        <>
          <button type="button" className={pill} onClick={() => dispatch({ type: "prev" })} disabled={step === 0}>
            <ChevronLeft aria-hidden className="size-4" />
            Back
          </button>
          <button type="button" className={cn(buttonVariants({ variant: "default" }), "h-11 rounded-full px-4 text-sm font-semibold sm:h-10", FOCUS_RING)} onClick={() => dispatch({ type: "next" })} disabled={step >= STEP_COUNT}>
            Next
            <ChevronRight aria-hidden className="size-4" />
          </button>
          <button type="button" className={pill} onClick={() => dispatch({ type: "togglePlay" })} aria-pressed={st.playing}>
            {st.playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
            {st.playing ? "Pause" : "Play"}
          </button>
          <BeatButton pressed={bloom} onClick={() => setBloom((b) => !b)}>
            Bloom filters
          </BeatButton>
        </>
      }
    >
      <div ref={box} role="group" aria-roledescription="step-through" aria-label={title} tabIndex={0} onKeyDown={onKeyDown} className={cn("rounded-xl", FOCUS_RING)}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* Memory table: new keys land here first. */}
          <rect x={MEM.x} y={MEM.y + 3} width={MEM.w} height={MEM.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={MEM.x} y={MEM.y} width={MEM.w} height={MEM.h} rx={14} strokeWidth={probe.inMemory ? 2.5 : 1.5} className={cn(NEUTRAL.surface, probe.inMemory ? TONES.good.stroke : NEUTRAL.line)} />
          <text x={MEM.x + 12} y={MEM.y + 21} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>Memory table</text>
          <text x={MEM.x + MEM.w - 12} y={MEM.y + 21} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`holds ${MEMTABLE_LIMIT} keys`}</text>
          {Array.from({ length: MEMTABLE_LIMIT }, (_, i) => {
            const m = s.memory[i];
            const x = slotX(i);
            if (!m) return <rect key={`empty-${i}`} x={x} y={SLOT.y} width={SLOT.w} height={SLOT.h} rx={8} strokeWidth={1.25} strokeDasharray="4 3" className={cn("fill-none", NEUTRAL.faintStroke)} />;
            const probeKey = m.key === PROBE_KEY;
            return (
              <g key={m.key} className={prevMem.has(m.key) && prev?.memory.find((p) => p.key === m.key)?.sold === m.sold ? undefined : APPEAR}>
                <rect x={x} y={SLOT.y} width={SLOT.w} height={SLOT.h} rx={8} strokeWidth={probeKey ? 2 : 1.5} className={cn(m.sold ? TONES.warn.softFill : TONES.accent.softFill, probeKey ? TONES.good.stroke : m.sold ? TONES.warn.stroke : TONES.accent.stroke)} />
                <text x={x + SLOT.w / 2} y={SLOT.y + 19.5} textAnchor="middle" className={cn(m.sold ? TONES.warn.text : TONES.accent.text, "text-[11.5px] font-semibold tabular-nums")}>{m.key}</text>
              </g>
            );
          })}

          {/* The two counters. */}
          {[
            { y: COUNTER.y1, num: probe.inMemory ? "0" : String(probe.checks), label: "files per read", tone: filesTone },
            { y: COUNTER.y2, num: formatAmp(s), label: "writes per put", tone: ampTone },
          ].map((c) => (
            <g key={c.label}>
              <rect x={COUNTER.x} y={c.y + 2} width={COUNTER.w} height={COUNTER.h} rx={12} className="fill-foreground/[0.06]" />
              <rect x={COUNTER.x} y={c.y} width={COUNTER.w} height={COUNTER.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={COUNTER.x + 12} y={c.y + 23} className={cn(c.tone.text, "text-[18px] font-bold tabular-nums")}>{c.num}</text>
              <text x={COUNTER.x + 58} y={c.y + 21} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{c.label}</text>
            </g>
          ))}

          {/* The read: a dot walks above the files it opens. */}
          <text x={12} y={137} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Disk files, newest first</text>
          <rect x={288} y={122} width={120} height={20} rx={10} className={TONES.accent.softFill} />
          <text x={348} y={136} textAnchor="middle" className={cn(TONES.accent.text, "text-[11.5px] font-semibold")}>{`Reading ${PROBE_KEY}`}</text>
          <line x1={12} x2={408} y1={GUIDE_Y} y2={GUIDE_Y} strokeWidth={1.5} strokeDasharray="3 4" className={NEUTRAL.faintStroke} />
          {showDot ? (
            <g>
              <circle cx={dotX} cy={GUIDE_Y} r={8} className={cn(TONES.accent.softFill)} />
              <circle cx={dotX} cy={GUIDE_Y} r={4.5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} />
            </g>
          ) : null}

          {/* Disk files. */}
          {s.files.length === 0 ? (
            <g>
              <rect x={FILE.x0} y={FILE.y} width={FILE.w} height={FILE.h} rx={12} strokeWidth={1.25} strokeDasharray="5 4" className={cn("fill-none", NEUTRAL.faintStroke)} />
              <text x={FILE.x0 + FILE.w / 2} y={FILE.y + FILE.h / 2 + 4} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>no files yet</text>
            </g>
          ) : null}
          {[...s.files].reverse().map((f) => {
            const slot = s.files.indexOf(f);
            return <FileCard key={f.id} file={f} slot={slot} mode={modeOf(f)} isNew={!prevIds.has(f.id)} merged={s.merged !== null} />;
          })}

          {/* Writes: what you wrote against what the disk wrote. */}
          <text x={12} y={BAR.y1 + 11.5} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>You wrote</text>
          <rect x={BAR.x0} y={BAR.y1} width={BAR.w} height={BAR.h} rx={7} className="fill-muted" />
          {s.puts > 0 ? <rect x={BAR.x0} y={BAR.y1} width={Math.max(6, s.puts * scale)} height={BAR.h} rx={7} className={cn(TONES.good.solidFill, "transition-[width] duration-500 motion-reduce:transition-none")} /> : null}
          <text x={12} y={BAR.y2 + 11.5} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>Disk wrote</text>
          <rect x={BAR.x0} y={BAR.y2} width={BAR.w} height={BAR.h} rx={7} className="fill-muted" />
          <g>
            {logW > 0 ? <rect x={BAR.x0} y={BAR.y2} width={Math.max(6, logW)} height={BAR.h} rx={7} className={NEUTRAL.doneFill} /> : null}
            {flushW > 0 ? <rect x={BAR.x0 + logW} y={BAR.y2} width={flushW} height={BAR.h} className={TONES.accent.solidFill} /> : null}
            {mergeW > 0 ? <rect x={BAR.x0 + logW + flushW} y={BAR.y2} width={mergeW} height={BAR.h} className={TONES.warn.solidFill} /> : null}
          </g>
          {legend.map((l) => (
            <g key={l.id}>
              <rect x={l.x} y={LEGEND_Y - 9} width={11} height={11} rx={3} className={l.cls} />
              <text x={l.x + 16} y={LEGEND_Y} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{l.text}</text>
            </g>
          ))}
          <text x={W - 12} y={LEGEND_Y} textAnchor="end" className={cn(NEUTRAL.mutedText, LABEL_HALO, "text-[11.5px] font-medium tabular-nums")}>{`Step ${step} of ${STEP_COUNT}`}</text>

          {/* Progress: one tick for every step. */}
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <rect key={i} x={12 + i * (396 / STEP_COUNT)} y={H - 16} width={396 / STEP_COUNT - 3} height={5} rx={2.5} className={i < step ? TONES.accent.solidFill : "fill-muted"} />
          ))}
        </svg>
        <p className="sr-only" aria-live="polite">{`${describeStep(s)} ${verdict.text}.`}</p>
      </div>
    </BeatFrame>
  );
}
