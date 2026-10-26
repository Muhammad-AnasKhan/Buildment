"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { Check, CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { ACCENT_CONTROL, FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { DRILL_SIZE, scoreText, type Bits } from "../models/net-address";
import { checkDrillChoice, type DrillItem } from "../models/net-drill";
import { ControlButton } from "./bit-parts";
import { ProgressDots } from "./DrillView";

// Pieces the module 3 and 9 views share. Anything the learner presses or
// drags is a native HTML button or range input, so it has a real role, a
// name and keyboard behaviour for free; the SVG parts only draw. Colour comes
// from the shared tones, and a state is never colour alone: digits, words and
// icons say the same thing.

export const W = 420;

const ICON = { good: CircleCheck, bad: CircleX, warn: TriangleAlert, accent: Info } as const;

/** The result of the picture as a line with an icon and words, for views drawn in HTML. */
export function VerdictChip({ text, tone }: { text: string; tone: Tone }) {
  const Icon = ICON[tone];
  return (
    <p className={cn("flex items-start gap-2 rounded-xl px-3 py-2 text-[15px] font-bold leading-snug ring-1 ring-inset", TONES[tone].chip)}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} />
      <span>{text}</span>
    </p>
  );
}

type RangeProps = {
  label: string;
  /** What the value means, for the reader and for assistive technology: "/24" or "172.17.5.0/24". */
  valueText: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
};

/** A native range input with its label, its value in words and the two ends. */
export function NativeRange({ label, valueText, value, min, max, onChange, minLabel, maxLabel }: RangeProps) {
  const id = useId();
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-3 pb-1 pt-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
        <output htmlFor={id} className="text-sm font-bold tabular-nums text-foreground">{valueText}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("block h-11 w-full cursor-pointer", ACCENT_CONTROL, FOCUS_RING)}
      />
      <div className="flex justify-between gap-2 pb-1 text-[13px] tabular-nums text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

const ON = cn("border-l-4 ring-1 ring-inset", TONES.accent.rule, TONES.accent.chip);
const OFF = "border border-border bg-card text-muted-foreground";

/** One bit you can flip: the digit is printed, and the state is also in `aria-pressed`. */
export function BitButton({ bit, label, onPress }: { bit: 0 | 1; label: string; onPress: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={bit === 1}
      aria-label={label}
      onClick={onPress}
      className={cn("h-11 w-full rounded-lg text-lg font-bold tabular-nums", SHAPE_TRANSITION, bit === 1 ? ON : OFF, FOCUS_RING)}
    >
      {bit}
    </button>
  );
}

/** One bit you cannot flip, for the mask and for results. Hidden from assistive technology: the live summary says it. */
export function StaticBit({ bit, lit, fixed }: { bit: 0 | 1; lit?: boolean; fixed?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-lg text-lg font-bold tabular-nums",
        SHAPE_TRANSITION,
        fixed ? "border border-dashed border-border bg-muted/40 text-foreground" : lit ? ON : OFF,
      )}
    >
      {bit}
    </div>
  );
}

type ChoiceProps = {
  children: ReactNode;
  /** The accessible name, which also says the state: "Answer 10.20.128.0, your answer, correct". */
  label: string;
  onClick?: () => void;
  pressed?: boolean;
  tone?: Tone;
  disabled?: boolean;
  mark?: "right" | "wrong";
  className?: string;
};

/** A full-width native button for an answer, a size or a run. */
export function ChoiceButton({ children, label, onClick, pressed, tone, disabled, mark, className }: ChoiceProps) {
  const lit = tone ?? (pressed ? "accent" : undefined);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      className={cn(
        "relative min-h-11 w-full rounded-xl px-3 py-2 text-left font-semibold tabular-nums disabled:cursor-default",
        SHAPE_TRANSITION,
        lit ? cn("border-l-4 ring-1 ring-inset", TONES[lit].rule, TONES[lit].chip) : "border border-border bg-card text-foreground hover:bg-muted/50 disabled:hover:bg-card",
        mark && "pr-9",
        FOCUS_RING,
        className,
      )}
    >
      {children}
      {mark ? (
        <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2">
          {mark === "right" ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
        </span>
      ) : null}
    </button>
  );
}

/** Text that may break after a colon or a dot, so a long address wraps between groups, never inside one. */
export function Breakable({ text }: { text: string }) {
  return (
    <>
      {text.split(/(?<=[:.])/).map((part, i) => (
        <span key={i}>
          {part}
          <wbr />
        </span>
      ))}
    </>
  );
}

/** A labelled value in a small card, for the facts a view reads out. */
export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2">
      <dt className="text-[13px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-all text-base font-bold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

/** A small muted caption over a row of HTML cells. At least 13px. */
export function RowCaption({ children }: { children: ReactNode }) {
  return <p className="mb-1 mt-3 text-[13px] font-medium text-muted-foreground first:mt-0">{children}</p>;
}

// ---------------------------------------------------------------- SVG strip of 32 bits

const CELL = 11;
const PITCH = 11.78;
const BYTE_GAP = 9;
const X0 = 8;

/** Left edge of bit cell i of 32: eight to a byte, a small gap between bytes. */
export const stripX = (i: number) => X0 + i * PITCH + Math.floor(i / 8) * BYTE_GAP;
/** The x of the middle of byte k (0 to 3). */
export const byteMid = (k: number) => (stripX(k * 8) + stripX(k * 8 + 7) + CELL) / 2;

