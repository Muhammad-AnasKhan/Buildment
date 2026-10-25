"use client";

import { useId, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import {
  BYTE_PLACES,
  DRILL_SIZE,
  byteToBits,
  checkAnswer,
  explainQuestion,
  generateDrill,
  groupedBits,
  scoreText,
  toggleBit,
  type Bit,
  type Bits,
  type DrillQuestion,
} from "../models/net-address";
import { BitCard, Caption, ControlButton, ResultMark, bitName } from "./bit-parts";

type DrillProps = { title: string; purpose: string; limits: string };

const W = 420;
const H = 276;
const ZERO_BITS: Bits = [0, 0, 0, 0, 0, 0, 0, 0];

type AnswerCardProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  textClass: string;
  label: string;
  tone?: Tone;
  right?: boolean;
  onPress?: () => void;
};

/** A tappable answer in the picture. Once the question is answered it becomes a plain, marked card. */
function AnswerCard({ x, y, w, h, text, textClass, label, tone, right, onPress }: AnswerCardProps) {
  const body = (
    <>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        strokeWidth={tone ? 2.5 : 1.5}
        className={cn(tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
      />
      <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" className={cn(tone ? TONES[tone].text : NEUTRAL.text, "font-bold tabular-nums", textClass)}>
        {text}
      </text>
      {right !== undefined ? <ResultMark x={x + w - 24} y={y + 8} right={right} /> : null}
    </>
  );
  if (!onPress) {
    return (
      <g role="img" aria-label={label}>
        {body}
      </g>
    );
  }
  return (
    <SvgButton x={x} y={y} width={w} height={h} rx={14} label={label} onPress={onPress}>
      {body}
    </SvgButton>
  );
}

export function DrillView({ title, purpose, limits }: DrillProps) {
  const ids = useId().replace(/:/g, "");
  const [setNumber, setSetNumber] = useState(1);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(DRILL_SIZE).fill(null));
  const [tapped, setTapped] = useState<Bits>(ZERO_BITS);
  const [choice, setChoice] = useState<number | boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => generateDrill(setNumber), [setNumber]);
  const q: DrillQuestion = questions[index];
  const score = results.filter((r) => r === true).length;
  const ok = results[index] === true;
  const last = index === DRILL_SIZE - 1;

  const record = (right: boolean) => {
    setResults((prev) => prev.map((r, i) => (i === index ? right : r)));
    setSubmitted(true);
  };

  const pick = (value: number | boolean) => {
    if (submitted) return;
    setChoice(value);
    record(checkAnswer(q, value));
  };

  const tap = (i: number) => {
    if (submitted) return;
    setTapped((bits) => toggleBit(bits, i));
  };

  const advance = () => {
    if (!submitted || last) return;
    setIndex(index + 1);
    setTapped(ZERO_BITS);
    setChoice(null);
    setSubmitted(false);
  };

  const newSet = () => {
    setSetNumber(setNumber + 1);
    setIndex(0);
    setResults(Array(DRILL_SIZE).fill(null));
    setTapped(ZERO_BITS);
    setChoice(null);
    setSubmitted(false);
  };

  const isCheck = q.kind === "byte-to-bits" && !submitted;
  const onPrimary = () => (isCheck ? record(checkAnswer(q, tapped)) : advance());
  const primaryDisabled = !isCheck && (!submitted || last);

  const verdict: { text: string; tone: Tone } = !submitted
    ? { text: `Question ${index + 1} of ${DRILL_SIZE}`, tone: "accent" }
    : { text: `${ok ? "Right" : "Not quite"}${last ? `. ${scoreText(score)}` : ""}`, tone: ok ? "good" : "bad" };
  const feedback = submitted ? explainQuestion(q) : "";

  const prompt = q.kind === "byte-to-bits" ? "Tap the bits that make this number" : q.kind === "bits-to-byte" ? "Which number is this byte?" : "Could this address exist?";
  const subject = q.kind === "byte-to-bits" ? String(q.value) : q.kind === "bits-to-byte" ? groupedBits(q.bits) : q.text;
  const subjectClass = q.kind === "real-or-not" ? "text-[28px]" : "text-[32px]";

  const shownBits: Bits = q.kind === "byte-to-bits" ? (submitted ? byteToBits(q.value) : tapped) : ZERO_BITS;
  const status = `${verdict.text}. ${prompt}: ${subject}.${feedback ? ` ${feedback}.` : ""}`;

  const optionState = (value: number | boolean): { tone?: Tone; right?: boolean; note?: string } => {
    if (!submitted) return {};
    const right = checkAnswer(q, value);
    if (choice === value) return { tone: right ? "good" : "bad", right, note: right ? "your answer, correct" : "your answer, wrong" };
    if (right) return { tone: "good", right, note: "the right answer" };
    return {};
  };

  const dotCx = (k: number) => W / 2 + (k - (DRILL_SIZE - 1) / 2) * 32;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={isCheck ? <>Tap the bits, then press <b>Check</b>. <b>New set</b> draws fresh numbers.</> : <>Tap to answer, then <b>Next</b>. <b>New set</b> draws fresh numbers.</>}
      controls={
        <>
          <ControlButton onClick={onPrimary} disabled={primaryDisabled}>{isCheck ? "Check" : "Next"}</ControlButton>
          <ControlButton onClick={newSet}>New set</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} Set ${setNumber}, question ${index + 1} of ${DRILL_SIZE}.`}</desc>
        <DotGrid width={W} height={H} />

        {/* Progress: five dots, a mark inside each answered one. */}
        <g aria-hidden="true">
          <Caption x={12} y={63} anchor="start" strong>{`Set ${setNumber}`}</Caption>
          {Array.from({ length: DRILL_SIZE }, (_, k) => {
            const r = results[k];
            const tone: Tone | null = r === null ? null : r ? "good" : "bad";
            const here = k === index && r === null;
            return (
              <g key={k}>
                <circle
                  cx={dotCx(k)}
                  cy={58}
                  r={11}
                  strokeWidth={here ? 2.5 : 1.5}
                  className={cn(tone ? cn(TONES[tone].softFill, TONES[tone].stroke) : here ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line), SHAPE_TRANSITION)}
                />
                {r === null ? (
                  <text x={dotCx(k)} y={63} textAnchor="middle" className={cn(here ? TONES.accent.text : NEUTRAL.mutedText, "text-[13px] font-semibold")}>
                    {k + 1}
                  </text>
                ) : r ? (
                  <Check x={dotCx(k) - 7} y={51} width={14} height={14} strokeWidth={3} className={cn("fill-none", TONES.good.stroke)} />
                ) : (
                  <X x={dotCx(k) - 7} y={51} width={14} height={14} strokeWidth={3} className={cn("fill-none", TONES.bad.stroke)} />
                )}
              </g>
            );
          })}
        </g>

        {/* The question card, with the feedback line at its foot. */}
        <g aria-hidden="true">
          <rect x={8} y={80} width={W - 16} height={102} rx={16} strokeWidth={1.5} className={cn("fill-card", NEUTRAL.line)} />
          <Caption x={W / 2} y={103}>{prompt}</Caption>
          <text x={W / 2} y={143} textAnchor="middle" className={cn(NEUTRAL.text, "font-bold tabular-nums", subjectClass)}>
            {subject}
          </text>
          {feedback ? (
            <text x={W / 2} y={170} textAnchor="middle" className={cn(TONES[ok ? "good" : "bad"].text, "text-[14.5px] font-semibold tabular-nums")}>
              {feedback}
            </text>
          ) : null}
        </g>

        {q.kind === "byte-to-bits" ? (
          <g>
            {BYTE_PLACES.map((place, i) => {
              const x = (W - (8 * 44 - 4)) / 2 + i * 44;
              const wrong = submitted && tapped[i] !== shownBits[i];
              return (
                <g key={place}>
                  <Caption x={x + 20} y={204}>{place}</Caption>
                  <BitCard
                    x={x}
                    y={212}
                    w={40}
                    h={52}
                    bit={shownBits[i] as Bit}
                    label={`${bitName(place, shownBits[i] as Bit)}${wrong ? ", you had it the other way" : ""}`}
                    onPress={submitted ? undefined : () => tap(i)}
                    ring={wrong ? "bad" : undefined}
                    digitClass="text-[22px]"
                  />
                </g>
              );
            })}
          </g>
        ) : null}

        {q.kind === "bits-to-byte" ? (
          <g>
            {q.options.map((value, k) => {
              const st = optionState(value);
              return (
                <AnswerCard
                  key={value}
                  x={8 + k * 137}
                  y={198}
                  w={130}
                  h={64}
                  text={String(value)}
                  textClass="text-[30px]"
                  label={`Answer ${value}${st.note ? `, ${st.note}` : ""}`}
                  tone={st.tone}
                  right={st.right}
                  onPress={submitted ? undefined : () => pick(value)}
                />
              );
            })}
          </g>
        ) : null}

        {q.kind === "real-or-not" ? (
          <g>
            {([[true, "Real address"], [false, "Cannot exist"]] as const).map(([value, text], k) => {
              const st = optionState(value);
              return (
                <AnswerCard
                  key={text}
                  x={8 + k * 208}
                  y={198}
                  w={196}
                  h={64}
                  text={text}
                  textClass="text-[20px]"
                  label={`${text}${st.note ? `, ${st.note}` : ""}`}
                  tone={st.tone}
                  right={st.right}
                  onPress={submitted ? undefined : () => pick(value)}
                />
              );
            })}
          </g>
        ) : null}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
    </BeatFrame>
  );
}
