"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../components/ui/button";
import { layoutScreen, type ScreenLayout, type SpecScreen } from "../models/ui-specimen";
import { BeatFrame } from "./beat-frame";
import { BeatActionButton, BeatChoice } from "./beat-choice";
import { BeatSegmented } from "./beat-segmented";
import { PictureSlider, SliderRail } from "./picture-slider";
import { VerdictBanner } from "./svg-parts";
import { FOCUS_RING, TONES, type Tone } from "./tones";
import { SpecimenSvg } from "./ui-specimen-svg";

// Four playable beats built on one small interface drawn from data
// (models/ui-specimen.ts), so a course can teach a design rule on a screen
// the learner changes with a finger:
// - SpecimenCompare: switch between two to four versions of one screen.
// - SpecimenLadder: drag along a ladder of versions (spacing, size, contrast).
// - SpecimenSpot: tap the parts of a screen that cause a problem.
// - SpecimenSkim: see a page for a few seconds, then say what it was about.
// All data is plain JSON, so the server can render the first frame.

export type SpecVerdict = { text: string; tone: Tone };

/** Picture width in viewBox units; the screen is centred inside it. */
export const SPECIMEN_PICTURE_WIDTH = 360;
const BANNER_SPACE = 48;

function useLayouts(screens: SpecScreen[]): ScreenLayout[] {
  return useMemo(() => screens.map(layoutScreen), [screens]);
}

function screenX(layout: ScreenLayout): number {
  return Math.max(0, (SPECIMEN_PICTURE_WIDTH - layout.width) / 2);
}

