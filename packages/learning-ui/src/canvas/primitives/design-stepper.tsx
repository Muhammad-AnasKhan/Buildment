"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  CARD_H,
  CARD_W,
  describeDesignFrame,
  designFrame,
  flowPacket,
  labelHop,
  nextPhase,
  TAG_H,
  type DesignFrame,
  type DesignSpec,
  type FrameFlow,
} from "../models/design-stepper";
import { BeatButton, BeatFrame } from "./beat-frame";
import { SvgNode } from "./svg-node";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES } from "./tones";
import { useBeatClock } from "./use-beat-clock";
import { useStepper } from "./use-stepper";

// Step through a design one step at a time. A row of step chips sits on top
// of the picture; Back and Next sit under it. Each step adds to the picture
// (parts, links, chips) and keeps what earlier steps added, requests run
// through it, and a step can hold one thing to play with: flip a choice,
// break a part, add the fix. The course data is a DesignSpec
// (models/design-stepper.ts), so another course steps through its own design.

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * New parts, links, chips and each new verdict fade in with CSS (tw-animate-css),
 * not with the beat clock, so they always end visible even when the clock is
 * paused, and appear at once under reduced motion.
 */
const FADE_IN = "animate-in fade-in duration-300 motion-reduce:animate-none";

/**
 * Where a request's label may sit, as offsets from the request in picture units.
 * The default tries above the request, then below it. A picture whose cards stand
 * close together passes more rows (for example above and below the row of cards).
 */
export const LABEL_ROWS_DEFAULT: readonly number[] = [-31, 11];

type DesignStepperProps = { design: DesignSpec; title: string; limits: string; labelRows?: readonly number[] };

