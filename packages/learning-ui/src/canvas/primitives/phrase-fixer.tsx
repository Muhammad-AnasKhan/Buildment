"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "./beat-frame";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { LABEL_HALO, NEUTRAL, TONES, type Tone } from "./tones";
import { useBeatClock } from "./use-beat-clock";
import { tweenProgress, useTween } from "./use-motion";
import { wrapWords } from "../models/sorter";
import {
  factsLabel,
  foundLabel,
  layoutPhrase,
  phraseVerdict,
  rewriteText,
  showRewrite,
  startPhrase,
  STRIP_CHARS,
  tagNumber,
  tapSegment,
  weakStrip,
  DEFAULT_FINE_WHY,
  type PhrasePiece,
  type PhraseSegment,
  type PhraseState,
  type PhraseVerdicts,
} from "../models/phrase-fixer";

// A playable phrase fixer: a short text drawn as it looks on a phone card.
// The learner taps the phrases they think are weak. A weak one is underlined
// and numbered and the strip under the card says why and how to fix it; a
// fine one says so and stays plain. When every weak phrase is found, the card
// fades into the rewrite. Any course can use it with its own text.

export type PhraseFixerConfig = {
  /** The text in order. Mark the weak segments with `weak: { why, fix }`. */
  segments: PhraseSegment[];
  /** Small label on the card, for example "Resume bullet". At most 28 characters. */
  cardLabel: string;
  /** Facts a reader could already check before any fix; usually 0. */
  checkableBefore: number;
  /** The one line under the picture telling the learner what to do. */
  hint: string;
  /** The lesson shown in the strip once the rewrite is showing. At most five strip lines. */
  endNote: string;
  /** The banner before the rewrite, at most 38 characters. */
  prompt?: string;
  /** Own wording for the end banner; `{found}` and `{total}` are filled in. */
  verdicts?: PhraseVerdicts;
};

export const PHRASE_DEFAULT_PROMPT = "Tap the phrases a reader cannot check";

const W = 420;
const CARD = { x: 16, y: 48, w: 388 };
const TEXT_X = 34;
const FIRST_BASE = 118;
const LINE_H = 30;
const STRIP_LINE = 17;
const STRIP_H = 5 * STRIP_LINE + 20;
const FADE_MS = 220;
/** Estimated width of one character of the 15-unit card text, until the browser measures the real one. */
const EST_CHAR = 7.9;
const TAG_W = 8;

type View = "before" | "after";
type Box = { x: number; w: number };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Where each piece starts and how wide it is, estimated from character counts (the server render and the first frame). */
function estimateBoxes(lines: PhrasePiece[][], view: View): Record<string, Box> {
  const out: Record<string, Box> = {};
  lines.forEach((line, li) => {
    let chars = 0;
    line.forEach((piece, pi) => {
      if (pi > 0) chars += 1;
      out[`${view}:${li}:${pi}`] = { x: TEXT_X + chars * EST_CHAR, w: piece.text.length * EST_CHAR };
      chars += piece.text.length + (piece.tagged ? 1 : 0);
    });
  });
  return out;
}

