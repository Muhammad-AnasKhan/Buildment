"use client";

import { useId, useRef, useState } from "react";
import { Flag } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { stepByKey } from "../models/picture-controls";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { StepBar, type BarStep } from "../primitives/svg-step-bar";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { BACKUP_HOUR, DEFAULT_H, H_MAX, H_STEP, clockTime, formatHours, recoverMinutes, snapHours, stepsFor, verdictFor, type Mode } from "./model";

const W = 420;
const H = 322;
const BAR = { x0: 24, x1: 396, y: 128, h: 18 };
const BAR_MID = BAR.y + BAR.h / 2;
const STEP_BAR = { y: 246, scaleMax: 225, keyY: 278 };
const CHIP_Y = 68;

const MODES: readonly { id: Mode; text: string; label: string }[] = [
  { id: "nightly", text: "Backup only", label: "Nightly backup only" },
  { id: "log", text: "Backup + log", label: "Nightly backup plus a log saved every 5 minutes" },
  { id: "copy", text: "Region B copy", label: "A live copy in Region B" },
];

const STEP_TONE: Record<string, BarStep["tone"]> = { "copy-back": "accent", replay: "warn", promote: "good", switch: "neutral" };

const r1 = (v: number) => Math.round(v * 10) / 10;
const xOf = (h: number) => r1(BAR.x0 + (h / H_MAX) * (BAR.x1 - BAR.x0));

