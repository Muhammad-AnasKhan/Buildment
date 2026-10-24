"use client";

import { useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { FOCUS_RING, NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useStepper } from "../primitives/use-stepper";
import {
  answerText,
  DEFAULT_QUERY,
  INDEX,
  PRODUCTS,
  QUERY_WORDS,
  scoreText,
  search,
  splitWords,
  STEP_TITLES,
  toggleWord,
  verdictFor,
  weight,
  wordLabel,
  type QueryWord,
} from "../models/tiny-index";

// 23.2: build the index in four steps, then ask it. Step 4 makes the seven
// word cards the toggles: a tapped word lights its list, the products in every
// list get a ring, and a bar under each product shows its score, one piece for
// each chosen word it contains (a rare word is a long piece).

const W = 420;
const H = 372;
const PY = [118, 210, 302] as const;
const ROW0 = 78;
const ROW_GAP = 44;
const rowY = (i: number) => ROW0 + i * ROW_GAP;
const CARD = { x: 8, w: 136, h: 52 };
const WORD = { x: 206, w: 206, h: 34 };
const BAR = { x: 16, w: 80, h: 8 };
const MAX_SCORE = 3.01;
const FADE_IN = "animate-in fade-in fill-mode-backwards duration-300 motion-reduce:animate-none";
const GLYPH = 6.6;

/** A point on the cubic curve from a word card to a product card. */
function curvePoint(ry: number, py: number, t: number): [number, number] {
  const p = [[WORD.x, ry], [WORD.x - 30, ry], [CARD.x + CARD.w + 30, py], [CARD.x + CARD.w, py]] as const;
  const u = 1 - t;
  const f = (k: 0 | 1) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k];
  return [f(0), f(1)];
}

const curvePath = (ry: number, py: number) => {
  const x1 = CARD.x + CARD.w;
  return `M${WORD.x} ${ry} C${WORD.x - 30} ${ry} ${x1 + 30} ${py} ${x1} ${py}`;
};