export function PhraseFixer({ title, limits, segments, cardLabel, checkableBefore, hint, endNote, prompt = PHRASE_DEFAULT_PROMPT, verdicts }: PhraseFixerConfig & { title: string; limits: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef(new Map<string, SVGTSpanElement>());
  const [state, setState] = useState<PhraseState>(startPhrase);
  const [showBefore, setShowBefore] = useState(false);
  const [fade, setFade] = useState<{ from: View; at: number } | null>(null);
  const [measured, setMeasured] = useState<Record<string, Box>>({});
  const [live, setLive] = useState("");
  const clock = useBeatClock(wrap);
  const reduced = clock.reduced;
  const now = useTween(fade ? fade.at + FADE_MS + 40 : 0, reduced);
  const p = fade ? tweenProgress(now, fade.at, FADE_MS, reduced) : 1;

  const before = layoutPhrase(segments, "before");
  const after = layoutPhrase(segments, "after");
  const lineCount = Math.max(before.length, after.length);
  const cardBottom = FIRST_BASE + (lineCount - 1) * LINE_H + 20;
  const counterY = cardBottom + 26;
  const stripTop = counterY + 14;
  const H = stripTop + STRIP_H + 10;

  const view: View = state.revealed && !showBefore ? "after" : "before";
  const touched = state.last !== null || state.revealed;

  // The idle pulse runs until the first tap, only while on screen; a tap stops its clock.
  const { freeze, unfreeze } = clock;
  useEffect(() => {
    if (touched) freeze();
    else unfreeze();
  }, [touched, freeze, unfreeze]);

  const measure = useCallback(() => {
    const next: Record<string, Box> = {};
    pieceRefs.current.forEach((el, key) => {
      try {
        const len = el.getComputedTextLength();
        if (!el.getNumberOfChars() || !Number.isFinite(len)) return;
        next[key] = { x: el.getStartPositionOfChar(0).x, w: len };
      } catch {
        // Not laid out yet (hidden tab, test renderer): keep the estimate.
      }
    });
    setMeasured((old) => ({ ...old, ...next }));
  }, []);
  useIsoLayoutEffect(() => {
    measure();
  }, [measure, view, fade, segments]);
  useEffect(() => {
    document.fonts?.ready.then(measure).catch(() => {});
  }, [measure]);

  const boxes = { ...estimateBoxes(before, "before"), ...estimateBoxes(after, "after"), ...measured };

  const goTo = (next: PhraseState, nextShowBefore = showBefore) => {
    const from: View = state.revealed && !showBefore ? "after" : "before";
    const to: View = next.revealed && !nextShowBefore ? "after" : "before";
    if (from !== to) setFade({ from, at: performance.now() });
    setState(next);
    setShowBefore(nextShowBefore);
  };

  const tap = (id: string) => {
    const { state: next, outcome } = tapSegment(state, segments, id);
    if (outcome.kind === "ignored") return;
    goTo(next);
    if (outcome.kind === "fine") setLive(`Fine: ${outcome.segment.text}. ${outcome.why}`);
    else if (next.revealed) setLive(`${phraseVerdict(next, segments, verdicts)}. The rewrite: ${rewriteText(segments)}. ${endNote}`);
    else setLive(`Weak: ${outcome.segment.text}. ${outcome.segment.weak?.why} Fix: ${outcome.segment.weak?.fix}. ${foundLabel(next, segments)}.`);
  };

  const skip = () => {
    const next = showRewrite(state, segments);
    goTo(next, false);
    setLive(`${phraseVerdict(next, segments, verdicts)}. The rewrite: ${rewriteText(segments)}. ${endNote}`);
  };

  const again = () => {
    goTo(startPhrase(), false);
    setLive("Cleared. Tap the phrases you think are weak.");
  };

  const toggleBefore = () => {
    goTo(state, !showBefore);
    setLive(showBefore ? `The rewrite: ${rewriteText(segments)}` : "The original, with the weak phrases underlined.");
  };

  const lastSeg = segments.find((s) => s.id === state.last) ?? null;
  const banner: { text: string; tone: Tone } = state.revealed ? { text: phraseVerdict(state, segments, verdicts), tone: state.skipped ? "accent" : "good" } : { text: prompt, tone: "accent" };

  // The strip under the counters: why and the fix for a weak tap, the reason for a fine one, the lesson at the end.
  let strip: { text: string; className: string }[] = [];
  if (state.revealed) strip = wrapWords(endNote, STRIP_CHARS).map((text) => ({ text, className: cn(NEUTRAL.text, "font-medium") }));
  else if (lastSeg?.weak) {
    const s = weakStrip(lastSeg);
    strip = [...s.why.map((text) => ({ text, className: cn(TONES.bad.text, "font-bold") })), ...s.fix.map((text) => ({ text, className: cn(NEUTRAL.text, "font-medium") }))];
  } else if (lastSeg) strip = wrapWords(`Fine: ${lastSeg.fineWhy ?? DEFAULT_FINE_WHY}`, STRIP_CHARS).map((text) => ({ text, className: cn(NEUTRAL.text, "font-medium") }));
  else strip = [{ text: "Tap a phrase on the card. A weak one gets a number.", className: cn(NEUTRAL.mutedText, "font-medium") }];
  strip = strip.slice(0, 5);

  // Before the rewrite only found phrases are marked; once it shows, the original marks every weak phrase (the missed ones without a number).
  const isMarked = (id: string) => tagNumber(state, id) !== null || (state.revealed && !!segments.find((s) => s.id === id)?.weak);

  const textBlock = (v: View, opacity: number, interactive: boolean) => {
    const lines = v === "before" ? before : after;
    return (
      <g opacity={opacity} key={v}>
        {lines.map((line, li) => {
          const y = FIRST_BASE + li * LINE_H;
          let raised = false;
          return (
            <g key={li}>
              {/* Underlines: a found weak phrase (before) or a fix (after). Drawn under the baseline, clear of the letters. */}
              {line.map((piece, pi) => {
                const marked = v === "before" ? isMarked(piece.segment) : piece.fixed;
                const box = boxes[`${v}:${li}:${pi}`];
                if (!marked || !box) return null;
                return <rect key={pi} x={box.x} y={y + 5} width={box.w} height={2.5} rx={1.25} className={v === "before" ? TONES.bad.solidFill : TONES.good.solidFill} />;
              })}
              <text x={TEXT_X} y={y} className={cn(NEUTRAL.text, "text-[15px] font-medium")} style={{ whiteSpace: "pre" }}>
                {line.map((piece, pi) => {
                  const tag = v === "before" ? tagNumber(state, piece.segment) : null;
                  const marked = v === "before" ? isMarked(piece.segment) : piece.fixed;
                  const dy = raised ? 6 : undefined;
                  raised = false;
                  const parts = [
                    pi > 0 ? <tspan key={`s${pi}`} dy={dy}>{" "}</tspan> : null,
                    <tspan
                      key={`p${pi}`}
                      dy={pi > 0 ? undefined : dy}
                      ref={(el) => {
                        const key = `${v}:${li}:${pi}`;
                        if (el) pieceRefs.current.set(key, el);
                        else pieceRefs.current.delete(key);
                      }}
                      className={marked ? (v === "before" ? TONES.bad.text : TONES.good.text) : undefined}
                    >
                      {piece.text}
                    </tspan>,
                  ];
                  if (piece.tagged) {
                    raised = true;
                    parts.push(
                      <tspan key={`t${pi}`} dy={-6} className={cn("text-[13px] font-bold", TONES.bad.text)}>
                        {tag !== null && tag < 10 ? String(tag) : " "}
                      </tspan>
                    );
                  }
                  return parts;
                })}
              </text>
            </g>
          );
        })}

        {/* One button per segment, over its words on every line it spans. */}
        {interactive
          ? segments.map((seg) => {
              const rects: { x: number; y: number; w: number }[] = [];
              lines.forEach((line, li) =>
                line.forEach((piece, pi) => {
                  if (piece.segment !== seg.id) return;
                  const box = boxes[`${v}:${li}:${pi}`];
                  if (box) rects.push({ x: box.x - 3, y: FIRST_BASE + li * LINE_H - 20, w: box.w + 6 + (piece.tagged ? TAG_W : 0) });
                })
              );
              const tag = tagNumber(state, seg.id);
              const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  tap(seg.id);
                }
              };
              return (
                <g
                  key={seg.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={tag !== null}
                  aria-label={tag !== null ? `${seg.text}. Marked weak, number ${tag}.` : `${seg.text}. Tap if you think it is weak.`}
                  className="group cursor-pointer outline-none"
                  onClick={() => tap(seg.id)}
                  onKeyDown={onKeyDown}
                >
                  {rects.map((r, i) => (
                    <rect key={`h${i}`} x={r.x} y={r.y} width={r.w} height={LINE_H} rx={6} className="fill-transparent" />
                  ))}
                  {rects.map((r, i) => (
                    <rect key={`f${i}`} x={r.x - 1} y={r.y + 1} width={r.w + 2} height={LINE_H - 2} rx={7} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
                  ))}
                </g>
              );
            })
          : null}
      </g>
    );
  };

  const fading = fade && p < 1 && fade.from !== view;
  const pulse = !touched && !reduced ? 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(clock.seconds * 2.6)) : 0;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={state.revealed ? "Show the original compares the two. Try again clears the marks." : hint}
      controls={
        state.revealed ? (
          <>
            <BeatButton pressed={showBefore} onClick={toggleBefore}>Show the original</BeatButton>
            <BeatButton onClick={again}>Try again</BeatButton>
          </>
        ) : (
          <BeatButton onClick={skip}>Show the rewrite</BeatButton>
        )
      }
    >
      <div ref={wrap} className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${cardLabel}: ${view === "after" ? rewriteText(segments) : segments.map((s) => s.text).join(" ")}`} className="block h-auto w-full select-none">
          <title>{title}</title>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={banner.text} tone={banner.tone} />

          {/* The phone card: a small header with the card's label, then the text. */}
          <rect x={CARD.x} y={CARD.y + 3} width={CARD.w} height={cardBottom - CARD.y} rx={18} className="fill-foreground/[0.06]" />
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={cardBottom - CARD.y} rx={18} className={cn(NEUTRAL.surface, state.revealed && !state.skipped ? TONES.good.stroke : NEUTRAL.line)} strokeWidth={state.revealed && !state.skipped ? 2 : 1.5} />
          {pulse > 0 ? <rect x={CARD.x - 3} y={CARD.y - 3} width={CARD.w + 6} height={cardBottom - CARD.y + 6} rx={20} className={cn("fill-none", TONES.accent.stroke)} strokeWidth={2.5} opacity={pulse} aria-hidden /> : null}
          <circle cx={CARD.x + 24} cy={CARD.y + 22} r={10} className={NEUTRAL.faintFill} aria-hidden />
          <text x={CARD.x + 42} y={CARD.y + 27} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>
            {view === "after" ? `${cardLabel}, rewritten` : cardLabel}
          </text>
          <line x1={CARD.x + 16} x2={CARD.x + CARD.w - 16} y1={CARD.y + 42} y2={CARD.y + 42} className={NEUTRAL.line} strokeWidth={1} />

          {fading ? textBlock(fade.from, 1 - p, false) : null}
          {textBlock(view, fading ? p : 1, view === "before" && !state.revealed)}

          {/* The counters, inside the picture under the card. */}
          <text x={CARD.x + 4} y={counterY} className={cn(NEUTRAL.text, "text-[13.5px] font-bold tabular-nums")}>
            {foundLabel(state, segments)}
          </text>
          <text x={CARD.x + CARD.w - 4} y={counterY} textAnchor="end" className={cn(state.found.length || state.revealed ? TONES.good.text : NEUTRAL.text, "text-[13.5px] font-bold tabular-nums")}>
            {factsLabel(state, segments, checkableBefore)}
          </text>

          {/* The reason strip. */}
          <rect x={CARD.x} y={stripTop} width={CARD.w} height={STRIP_H} rx={14} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1} strokeDasharray="4 4" />
          {strip.map((line, i) => (
            <text key={`${i}-${line.text}`} x={CARD.x + 14} y={stripTop + 24 + i * STRIP_LINE} className={cn(line.className, LABEL_HALO, "text-[13px]")}>
              {line.text}
            </text>
          ))}
        </svg>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </div>
    </BeatFrame>
  );
}