export function DesignStepper({ design, title, limits, labelRows }: DesignStepperProps) {
  const stepper = useStepper(design.steps.length);
  const { active, isLast } = stepper;
  // The action's phase belongs to one step; moving to another step starts it at 0.
  const [phaseOf, setPhaseOf] = useState({ step: 0, phase: 0 });
  const phase = phaseOf.step === active ? phaseOf.phase : 0;
  const frame = designFrame(design, active, phase);

  const ref = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLOListElement>(null);
  // Arrow keys, Back and Next move the step while the focus ring sits on the chip the learner last used.
  // Keep the ring on the current step's chip, so it never shows on a step that is over.
  useEffect(() => {
    const list = chips.current;
    const current = list?.querySelectorAll("button")[active];
    if (list && current && list.contains(document.activeElement) && document.activeElement !== current) current.focus({ preventScroll: true });
  }, [active]);
  const clock = useBeatClock(ref);
  const { restart } = clock;
  useEffect(() => {
    restart();
  }, [active, phase, restart]);
  const advance = () => setPhaseOf({ step: active, phase: nextPhase(design, active, phase) });

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={frame.hint}
      controls={
        <>
          <BeatButton onClick={stepper.prev}>
            <ChevronLeft aria-hidden className="size-4" />
            Back
          </BeatButton>
          {isLast ? (
            <BeatButton onClick={stepper.reset}>
              <RotateCcw aria-hidden className="size-4" />
              Start over
            </BeatButton>
          ) : (
            <BeatButton pressed onClick={stepper.next}>
              Next
              <ChevronRight aria-hidden className="size-4" />
            </BeatButton>
          )}
        </>
      }
    >
      <div onKeyDown={stepper.onKeyDown}>
        <ol ref={chips} aria-label="Design steps" className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {design.steps.map((step, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => stepper.go(i)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${step.title}${done ? ", done" : ""}`}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-1 rounded-full border px-1.5 text-[13px] font-semibold sm:gap-1.5 sm:px-2 sm:text-sm transition-colors motion-reduce:transition-none sm:h-10",
                    FOCUS_RING,
                    on
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950"
                      : done
                        ? "border-border bg-muted text-foreground hover:bg-muted/70"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {done ? <Check aria-hidden className="size-3 shrink-0 sm:size-3.5" /> : <span aria-hidden className="font-mono text-xs tabular-nums">{i + 1}</span>}
                  <span className="truncate">{step.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div ref={ref} className="mt-2" onPointerDown={clock.freeze} onPointerUp={clock.unfreeze} onPointerLeave={clock.unfreeze} onPointerCancel={clock.unfreeze}>
          <DesignPicture design={design} frame={frame} seconds={clock.seconds} reduced={clock.reduced} onTap={advance} labelRows={labelRows} />
        </div>

        <div className="mt-2 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 px-1">
          {frame.action ? (
            <BeatButton pressed={frame.action.toggle ? frame.action.pressed : undefined} onClick={advance}>
              {frame.action.label}
            </BeatButton>
          ) : null}
          <p aria-live="polite" className="min-w-0 flex-1 text-sm text-foreground">
            <span className="sr-only">{`Step ${active + 1}, ${frame.title}. ${frame.verdict.text}. `}</span>
            {frame.says}
          </p>
        </div>
      </div>
    </BeatFrame>
  );
}

type DesignPictureProps = {
  design: DesignSpec;
  frame: DesignFrame;
  /** Seconds since this step (or phase) began; drives the running requests. */
  seconds: number;
  /** Reduced motion: no moving requests, everything settled. */
  reduced: boolean;
  /** Called when the learner taps the action's target card. */
  onTap?: () => void;
  /** Rows to try for a request's label, in order (see LABEL_ROWS_DEFAULT). */
  labelRows?: readonly number[];
  /** Extra SVG drawn inside the picture above the cards, under the verdict (for example a row of choice chips). */
  children?: ReactNode;
};

/** The picture of one frame of a design: links, running requests, cards, chips and the verdict. */
export function DesignPicture({ design, frame, seconds, reduced, onTap, labelRows = LABEL_ROWS_DEFAULT, children }: DesignPictureProps) {
  const W = design.width;
  const H = design.height;
  const since = seconds;
  const target = frame.action?.target;
  const boxes: Box[] = [
    ...frame.actors.map((a) => ({ left: a.x - CARD_W / 2, right: a.x + CARD_W / 2, top: a.y - CARD_H / 2, bottom: a.y + CARD_H / 2 })),
    ...frame.tags.map((t) => ({ left: t.x - t.width / 2, right: t.x + t.width / 2, top: t.y - TAG_H / 2, bottom: t.y + TAG_H / 2 })),
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={describeDesignFrame(frame, design.steps.length)} className="block h-auto w-full select-none">
      <DotGrid width={W} height={H} />

      {design.empty && frame.links.length === 0 ? (
        <g aria-hidden>
          <rect x={design.empty.x} y={design.empty.y} width={design.empty.width} height={design.empty.height} rx={16} strokeWidth={1.5} strokeDasharray="6 6" className={cn("fill-none", NEUTRAL.faintStroke)} />
          <text x={design.empty.x + design.empty.width / 2} y={design.empty.y + design.empty.height / 2 + 5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>
            {design.empty.text}
          </text>
        </g>
      ) : null}

      {/* Links first, so the cards sit on top of them. */}
      {frame.links.map((l) => (
        <line
          key={l.id}
          x1={l.a.x}
          y1={l.a.y}
          x2={l.b.x}
          y2={l.b.y}
          opacity={l.ghost ? 0.6 : 1}
          strokeLinecap="round"
          strokeWidth={l.broken ? 2.25 : l.lit ? 2.5 : 1.75}
          strokeDasharray={l.broken ? "6 5" : l.ghost ? "3 5" : undefined}
          className={cn(SHAPE_TRANSITION, l.isNew && FADE_IN, l.broken ? TONES.bad.stroke : l.lit ? TONES.accent.stroke : NEUTRAL.faintStroke)}
        />
      ))}

      {/* Requests travel under the cards, so they leave one part and vanish into the next. */}
      {reduced ? null : frame.flows.map((f, i) => <Packet key={`${frame.step}-${frame.phase}-${i}`} flow={f} seconds={since} />)}

      {frame.actors.map((a) => (
        <g key={a.id} opacity={a.ghost ? 0.55 : 1} className={a.isNew ? FADE_IN : undefined}>
          <SvgNode
            x={a.x}
            y={a.y}
            label={a.label}
            kind={a.kind}
            status={a.status?.text}
            statusTone={a.broken ? "bad" : a.status?.tone}
            mark={a.mark}
          />
          {a.ghost ? (
            <rect x={a.x - CARD_W / 2} y={a.y - CARD_H / 2} width={CARD_W} height={CARD_H} rx={14} strokeDasharray="5 4" strokeWidth={1.75} className={cn("fill-none", NEUTRAL.doneStroke)} />
          ) : null}
        </g>
      ))}

      {frame.tags.map((t) => {
        const tone = TONES[t.tone ?? "accent"];
        return (
          <g key={t.id} className={t.isNew ? FADE_IN : undefined}>
            <rect x={t.x - t.width / 2} y={t.y - TAG_H / 2} width={t.width} height={TAG_H} rx={TAG_H / 2} className={NEUTRAL.surface} />
            <rect x={t.x - t.width / 2} y={t.y - TAG_H / 2} width={t.width} height={TAG_H} rx={TAG_H / 2} strokeWidth={1.5} className={cn(tone.softFill, tone.stroke)} />
            <text x={t.x} y={t.y + 4} textAnchor="middle" className={cn(tone.text, "text-[11.5px] font-semibold tabular-nums")}>
              {t.text}
            </text>
          </g>
        );
      })}

      {reduced ? null : frame.flows.map((f, i) => <PacketLabel key={`${frame.step}-${frame.phase}-${i}`} flow={f} seconds={since} boxes={boxes} rows={labelRows} />)}

      {/* The part the learner can tap: a dashed ring that breathes, and a tap area over the card. The button under the picture does the same for keyboards. */}
      {target
        ? frame.actors
            .filter((a) => a.id === target)
            .map((a) => (
              <g key={`tap-${a.id}`}>
                <rect
                  x={a.x - CARD_W / 2 - 5}
                  y={a.y - CARD_H / 2 - 5}
                  width={CARD_W + 10}
                  height={CARD_H + 10}
                  rx={19}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  opacity={reduced ? 1 : 0.55 + 0.45 * Math.cos(since * 3)}
                  className={cn("pointer-events-none fill-none", TONES.accent.stroke)}
                />
                <rect
                  x={a.x - CARD_W / 2 - 6}
                  y={a.y - CARD_H / 2 - 6}
                  width={CARD_W + 12}
                  height={CARD_H + 12}
                  rx={19}
                  aria-hidden
                  onClick={onTap}
                  className="cursor-pointer fill-transparent"
                />
              </g>
            ))
        : null}

      {children}

      <g key={`verdict-${frame.step}-${frame.phase}`} className={FADE_IN}>
        <VerdictBanner width={W} text={frame.verdict.text} tone={frame.verdict.tone} />
      </g>
    </svg>
  );
}

/** One request running along its path, with a short trail. Drawn under the cards. */
function Packet({ flow, seconds }: { flow: FrameFlow; seconds: number }) {
  const at = flowPacket(flow, seconds);
  if (!at) return null;
  const tone = TONES[flow.tone];
  const trail = [0.05, 0.1, 0.15]
    .map((d) => flowPacket(flow, seconds - d))
    .filter((p): p is NonNullable<typeof p> => p !== null && p.hop === at.hop);
  return (
    <g aria-hidden>
      {trail.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5.5 - i * 1.3} opacity={0.35 - i * 0.1} className={tone.solidFill} />
      ))}
      <circle cx={at.x} cy={at.y} r={7.5} className={tone.solidFill} />
      <circle cx={at.x} cy={at.y} r={2.75} className="fill-card" />
    </g>
  );
}

type Box = { left: number; right: number; top: number; bottom: number };
const hits = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * The request's label, above the cards so no card hides it. It shows on the
 * longest hop, in the middle of the trip, and only where it is clear of every
 * card and chip: above the request if there is room, else below it.
 */
function PacketLabel({ flow, seconds, boxes, rows }: { flow: FrameFlow; seconds: number; boxes: Box[]; rows: readonly number[] }) {
  const at = flowPacket(flow, seconds);
  if (!at || !flow.label || at.hop !== labelHop(flow)) return null;
  const fade = clamp01((Math.min(at.progress, 1 - at.progress) - 0.15) / 0.1);
  if (fade <= 0) return null;
  const chipW = flow.label.length * 6.6 + 16;
  const place = (dy: number): Box => ({ left: at.x - chipW / 2, right: at.x + chipW / 2, top: at.y + dy, bottom: at.y + dy + 20 });
  const top = rows.find((dy) => !boxes.some((b) => hits(b, place(dy))));
  if (top === undefined) return null;
  const tone = TONES[flow.tone];
  return (
    <g aria-hidden opacity={fade} transform={`translate(${at.x} ${at.y})`}>
      <rect x={-chipW / 2} y={top} width={chipW} height={20} rx={10} strokeWidth={1.5} className={cn(NEUTRAL.surface, tone.stroke)} />
      <text y={top + 14} textAnchor="middle" className={cn(tone.text, "text-[11.5px] font-semibold")}>
        {flow.label}
      </text>
    </g>
  );
}
