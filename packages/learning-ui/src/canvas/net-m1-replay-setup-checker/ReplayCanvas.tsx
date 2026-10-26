"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { ControlButton, useReducedMotion } from "../net-m2-address-bits/bit-parts";
import {
  RUNS_ON_LABEL,
  awaitingPick,
  canNext,
  choose,
  commandLines,
  currentIndex,
  isLast,
  lineKind,
  liveSummary,
  next,
  outputLines,
  outputVisible,
  pickResult,
  startOver,
  startState,
  stepLabel,
  type LineKind,
  type ReplayData,
  type ReplayState,
  type ReplayStep,
  type RunsOn,
} from "../models/net-replay";

export type ReplayCanvasProps = {
  title: string;
  purpose: string;
  limits: string;
  data: ReplayData;
};

const FADE_IN = "animate-in fade-in duration-200 motion-reduce:animate-none";

/** The "In the lab" or "On your computer" label. The words carry the meaning; the tint only helps. */
const RUNS_ON_CHIP: Record<RunsOn, string> = {
  lab: "bg-blue-500/20 text-blue-100 ring-blue-400/40",
  computer: "bg-amber-500/20 text-amber-100 ring-amber-400/40",
};

/** Output line colours on the dark card. PASS and FAIL are still written out. */
const LINE_CLASS: Record<LineKind, string> = {
  pass: "text-emerald-300",
  fail: "text-red-300",
  cut: "text-zinc-400",
  plain: "text-zinc-100",
};

const OPTION_BASE = "min-h-11 rounded-lg border px-3 py-2 text-left text-[13px] font-semibold leading-5 transition-colors motion-reduce:transition-none";
const OPTION_IDLE = "border-zinc-500 bg-zinc-800 text-zinc-100 hover:bg-zinc-700";
const OPTION_RIGHT = "border-emerald-400 bg-emerald-500/15 text-emerald-100 disabled:opacity-100";
const OPTION_WRONG = "border-red-400 bg-red-500/15 text-red-100 disabled:opacity-100";
const OPTION_REST = "border-zinc-700 bg-zinc-900 text-zinc-300 disabled:opacity-100";
const DARK_FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900";

function Command({ command }: { command: string }) {
  return (
    <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-5 text-zinc-50">
      {commandLines(command).map((line, k) => (
        <span key={k} className="block">
          <span aria-hidden="true" className="select-none text-zinc-400">
            {"$ "}
          </span>
          {line}
        </span>
      ))}
    </pre>
  );
}

function Output({ output }: { output: string }) {
  return (
    <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[13px] leading-5">
      {outputLines(output).map((line, k) => (
        <span key={k} className={cn("block min-h-5", LINE_CLASS[lineKind(line)])}>
          {line}
        </span>
      ))}
    </pre>
  );
}

type PredictPanelProps = {
  predict: NonNullable<ReplayStep["predict"]>;
  choice: number | null;
  /** Only the current step can be answered; an earlier answered step is read-only. */
  onPick: (option: number) => void;
};