export function TinyIndexCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const stepper = useStepper(STEP_TITLES.length);
  const { active } = stepper;
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [query, setQuery] = useState<QueryWord[]>([...DEFAULT_QUERY]);

  const asking = active === 3;
  const answer = search(asking ? query : []);
  const verdict = verdictFor(active, query);
  const lit = (w: string) => asking && query.includes(w as QueryWord);
  const hints = [
    "Press Next to split each product into words.",
    "Press Next to flip the table: word first, products after.",
    "Press Next, then tap words to ask a question.",
    "Tap words to add or remove them. Bars show each product's score.",
  ];
  const description = `Step ${active + 1} of 4, ${STEP_TITLES[active]}. ${verdict.text}.${asking ? ` ${answerText(query)}` : ""}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hints[active]}
      controls={
        <>
          <BeatButton onClick={stepper.prev}>
            <ChevronLeft aria-hidden className="size-4" />
            Back
          </BeatButton>
          {stepper.isLast ? (
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
        <ol aria-label="Steps" className="grid grid-cols-4 gap-1.5">
          {STEP_TITLES.map((name, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => stepper.go(i)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${name}${done ? ", done" : ""}`}
                  className={cn(
                    "flex h-11 w-full items-center justify-center gap-1 rounded-full border px-1.5 text-[13px] font-semibold transition-colors motion-reduce:transition-none sm:h-10 sm:text-sm",
                    FOCUS_RING,
                    on
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950"
                      : done
                        ? "border-border bg-muted text-foreground hover:bg-muted/70"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {done ? <Check aria-hidden className="size-3 shrink-0" /> : <span aria-hidden className="font-mono text-xs tabular-nums">{i + 1}</span>}
                  <span className="truncate">{name}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div ref={box} className="mt-2">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={description} className="block h-auto w-full select-none">
            <DotGrid width={W} height={H} />

            {/* Step 3 and 4: a curve from every word to each product that holds it. */}
            {active >= 2 ? (
              <g key="links" className={FADE_IN} aria-hidden>
                {QUERY_WORDS.map((word, i) =>
                  INDEX.postings[word].map((id) => (
                    <path
                      key={`${word}-${id}`}
                      d={curvePath(rowY(i), PY[id - 1])}
                      fill="none"
                      strokeLinecap="round"
                      strokeWidth={lit(word) ? 2.5 : 1.5}
                      className={cn(SHAPE_TRANSITION, lit(word) ? TONES.accent.stroke : NEUTRAL.faintStroke)}
                    />
                  ))
                )}
              </g>
            ) : null}

            {/* Step 4: the query reads each lit list. */}
            {asking && !clock.reduced
              ? QUERY_WORDS.flatMap((word, i) =>
                  lit(word)
                    ? INDEX.postings[word].map((id, j) => {
                        const t = (clock.seconds * 0.45 + i * 0.17 + j * 0.5) % 1;
                        const [x, y] = curvePoint(rowY(i), PY[id - 1], t);
                        return <circle key={`dot-${word}-${id}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r={3.4} className={TONES.accent.solidFill} aria-hidden />;
                      })
                    : []
                )
              : null}

            {/* Products. */}
            {PRODUCTS.map((p, n) => {
              const y = PY[n];
              const wide = active === 0;
              const hit = asking && answer.and.includes(p.id);
              const score = answer.scores[n].score;
              const x = wide ? 8 : CARD.x;
              const w = wide ? W - 16 : CARD.w;
              return (
                <g key={p.id}>
                  {hit ? <rect x={x - 5} y={y - CARD.h / 2 - 5} width={w + 10} height={CARD.h + 10} rx={19} className={cn("fill-none", TONES.good.stroke)} strokeWidth={2.5} /> : null}
                  <rect x={x} y={y - CARD.h / 2 + 3} width={w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
                  <rect x={x} y={y - CARD.h / 2} width={w} height={CARD.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
                  <circle cx={x + 20} cy={y} r={11} className="fill-violet-100 dark:fill-violet-500/20" />
                  <text x={x + 20} y={y + 4.5} textAnchor="middle" className="fill-violet-800 text-[12.5px] font-bold dark:fill-violet-200">{p.id}</text>
                  {wide ? (
                    <text x={x + 42} y={y + 5.5} className={cn(NEUTRAL.text, "text-[15px] font-semibold")}>{p.text}</text>
                  ) : (
                    <>
                      <text x={x + 38} y={y - 3} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{p.lines[0]}</text>
                      <text x={x + 38} y={y + 13} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{p.lines[1]}</text>
                    </>
                  )}
                  {asking ? (
                    <g>
                      {score > 0 ? <rect x={BAR.x} y={y + 33} width={BAR.w} height={BAR.h} rx={4} className="fill-muted" /> : null}
                      {(() => {
                        let at = BAR.x;
                        return query
                          .filter((word) => INDEX.postings[word].includes(p.id))
                          .map((word, k) => {
                            const len = (weight(word) / MAX_SCORE) * BAR.w;
                            const seg = <rect key={word} x={at.toFixed(1)} y={y + 33} width={Math.max(2, len - 1.5).toFixed(1)} height={BAR.h} rx={2} className={cn(TONES.accent.solidFill, k % 2 ? "opacity-60" : "")} />;
                            at += len;
                            return seg;
                          });
                      })()}
                      <text x={score > 0 ? BAR.x + BAR.w + 8 : BAR.x} y={y + 41.5} className={cn(score > 0 ? NEUTRAL.text : NEUTRAL.mutedText, "text-[11.5px] font-bold tabular-nums")}>
                        {score > 0 ? scoreText(score) : "no match"}
                      </text>
                    </g>
                  ) : null}
                </g>
              );
            })}

            {/* Step 2: each product, split into words, as beads on a string. */}
            {active === 1 ? (
              <g key="beads" className={FADE_IN}>
                {PRODUCTS.map((p, n) => {
                  const y = PY[n];
                  const words = splitWords(p.text);
                  let x = CARD.x + CARD.w + 16;
                  const x0 = CARD.x + CARD.w;
                  const beads = words.map((s) => {
                    const w = Math.ceil(s.word.length * GLYPH + 14 + (s.stripped ? 8 : 0));
                    const left = x;
                    x += w + 6;
                    return { ...s, left, w };
                  });
                  return (
                    <g key={p.id}>
                      <line x1={x0} x2={beads[beads.length - 1].left + beads[beads.length - 1].w - 8} y1={y} y2={y} strokeWidth={1.75} className={NEUTRAL.faintStroke} />
                      {beads.map((b) => (
                        <g key={b.word}>
                          <rect x={b.left} y={y - 13} width={b.w} height={26} rx={13} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
                          <text x={b.left + b.w / 2} y={y + 4.5} textAnchor="middle" className={cn(TONES.accent.text, "text-[12px] font-semibold")}>
                            {b.word}
                            {b.stripped ? <tspan textDecoration="line-through" className="fill-muted-foreground">s</tspan> : null}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </g>
            ) : null}

            {/* Step 3 and 4: the flipped table, one card for each word. */}
            {active >= 2 ? (
              <g key="table">
                {QUERY_WORDS.map((word, i) => {
                  const y = rowY(i);
                  const on = lit(word);
                  const list = INDEX.postings[word];
                  const face = (
                    <>
                      <rect x={WORD.x} y={y - WORD.h / 2 + 3} width={WORD.w} height={WORD.h} rx={12} className="fill-foreground/[0.06]" />
                      <rect x={WORD.x} y={y - WORD.h / 2} width={WORD.w} height={WORD.h} rx={12} className={NEUTRAL.surface} />
                      <rect x={WORD.x} y={y - WORD.h / 2} width={WORD.w} height={WORD.h} rx={12} strokeWidth={on ? 2.25 : 1.5} className={cn(SHAPE_TRANSITION, on ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn("fill-none", NEUTRAL.line))} />
                      {asking ? (
                        <>
                          <circle cx={WORD.x + 18} cy={y} r={7.5} strokeWidth={1.5} className={cn(SHAPE_TRANSITION, on ? cn(TONES.accent.solidFill, TONES.accent.stroke) : cn("fill-card", NEUTRAL.faintStroke))} />
                          {on ? <Check x={WORD.x + 13.5} y={y - 4.5} width={9} height={9} strokeWidth={3.5} className="stroke-white dark:stroke-blue-950" aria-hidden /> : null}
                        </>
                      ) : null}
                      <text x={WORD.x + 34} y={y + 4.5} className={cn(on ? TONES.accent.text : NEUTRAL.text, "text-[13px] font-semibold")}>{word}</text>
                      {list.map((id, j) => (
                        <g key={id}>
                          <circle cx={WORD.x + 130 + j * 26} cy={y} r={9} strokeWidth={1.5} className={cn(SHAPE_TRANSITION, on ? cn(TONES.accent.solidFill, "stroke-card") : cn("fill-muted", NEUTRAL.line))} />
                          <text x={WORD.x + 130 + j * 26} y={y + 4} textAnchor="middle" className={cn(SHAPE_TRANSITION, on ? "fill-white dark:fill-blue-950" : NEUTRAL.text, "text-[11.5px] font-bold")}>{id}</text>
                        </g>
                      ))}
                    </>
                  );
                  const delay = { animationDelay: active === 2 ? `${i * 60}ms` : "0ms" };
                  return asking ? (
                    <SvgButton
                      key={word}
                      x={WORD.x}
                      y={y - 22}
                      width={WORD.w}
                      height={44}
                      rx={14}
                      label={wordLabel(word)}
                      pressed={on}
                      onPress={() => setQuery((q) => toggleWord(q, word))}
                    >
                      {face}
                    </SvgButton>
                  ) : (
                    <g key={word} className={FADE_IN} style={delay}>
                      {face}
                    </g>
                  );
                })}
              </g>
            ) : null}

            <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          </svg>
        </div>
        <p aria-live="polite" className="sr-only">
          {asking ? answerText(query) : `Step ${active + 1}, ${STEP_TITLES[active]}. ${verdict.text}.`}
        </p>
      </div>
    </BeatFrame>
  );
}