function Picture({ height, title, children, svgRef }: { height: number; title: string; children: ReactNode; svgRef?: RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${SPECIMEN_PICTURE_WIDTH} ${height}`} role="img" className="mx-auto block h-auto w-full max-w-[400px] select-none">
      <title>{title}</title>
      {children}
    </svg>
  );
}

// ---------------------------------------------------------------- compare

export type CompareVersion = {
  id: string;
  /** Button label, about 12 characters or fewer. */
  label: string;
  screen: SpecScreen;
  verdict: SpecVerdict;
  /** Show this version blurred, as when you squint at a screen. */
  blur?: boolean;
};

export type SpecimenCompareConfig = {
  /** What the buttons choose, for screen readers ("Version"). */
  choiceLabel: string;
  versions: CompareVersion[];
  /** One line telling the learner what to touch. */
  hint: string;
  /** Id of the version shown first; defaults to the first. */
  start?: string;
};

export function SpecimenCompare({ title, limits, choiceLabel, versions, hint, start }: SpecimenCompareConfig & { title: string; limits: string }) {
  const [id, setId] = useState(start ?? versions[0]?.id);
  const layouts = useLayouts(useMemo(() => versions.map((v) => v.screen), [versions]));
  const index = Math.max(0, versions.findIndex((v) => v.id === id));
  const v = versions[index];
  const layout = layouts[index];
  const height = BANNER_SPACE + Math.max(...layouts.map((l) => l.height)) + 8;
  const options = versions.map((o) => ({ id: o.id, label: o.label }));
  const control =
    options.length === 2 ? (
      <BeatChoice label={choiceLabel} options={[options[0], options[1]] as const} value={v.id} onChange={setId} />
    ) : (
      <BeatSegmented label={choiceLabel} options={options} value={v.id} onChange={setId} />
    );
  return (
    <BeatFrame label={title} controls={control} hint={hint} limits={limits}>
      <Picture height={height} title={`${v.label}: ${v.screen.alt} ${v.verdict.text}.`}>
        <VerdictBanner width={SPECIMEN_PICTURE_WIDTH} text={v.verdict.text} tone={v.verdict.tone} />
        <SpecimenSvg layout={layout} x={screenX(layout)} y={BANNER_SPACE} frame={v.screen.frame ?? "phone"} background={v.screen.background} blur={v.blur} />
      </Picture>
      <p className="sr-only" aria-live="polite">{`${v.label}. ${v.screen.alt} ${v.verdict.text}.`}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- ladder

export type LadderStep = {
  screen: SpecScreen;
  verdict: SpecVerdict;
  /** What the slider reads out at this step, for example "Spacing 8". */
  valueText: string;
};

export type SpecimenLadderConfig = {
  /** The slider's name, for screen readers. */
  label: string;
  steps: LadderStep[];
  /** Words under the two ends of the rail, about 8 characters each. */
  ends: [string, string];
  /** One line under the rail saying what dragging changes, about 22 characters. */
  caption: string;
  hint: string;
  /** Index of the first step shown. */
  start?: number;
};

const RAIL_SPACE = 64;

export function SpecimenLadder({ title, limits, label, steps, ends, caption, hint, start = 0 }: SpecimenLadderConfig & { title: string; limits: string }) {
  const [i, setI] = useState(Math.min(Math.max(0, start), steps.length - 1));
  const svgRef = useRef<SVGSVGElement | null>(null);
  const layouts = useLayouts(useMemo(() => steps.map((s) => s.screen), [steps]));
  const maxH = Math.max(...layouts.map((l) => l.height));
  const height = BANNER_SPACE + maxH + RAIL_SPACE;
  const step = steps[i];
  const layout = layouts[i];
  const last = steps.length - 1;
  const x0 = 34;
  const x1 = SPECIMEN_PICTURE_WIDTH - 34;
  const ladder = useMemo(() => steps.map((_, k) => k), [steps]);
  return (
    <BeatFrame label={title} hint={hint} limits={limits}>
      <PictureSlider
        svgRef={svgRef}
        x0={x0}
        x1={x1}
        label={label}
        valueText={step.valueText}
        value={i}
        ladder={ladder}
        fromFraction={(f) => Math.round(Math.max(0, Math.min(1, f)) * last)}
        onChange={setI}
      >
        <Picture svgRef={svgRef} height={height} title={`${step.valueText}: ${step.screen.alt} ${step.verdict.text}.`}>
          <VerdictBanner width={SPECIMEN_PICTURE_WIDTH} text={step.verdict.text} tone={step.verdict.tone} />
          {/* The rail sits above the screen, so it stays put while the screen grows or shrinks below it. */}
          <SpecimenSvg layout={layout} x={screenX(layout)} y={BANNER_SPACE + RAIL_SPACE} frame={step.screen.frame ?? "phone"} background={step.screen.background} />
          <SliderRail
            x0={x0}
            x1={x1}
            y={BANNER_SPACE + 14}
            fraction={last === 0 ? 0 : i / last}
            marks={steps.map((_, k) => ({ at: last === 0 ? 0 : k / last }))}
            ends={ends}
            caption={caption}
          />
        </Picture>
      </PictureSlider>
      <p className="sr-only" aria-live="polite">{`${step.valueText}. ${step.verdict.text}.`}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- spot

export type SpotTarget = {
  /** The id of a block in the screen. */
  id: string;
  /** Short name of the problem, about 22 characters or fewer. */
  label: string;
  /** Why it is a problem, one or two short sentences. */
  why: string;
};

export type SpecimenSpotConfig = {
  screen: SpecScreen;
  targets: SpotTarget[];
  /** Reasons for blocks that are fine, keyed by block id. */
  fine?: Record<string, string>;
  hint: string;
  /** Banner before the first find and after the last, each about 34 characters or fewer. */
  startVerdict: string;
  doneVerdict: string;
  /** Optional fixed version, shown with a switch once every problem is found. */
  after?: { label: string; screen: SpecScreen; verdict: string };
};

export const SPOT_DEFAULT_FINE = "This part is doing its job. Look again.";

/** Pure rules of the spot game, so tests can check them without React. */
export function spotTap(found: string[], targets: SpotTarget[], fine: Record<string, string> | undefined, id: string): { found: string[]; message: string; right: boolean } {
  const t = targets.find((x) => x.id === id);
  if (!t) return { found, message: fine?.[id] ?? SPOT_DEFAULT_FINE, right: false };
  if (found.includes(id)) return { found, message: `${t.label}: ${t.why}`, right: true };
  const next = [...found, id];
  return { found: next, message: `${next.length} of ${targets.length}. ${t.label}: ${t.why}`, right: true };
}

export function SpecimenSpot({ title, limits, screen, targets, fine, hint, startVerdict, doneVerdict, after }: SpecimenSpotConfig & { title: string; limits: string }) {
  const [found, setFound] = useState<string[]>([]);
  const [message, setMessage] = useState(hint);
  const [showAfter, setShowAfter] = useState(false);
  const layouts = useLayouts(useMemo(() => (after ? [screen, after.screen] : [screen]), [screen, after]));
  const layout = layouts[0];
  const done = found.length === targets.length;
  const viewing = showAfter && after ? layouts[1] : layout;
  const height = BANNER_SPACE + Math.max(...layouts.map((l) => l.height)) + 8;
  const sx = screenX(layout);
  // Larger regions first, so a part inside a box sits on top of the box and gets the tap.
  const tappable = layout.regions
    .filter((r) => targets.some((t) => t.id === r.id) || (fine && r.id in fine))
    .sort((a, b) => b.w * b.h - a.w * a.h);
  const verdict: SpecVerdict = showAfter && after ? { text: after.verdict, tone: "good" } : done ? { text: doneVerdict, tone: "good" } : found.length ? { text: `Found ${found.length} of ${targets.length}`, tone: "warn" } : { text: startVerdict, tone: "accent" };
  const tap = (id: string) => {
    const r = spotTap(found, targets, fine, id);
    setFound(r.found);
    setMessage(r.message);
  };
  const controls = (
    <>
      {done && after ? (
        <BeatChoice label="Which version" options={[{ id: "before", label: "Problems" }, { id: "after", label: after.label }] as const} value={showAfter ? "after" : "before"} onChange={(v) => setShowAfter(v === "after")} />
      ) : null}
      <BeatActionButton
        onClick={() => {
          setFound([]);
          setShowAfter(false);
          setMessage(hint);
        }}
        disabled={found.length === 0}
      >
        Start again
      </BeatActionButton>
    </>
  );
  return (
    <BeatFrame label={title} controls={controls} hint={<span aria-live="polite">{message}</span>} limits={limits}>
      <Picture height={height} title={showAfter && after ? after.screen.alt : screen.alt}>
        <VerdictBanner width={SPECIMEN_PICTURE_WIDTH} text={verdict.text} tone={verdict.tone} />
        <SpecimenSvg layout={viewing} x={screenX(viewing)} y={BANNER_SPACE} frame={(showAfter && after ? after.screen.frame : screen.frame) ?? "phone"} background={showAfter && after ? after.screen.background : screen.background} />
        {!showAfter
          ? tappable.map((r) => {
              const n = found.indexOf(r.id);
              const isFound = n >= 0;
              const label = isFound ? `${targets.find((t) => t.id === r.id)?.label}, found` : "Check this part";
              return (
                <g
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-label={label}
                  className={cn("cursor-pointer", FOCUS_RING)}
                  onClick={() => tap(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tap(r.id);
                    }
                  }}
                >
                  <rect x={sx + r.x - 3} y={BANNER_SPACE + r.y - 3} width={r.w + 6} height={r.h + 6} rx={8} fill="transparent" className={isFound ? TONES.bad.stroke : "stroke-transparent"} strokeWidth={2} />
                  {isFound ? (
                    <g>
                      <circle cx={sx + r.x + r.w} cy={BANNER_SPACE + r.y} r={10} className={TONES.bad.solidFill} />
                      <text x={sx + r.x + r.w} y={BANNER_SPACE + r.y + 4} textAnchor="middle" className="fill-white text-[12px] font-bold dark:fill-red-950">{n + 1}</text>
                    </g>
                  ) : null}
                </g>
              );
            })
          : null}
      </Picture>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- skim

export type SkimOption = { id: string; label: string };

export type SpecimenSkimConfig = {
  screen: SpecScreen;
  /** How long the page shows, in seconds. */
  seconds: number;
  question: string;
  options: SkimOption[];
  answer: string;
  /** Why each option is right or wrong, keyed by option id. */
  why: Record<string, string>;
  hint: string;
  /** Banner after a right or a wrong answer, about 30 characters each. */
  rightVerdict?: string;
  wrongVerdict?: string;
};

type SkimPhase = "ready" | "showing" | "asking" | "answered";

export function SpecimenSkim({ title, limits, screen, seconds, question, options, answer, why, hint, rightVerdict, wrongVerdict }: SpecimenSkimConfig & { title: string; limits: string }) {
  const [phase, setPhase] = useState<SkimPhase>("ready");
  const [left, setLeft] = useState(seconds);
  const [picked, setPicked] = useState<string | null>(null);
  const layout = useMemo(() => layoutScreen(screen), [screen]);
  const height = BANNER_SPACE + layout.height + 8;
  useEffect(() => {
    if (phase !== "showing") return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, seconds - (Date.now() - started) / 1000);
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        setPhase("asking");
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, seconds]);
  const right = picked === answer;
  const verdict: SpecVerdict =
    phase === "ready"
      ? { text: `You get ${seconds} seconds`, tone: "accent" }
      : phase === "showing"
        ? { text: `Look: ${Math.ceil(left)} s left`, tone: "warn" }
        : phase === "asking"
          ? { text: "Time is up", tone: "accent" }
          : right
            ? { text: rightVerdict ?? "Right: the page made it clear", tone: "good" }
            : { text: wrongVerdict ?? "Not quite: see why below", tone: "bad" };
  const covered = phase === "ready" || phase === "asking";
  const controls =
    phase === "ready" ? (
      <BeatActionButton onClick={() => { setLeft(seconds); setPhase("showing"); }}>Start the skim</BeatActionButton>
    ) : phase === "answered" ? (
      <BeatActionButton onClick={() => { setPicked(null); setPhase("ready"); }}>Try again</BeatActionButton>
    ) : null;
  return (
    <BeatFrame label={title} controls={controls} hint={phase === "answered" && picked ? <span aria-live="polite">{why[picked]}</span> : hint} limits={limits}>
      <Picture height={height} title={covered ? "The page is hidden." : screen.alt}>
        <VerdictBanner width={SPECIMEN_PICTURE_WIDTH} text={verdict.text} tone={verdict.tone} />
        {/* Hidden means unreadable: blurred, faded and under a cover, so nobody can read it before Start. */}
        <SpecimenSvg layout={layout} x={screenX(layout)} y={BANNER_SPACE} frame={screen.frame ?? "browser"} background={screen.background} dim={covered} blur={covered} />
        {covered ? (
          <g aria-hidden>
            <rect x={screenX(layout)} y={BANNER_SPACE} width={layout.width} height={layout.height} rx={10} className="fill-card/80" />
            <text x={SPECIMEN_PICTURE_WIDTH / 2} y={BANNER_SPACE + Math.min(layout.height / 2, 120)} textAnchor="middle" className="fill-muted-foreground text-[14px] font-semibold">
              {phase === "ready" ? "The page is hidden" : "The page is hidden again"}
            </text>
          </g>
        ) : null}
        {phase === "showing" ? (
          <rect x={screenX(layout)} y={BANNER_SPACE - 6} width={layout.width * (left / seconds)} height={3} rx={1.5} className={TONES.warn.solidFill} />
        ) : null}
      </Picture>
      {phase === "asking" ? (
        <fieldset className="mt-3 px-1">
          <legend className="mb-2 text-sm font-semibold text-foreground">{question}</legend>
          <div className="flex flex-col gap-2">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setPicked(o.id); setPhase("answered"); }}
                className={cn(buttonVariants({ variant: "outline" }), "h-auto min-h-11 justify-start whitespace-normal rounded-xl px-4 py-2 text-left text-sm", FOCUS_RING)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
    </BeatFrame>
  );
}