function PredictPanel({ predict, choice, onPick }: PredictPanelProps) {
  const answered = choice !== null;
  return (
    <div className="rounded-lg border border-zinc-600 bg-zinc-950/60 p-3 font-sans">
      <p className="m-0 text-sm font-semibold leading-snug text-zinc-50">
        <span className="mr-2 rounded-full bg-zinc-700 px-2 py-0.5 text-xs font-semibold text-zinc-100">Predict</span>
        {predict.question}
      </p>
      <div role="group" aria-label="Pick the output you expect" className="mt-2 grid gap-2 sm:grid-cols-3">
        {predict.options.map((option, o) => {
          const isRight = o === predict.correct;
          const isPick = choice === o;
          const tag = !answered ? "" : isRight ? (isPick ? " (your pick, right)" : " (right answer)") : isPick ? " (your pick, not right)" : "";
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              aria-pressed={isPick}
              onClick={() => onPick(o)}
              className={cn(OPTION_BASE, DARK_FOCUS, !answered ? OPTION_IDLE : isRight ? OPTION_RIGHT : isPick ? OPTION_WRONG : OPTION_REST)}
            >
              <span className="font-mono">{option}</span>
              {tag ? <span className="block text-xs font-medium">{tag.trim()}</span> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className={cn("m-0 mt-2 text-sm font-semibold", choice === predict.correct ? "text-emerald-300" : "text-red-300")}>{pickResult(predict, choice).text}</p>
      ) : (
        <p className="m-0 mt-2 text-sm text-zinc-300">The output stays hidden until you pick.</p>
      )}
    </div>
  );
}

type ReplayViewProps = ReplayCanvasProps & {
  state: ReplayState;
  onNext: () => void;
  onStartOver: () => void;
  onPick: (option: number) => void;
};

/** The replay as a picture of its state. ReplayCanvas holds the state; the tests render this directly. */
export function ReplayView({ title, limits, data, state, onNext, onStartOver, onPick }: ReplayViewProps) {
  const reduced = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLElement | null)[]>([]);
  const first = useRef(true);
  const current = currentIndex(state);
  const answeredNow = state.choices[current] !== null;

  // Bring the newest step into view inside the card (no scroll on the first paint).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const box = scroller.current;
    const el = stepEls.current[current];
    if (!box || !el || typeof box.scrollTo !== "function") return;
    box.scrollTo({ top: Math.max(0, el.offsetTop - 8), behavior: reduced ? "auto" : "smooth" });
  }, [current, answeredNow, reduced]);

  const awaiting = awaitingPick(data, state);
  const last = isLast(data, state);
  const hint = awaiting
    ? "Pick what you expect, then press Next."
    : last
      ? "That was the whole recording. Start over to play it again."
      : "Press Next to run the next command.";

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hint}
      controls={
        <>
          <ControlButton onClick={onNext} disabled={!canNext(data, state)}>
            Next
          </ControlButton>
          <ControlButton onClick={onStartOver}>Start over</ControlButton>
        </>
      }
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveSummary(data, state)}
      </div>
      <div
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label={`Recorded terminal, step ${state.shown} of ${data.steps.length}`}
        className={cn("relative max-h-[30rem] overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-zinc-100 sm:p-4", DARK_FOCUS)}
      >
        {data.steps.slice(0, state.shown).map((step, i) => {
          const visible = outputVisible(data, state, i);
          const choice = state.choices[i];
          return (
            <section
              key={i}
              ref={(el) => {
                stepEls.current[i] = el;
              }}
              aria-label={stepLabel(data, i)}
              className={cn("flex flex-col gap-2", i > 0 && "mt-4 border-t border-zinc-700 pt-4", i === current && i > 0 && FADE_IN)}
            >
              <p className="m-0 flex flex-wrap items-center gap-2 font-sans text-xs font-semibold">
                <span className={cn("rounded-full px-2.5 py-1 ring-1", RUNS_ON_CHIP[step.runsOn])}>{RUNS_ON_LABEL[step.runsOn]}</span>
                <span className="text-zinc-300">{`Step ${i + 1} of ${data.steps.length}`}</span>
              </p>
              <Command command={step.command} />
              {step.predict ? <PredictPanel predict={step.predict} choice={choice} onPick={i === current ? onPick : () => {}} /> : null}
              {visible ? (
                <>
                  <Output output={step.output} />
                  <p className="m-0 border-l-2 border-blue-300 pl-3 font-sans text-sm leading-snug text-zinc-200">{step.note}</p>
                </>
              ) : null}
            </section>
          );
        })}
      </div>
    </BeatFrame>
  );
}

/** The terminal replay: a recorded lab session played one command at a time, with Next and Start over. */
export function ReplayCanvas(props: ReplayCanvasProps) {
  const { data } = props;
  const [state, setState] = useState<ReplayState>(() => startState(data));
  return (
    <ReplayView
      {...props}
      state={state}
      onNext={() => setState((s) => next(data, s))}
      onStartOver={() => setState(startOver(data))}
      onPick={(option) => setState((s) => choose(data, s, option))}
    />
  );
}