/** 19.3 beat 1: drag the failure marker along the day and switch what protects the database. */
export function FailureTimeCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [mode, setMode] = useState<Mode>("nightly");
  const [h, setH] = useState<number>(DEFAULT_H);

  const steps = stepsFor(mode, h);
  const barSteps: BarStep[] = steps.map((s) => ({ id: s.id, label: s.label, amount: s.minutes, tone: STEP_TONE[s.id] }));
  const total = recoverMinutes(mode, h);
  const verdict = verdictFor(mode, h);
  const xm = xOf(h);
  const labelX = Math.max(52, Math.min(W - 52, xm));
  // The red span: everything since the backup, or a short mark for the gap the log or the copy leaves (drawn wider than its true size so it shows beside the marker).
  const spanLeft = mode === "nightly" ? BAR.x0 : Math.max(BAR.x0, xm - 15);
  const spanWidth = Math.max(4, xm - spanLeft);
  const pulse = clock.reduced ? 0 : 1.6 * Math.sin(clock.seconds * 3.2);
  const ticks = mode === "log" ? Math.floor((h * 60) / 5) : 0;
  const tickPath = Array.from({ length: ticks + 1 }, (_, i) => `M${r1(BAR.x0 + (i * 5 * (BAR.x1 - BAR.x0)) / (H_MAX * 60))} ${BAR.y + BAR.h + 3} v5`).join(" ");

  const widths = MODES.map((m) => chipWidth(m.text));
  const chipX = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 16)) / 2);
  const when = clockTime(h);
  const description = `A ${mode === "nightly" ? "nightly backup" : mode === "log" ? "nightly backup plus a log saved every 5 minutes" : "live copy in Region B"}. The database fails at ${when}, ${formatHours(h)} hours after the 02:00 backup. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag the <b>failure marker</b> along the day, then switch what protects the database.
        </>
      }
      controls={
        <BeatButton
          onClick={() => {
            setMode("nightly");
            setH(DEFAULT_H);
          }}
        >
          Reset
        </BeatButton>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="What protects the database">
            {MODES.map((m, i) => (
              <SvgRadioChip key={m.id} x={chipX[i]} y={CHIP_Y} width={widths[i]} text={m.text} label={m.label} checked={mode === m.id} onSelect={() => setMode(m.id)} />
            ))}
          </g>

          {/* The day, from the 02:00 backup to the next 02:00. */}
          <g aria-hidden>
            <rect x={BAR.x0} y={BAR.y} width={BAR.x1 - BAR.x0} height={BAR.h} rx={9} className="fill-muted" />
            <rect x={r1(spanLeft)} y={BAR.y} width={r1(spanWidth)} height={BAR.h} rx={4} className={cn(TONES.bad.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
            {ticks > 0 ? <path d={tickPath} strokeWidth={0.9} className={TONES.good.stroke} fill="none" /> : null}
            <line x1={BAR.x0} x2={BAR.x0} y1={BAR.y - 10} y2={BAR.y + BAR.h + 8} strokeWidth={2} className={TONES.good.stroke} />
            <polygon points={`${BAR.x0},${BAR.y - 10} ${BAR.x0 + 11},${BAR.y - 6} ${BAR.x0},${BAR.y - 2}`} className={TONES.good.solidFill} />
            {[0, 6, 12, 18, 24].map((t) => (
              <text key={t} x={xOf(t)} y={BAR.y + BAR.h + 26} textAnchor={t === 0 ? "start" : t === 24 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {clockTime(t)}
              </text>
            ))}
          </g>

          {/* The failure marker: the one thing to drag. */}
          <TightRailSlider
            svgRef={svg}
            x0={BAR.x0}
            x1={BAR.x1}
            y={BAR_MID}
            label="Time of the failure"
            valueText={`${when}, ${formatHours(h)} hours after the ${String(BACKUP_HOUR).padStart(2, "0")}:00 backup`}
            value={h}
            min={0}
            max={H_MAX}
            fromFraction={(f) => snapHours(f * H_MAX)}
            onKey={(v, key) => stepByKey(v, key, { min: 0, max: H_MAX, step: H_STEP, page: 3 })}
            onChange={(v) => setH(snapHours(v))}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
            above={40}
            below={34}
            side={18}
          >
            <g aria-hidden>
              <line x1={xm} x2={xm} y1={BAR.y - 16} y2={BAR_MID} strokeWidth={2} className={TONES.bad.stroke} />
              <text x={labelX} y={BAR.y - 22} textAnchor="middle" className={cn(TONES.bad.text, "text-[12.5px] font-bold tabular-nums")}>fails {when}</text>
              <circle cx={xm} cy={BAR_MID} r={17 + pulse} className={TONES.bad.softFill} />
              <circle cx={xm} cy={BAR_MID} r={11} strokeWidth={2.5} className={cn(TONES.bad.solidFill, "stroke-card")} />
              <line x1={xm - 3} x2={xm - 3} y1={BAR_MID - 4.5} y2={BAR_MID + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
              <line x1={xm + 3} x2={xm + 3} y1={BAR_MID - 4.5} y2={BAR_MID + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
            </g>
          </TightRailSlider>

          {/* What the bar and the marker mean. */}
          <g aria-hidden>
            <Flag x={24} y={190} width={13} height={13} strokeWidth={2.2} className="text-emerald-600 dark:text-emerald-400" />
            <text x={42} y={201} className={cn(NEUTRAL.text, "text-[11.5px] font-medium")}>last full backup</text>
            <rect x={156} y={191} width={10} height={10} rx={3} className={TONES.bad.solidFill} />
            <text x={172} y={201} className={cn(NEUTRAL.text, "text-[11.5px] font-medium")}>data lost</text>
            {mode === "log" ? (
              <g>
                <line x1={244} x2={244} y1={190} y2={202} strokeWidth={1.5} className={TONES.good.stroke} />
                <text x={252} y={201} className={cn(NEUTRAL.text, "text-[11.5px] font-medium")}>log saved every 5 min</text>
              </g>
            ) : null}
          </g>

          {/* The second clock: how long to get back, step by step. */}
          <text x={24} y={STEP_BAR.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>time to get back</text>
          <text x={396} y={STEP_BAR.y - 8} textAnchor="end" className={cn(TONES[verdict.tone].text, "text-[12.5px] font-bold tabular-nums")}>{`${total} min in all`}</text>
          <StepBar x0={24} x1={396} y={STEP_BAR.y} steps={barSteps} scaleMax={STEP_BAR.scaleMax} unit="min" keyY={STEP_BAR.keyY} />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
