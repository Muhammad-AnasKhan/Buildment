"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { DRILL_SIZE, checkCidrAnswer, explainCidrQuestion, formatAddressNumber, generateCidrDrill, scoreText, type CidrQuestion } from "../models/net-address";
import { Caption, ControlButton } from "./bit-parts";
import { AnswerCard, ProgressDots } from "./DrillView";

type Props = { title: string; purpose: string; limits: string };

const W = 420;
const H = 314;

/** The size and mask drill: five seeded questions per set, each with three options one prefix step apart. */
export function CidrDrillView({ title, purpose, limits }: Props) {
  const ids = useId().replace(/:/g, "");
  const [setNumber, setSetNumber] = useState(1);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => Array(DRILL_SIZE).fill(null));
  const [choice, setChoice] = useState<number | string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const questions = useMemo(() => generateCidrDrill(setNumber), [setNumber]);
  const q: CidrQuestion = questions[index];
  const score = results.filter((r) => r === true).length;
  const ok = results[index] === true;
  const last = index === DRILL_SIZE - 1;

  const pick = (value: number | string) => {
    if (submitted) return;
    setChoice(value);
    const right = checkCidrAnswer(q, value);
    setResults((prev) => prev.map((r, i) => (i === index ? right : r)));
    setSubmitted(true);
  };

  const next = () => {
    if (!submitted || last) return;
    setIndex(index + 1);
    setChoice(null);
    setSubmitted(false);
  };

  const newSet = () => {
    setSetNumber(setNumber + 1);
    setIndex(0);
    setResults(Array(DRILL_SIZE).fill(null));
    setChoice(null);
    setSubmitted(false);
  };

  const verdict: { text: string; tone: Tone } = !submitted
    ? { text: `Question ${index + 1} of ${DRILL_SIZE}`, tone: "accent" }
    : { text: `${ok ? "Right" : "Not quite"}${last ? `. ${scoreText(score)}` : ""}`, tone: ok ? "good" : "bad" };
  const feedback = submitted ? explainCidrQuestion(q) : "";
  const prompt = q.kind === "prefix-size" ? "How many addresses are in this block?" : "Which mask goes with this prefix?";
  const subject = `/${q.prefix}`;
  const status = `${verdict.text}. ${prompt} ${subject}.${feedback ? ` ${feedback}.` : ""}`;

  const optionState = (value: number | string): { tone?: Tone; right?: boolean; note?: string } => {
    if (!submitted) return {};
    const right = checkCidrAnswer(q, value);
    if (choice === value) return { tone: right ? "good" : "bad", right, note: right ? "your answer, correct" : "your answer, wrong" };
    if (right) return { tone: "good", right, note: "the right answer" };
    return {};
  };

  const options: (number | string)[] = q.options;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the answer, then <b>Next</b>. <b>New set</b> draws fresh prefixes.</>}
      controls={
        <>
          <ControlButton onClick={next} disabled={!submitted || last}>Next</ControlButton>
          <ControlButton onClick={newSet}>New set</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} Set ${setNumber}, question ${index + 1} of ${DRILL_SIZE}.`}</desc>
        <DotGrid width={W} height={H} />
        <ProgressDots results={results} index={index} setNumber={setNumber} />

        {/* The question card, with the feedback line at its foot. */}
        <g aria-hidden="true">
          <rect x={8} y={80} width={W - 16} height={90} rx={16} strokeWidth={1.5} className={cn("fill-card", NEUTRAL.line)} />
          <Caption x={W / 2} y={102}>{prompt}</Caption>
          <text x={W / 2} y={140} textAnchor="middle" className={cn(NEUTRAL.text, "text-[32px] font-bold tabular-nums")}>
            {subject}
          </text>
          {feedback ? (
            <text x={W / 2} y={162} textAnchor="middle" className={cn(TONES[ok ? "good" : "bad"].text, "text-[14.5px] font-semibold tabular-nums")}>
              {feedback}
            </text>
          ) : null}
        </g>

        {options.map((value, k) => {
          const st = optionState(value);
          const text = typeof value === "number" ? formatAddressNumber(value) : value;
          return (
            <AnswerCard
              key={String(value)}
              x={8}
              y={180 + k * 44}
              w={W - 16}
              h={38}
              baseline={7}
              text={text}
              textClass="text-[20px]"
              label={`Answer ${text}${st.note ? `, ${st.note}` : ""}`}
              tone={st.tone}
              right={st.right}
              onPress={submitted ? undefined : () => pick(value)}
            />
          );
        })}

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
    </BeatFrame>
  );
}