type StripProps = { bits: Bits; y: number; tinted: number; marked?: number | null; markTone?: Tone };

/**
 * Thirty-two small bit cells. The first `tinted` are the network part and every
 * digit is printed, so colour is never the only signal. `marked` outlines one
 * cell in the error tone: the first bit where two blocks differ.
 */
export function BitStrip({ bits, y, tinted, marked = null, markTone = "bad" }: StripProps) {
  return (
    <g aria-hidden="true">
      {bits.map((bit, i) => {
        const network = i < tinted;
        return (
          <g key={i}>
            <rect
              x={stripX(i)}
              y={y}
              width={CELL}
              height={24}
              rx={4}
              strokeWidth={network ? 1.5 : 1}
              className={cn(network ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
            />
            {marked === i ? <rect x={stripX(i) - 2} y={y - 2} width={CELL + 4} height={28} rx={6} strokeWidth={2.5} className={cn("fill-none", TONES[markTone].stroke)} /> : null}
            <text x={stripX(i) + CELL / 2} y={y + 17} textAnchor="middle" className={cn(network ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-bold tabular-nums")}>
              {bit}
            </text>
          </g>
        );
      })}
    </g>
  );
}

// ---------------------------------------------------------------- drill

type DrillShellProps = {
  title: string;
  purpose: string;
  limits: string;
  /** Module-level function, so the questions of a set are computed once. */
  makeItems: (setNumber: number) => DrillItem[];
  /** The options as the learner reads them: large for addresses, smaller for sentences. */
  optionClass?: string;
};

const DRILL_H = 84;

/**
 * The five-question drill of modules 3 and 9: progress dots and a verdict in
 * the picture, the question in a card, the options as native buttons, the
 * working in words after each answer. Questions are seeded by the set number.
 */
export function DrillShell({ title, purpose, limits, makeItems, optionClass = "text-lg" }: DrillShellProps) {
  const ids = useId().replace(/:/g, "");
  const [setNumber, setSetNumber] = useState(1);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(DRILL_SIZE).fill(null));
  const [choice, setChoice] = useState<number | null>(null);

  const items = useMemo(() => makeItems(setNumber), [makeItems, setNumber]);
  const item = items[index];
  const submitted = choice !== null;
  const ok = results[index] === true;
  const last = index === DRILL_SIZE - 1;
  const score = results.filter((r) => r === true).length;

  const pick = (k: number) => {
    if (submitted) return;
    setChoice(k);
    const right = checkDrillChoice(item, k);
    setResults((prev) => prev.map((r, i) => (i === index ? right : r)));
  };

  const next = () => {
    if (!submitted || last) return;
    setIndex(index + 1);
    setChoice(null);
  };

  const newSet = () => {
    setSetNumber(setNumber + 1);
    setIndex(0);
    setResults(Array(DRILL_SIZE).fill(null));
    setChoice(null);
  };

  const verdict: { text: string; tone: Tone } = !submitted
    ? { text: `Question ${index + 1} of ${DRILL_SIZE}`, tone: "accent" }
    : { text: `${ok ? "Right" : "Not quite"}${last ? `. ${scoreText(score)}` : ""}`, tone: ok ? "good" : "bad" };
  const status = `${verdict.text}. ${item.prompt} ${item.subject}.${submitted ? ` ${item.explain}.` : ""}`;

  const stateOf = (k: number): { tone?: Tone; mark?: "right" | "wrong"; note: string } => {
    if (!submitted) return { note: "" };
    const right = k === item.answer;
    if (choice === k) return { tone: right ? "good" : "bad", mark: right ? "right" : "wrong", note: right ? ", your answer, correct" : ", your answer, wrong" };
    if (right) return { tone: "good", mark: "right", note: ", the right answer" };
    return { note: "" };
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the answer, then <b>Next</b>. <b>New set</b> draws fresh questions.</>}
      controls={
        <>
          <ControlButton onClick={next} disabled={!submitted || last}>Next</ControlButton>
          <ControlButton onClick={newSet}>New set</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${DRILL_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} Set ${setNumber}, question ${index + 1} of ${DRILL_SIZE}.`}</desc>
        <DotGrid width={W} height={DRILL_H} />
        <ProgressDots results={results} index={index} setNumber={setNumber} />
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <div className="mt-2 space-y-2 px-1 pb-1">
        <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center">
          <p className="text-[13px] font-medium text-muted-foreground">{item.prompt}</p>
          <p className={cn("mt-1 font-bold leading-tight tabular-nums text-foreground [overflow-wrap:anywhere]", item.subject.length > 24 ? "text-[20px]" : "text-[26px]")}>
            <Breakable text={item.subject} />
          </p>
        </div>
        <div role="group" aria-label="Answers" className="grid gap-2">
          {item.options.map((option, k) => {
            const st = stateOf(k);
            return (
              <ChoiceButton key={option} label={`Answer ${option}${st.note}`} tone={st.tone} mark={st.mark} disabled={submitted} onClick={() => pick(k)}>
                <span className={cn("[overflow-wrap:anywhere]", optionClass)}>
                  <Breakable text={option} />
                </span>
              </ChoiceButton>
            );
          })}
        </div>
        {submitted ? <p className={cn("rounded-xl px-3 py-2 text-sm font-medium leading-snug ring-1 ring-inset", TONES[ok ? "good" : "bad"].chip)}>{item.explain}</p> : null}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
    </BeatFrame>
  );
}
