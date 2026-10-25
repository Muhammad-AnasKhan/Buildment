"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "./beat-frame";
import { BeatSegmented } from "./beat-segmented";
import { useReducedMotion } from "./beat-parts";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { NEUTRAL, TONES } from "./tones";
import { draw, shares, startSampler, topDrawn, totalDraws, type SamplerContext, type SamplerState, type WordSamplerConfig } from "../models/word-sampler";
import { wrapWords } from "../models/sorter";

// A playable word sampler. The prompt has a blank; each word a model might put
// there has a bar showing its share. "Ask once" draws one word in proportion to
// the bars and drops it into the blank; "Ask many times" draws a lot at once so
// the common word shows up most of the time. A second prompt (more context)
// reshapes the bars. The numbers are illustrative.

const W = 420;
const SIDE = 12;
const ROW_H = 38;
const TRACK = { x: 134, w: 160 };
const PCT_X = 304;
const TALLY_X = 404;
const PROMPT_CHARS = 36;
const FLY_MS = 450;
const BLANK = "___";
const HOLD = "\u0001";
const THRESHOLD = 10;

type Flight = { key: number; ctx: string; word: string; prev: string | null; row: number; landed: boolean };
type Spot = { x: number; y: number };

/** The prompt wrapped to lines, with room reserved in the blank for the longest word so the lines never reflow. */
function promptLines(context: SamplerContext) {
  const longest = Math.max(3, ...context.words.map((w) => w.word.length));
  return wrapWords(context.prompt.replace(BLANK, HOLD.repeat(longest)), PROMPT_CHARS).map((l) => l.replace(new RegExp(`${HOLD}+`), HOLD));
}

export function WordSampler({ title, limits, contexts, manyCount, hint, seed }: WordSamplerConfig & { title: string; limits: string }) {
  const config: WordSamplerConfig = { contexts, manyCount, hint, seed };
  const [state, setState] = useState<SamplerState>(() => startSampler(config));
  const [ctxId, setCtxId] = useState(contexts[0].id);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [said, setSaid] = useState("");
  const blank = useRef<SVGTSpanElement>(null);
  const reduced = useReducedMotion();

  const ctx = contexts.find((c) => c.id === ctxId) ?? contexts[0];
  const share = shares(ctx);
  const total = totalDraws(state, ctx.id);
  const top = topDrawn(state, ctx);
  const last = state.last[ctx.id] ?? null;
  const midFlight = flight !== null && flight.ctx === ctx.id && !flight.landed;
  const blankWord = midFlight ? flight.prev : last;

  // The prompt card and the rows are sized for the largest context, so switching tabs never moves the picture.
  const maxLines = Math.max(...contexts.map((c) => promptLines(c).length));
  const maxRows = Math.max(...contexts.map((c) => c.words.length));
  const cardH = 22 + maxLines * 25;
  const headY = 10 + cardH + 24;
  const rowsTop = headY + 10;
  const rowsEnd = rowsTop + maxRows * ROW_H;
  const bannerY = rowsEnd + 4;
  const H = bannerY + 30 + 28;
  const lines = promptLines(ctx);

  // Where the blank is on screen, so the drawn word can fly there.
  useEffect(() => {
    try {
      const el = blank.current;
      const n = el?.getNumberOfChars() ?? 0;
      if (!el || n === 0) return;
      const a = el.getStartPositionOfChar(0);
      const b = el.getEndPositionOfChar(n - 1);
      setSpot({ x: (a.x + b.x) / 2, y: a.y - 6 });
    } catch {
      setSpot(null);
    }
  }, [ctx.id, blankWord]);

  useEffect(() => {
    if (!flight || flight.landed) return;
    const t = setTimeout(() => setFlight((f) => (f && f.key === flight.key ? { ...f, landed: true } : f)), FLY_MS);
    return () => clearTimeout(t);
  }, [flight]);

  const ask = (n: number) => {
    const next = draw(state, config, ctx.id, n);
    setState(next);
    const word = next.last[ctx.id];
    setSaid(`Asked ${n === 1 ? "once" : `${n} times`}. ${word ?? "Nothing"} came out last. ${(topDrawn(next, ctx)?.word ?? "")} leads with ${topDrawn(next, ctx)?.count ?? 0} of ${totalDraws(next, ctx.id)}.`);
    if (!word || reduced) setFlight(null);
    else setFlight({ key: (flight?.key ?? 0) + 1, ctx: ctx.id, word, prev: last, row: Math.max(0, ctx.words.findIndex((w) => w.word === word)), landed: false });
  };

  const rowY = (i: number) => rowsTop + i * ROW_H;
  const showVerdict = total >= THRESHOLD && top !== null;
  const picture = `${ctx.prompt.replace(BLANK, "(blank)")} ${ctx.words.map((w) => `${w.word} ${Math.round(share[w.word] * 100)} percent, drawn ${state.tally[ctx.id]?.[w.word] ?? 0}`).join("; ")}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hint}
      controls={
        <>
          {contexts.length > 1 ? (
            <BeatSegmented
              label="Prompt"
              options={contexts.map((c) => ({ id: c.id, label: c.label }))}
              value={ctx.id}
              onChange={(id) => {
                setCtxId(id);
                setFlight(null);
              }}
            />
          ) : null}
          <BeatButton onClick={() => ask(1)}>Ask once</BeatButton>
          <BeatButton onClick={() => ask(manyCount)}>{`Ask ${manyCount} times`}</BeatButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={picture} className="block h-auto w-full select-none">
        <DotGrid width={W} height={H} />

        {/* The prompt, with its blank. */}
        <rect x={SIDE} y={13} width={W - 2 * SIDE} height={cardH} rx={16} className="fill-foreground/[0.06]" />
        <rect x={SIDE} y={10} width={W - 2 * SIDE} height={cardH} rx={16} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
        {lines.map((line, i) => {
          const parts = line.split(HOLD);
          return (
            <text key={i} x={SIDE + 16} y={10 + 33 + i * 25} className={cn(NEUTRAL.text, "text-[16px] font-bold")}>
              {parts[0]}
              {parts.length > 1 ? (
                <tspan ref={blank} className={cn(TONES.accent.text, "underline underline-offset-4")}>
                  {blankWord ?? "_____"}
                </tspan>
              ) : null}
              {parts.length > 1 ? parts.slice(1).join("") : null}
            </text>
          );
        })}

        {/* The bars: share of each word, and how often it has been drawn. */}
        <text x={SIDE + 4} y={headY} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>Word</text>
        <text x={TRACK.x} y={headY} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>Share of the odds</text>
        <text x={TALLY_X} y={headY} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold")}>Drawn</text>
        {ctx.words.map((w, i) => {
          const y = rowY(i);
          const cy = y + ROW_H / 2;
          const lit = last === w.word && total > 0;
          const count = state.tally[ctx.id]?.[w.word] ?? 0;
          return (
            <g key={i}>
              <rect x={SIDE} y={y + 2} width={W - 2 * SIDE} height={ROW_H - 4} rx={12} className={cn(lit ? TONES.accent.softFill : "fill-transparent", "transition-colors duration-300 motion-reduce:transition-none")} />
              <text x={SIDE + 4} y={cy + 4.5} className={cn(NEUTRAL.text, "text-[13.5px] font-bold")}>{w.word}</text>
              <rect x={TRACK.x} y={cy - 8} width={TRACK.w} height={16} rx={8} className="fill-muted" />
              <rect
                x={TRACK.x}
                y={cy - 8}
                width={TRACK.w}
                height={16}
                rx={3}
                className={cn(TONES.accent.solidFill, "[transform-box:fill-box] origin-left transition-transform duration-500 ease-out motion-reduce:transition-none")}
                style={{ transform: `scaleX(${Math.max(0.01, share[w.word] ?? 0)})` }}
              />
              <text x={PCT_X} y={cy + 4.5} className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{`${Math.round((share[w.word] ?? 0) * 100)}%`}</text>
              <text x={TALLY_X} y={cy + 4.5} textAnchor="end" className={cn(lit ? TONES.accent.text : NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>{count}</text>
            </g>
          );
        })}

        <g aria-hidden>
          <VerdictBanner width={W} y={bannerY} text={top ? `${top.word} came out ${top.count} of ${top.total} times` : "Ask to see the draws"} tone="accent" opacity={showVerdict ? 1 : 0} />
        </g>
        <text x={W / 2} y={H - 10} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>Illustrative numbers, not measured</text>

        {/* The word that was just drawn, flying from its bar to the blank. */}
        {flight && !flight.landed && flight.ctx === ctx.id && !reduced ? <Fly key={flight.key} word={flight.word} from={{ x: SIDE + 44, y: rowY(flight.row) + ROW_H / 2 }} to={spot ?? { x: W / 2, y: 30 }} /> : null}
      </svg>
      <p className="sr-only" aria-live="polite">{said}{showVerdict && top ? ` ${top.word} came out ${top.count} of ${top.total} times.` : ""}</p>
    </BeatFrame>
  );
}

/** A chip that starts on a bar and glides to the blank, then fades as the blank takes the word. */
function Fly({ word, from, to }: { word: string; from: Spot; to: Spot }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    let b = 0;
    const a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setGo(true));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, []);
  const p = go ? to : from;
  const w = Math.ceil(word.length * 8.2 + 20);
  return (
    <g aria-hidden className="pointer-events-none" style={{ transform: `translate(${p.x}px, ${p.y}px)`, opacity: go ? 0.15 : 1, transition: `transform ${FLY_MS}ms ease-in-out, opacity 150ms ease-in ${FLY_MS - 150}ms` }}>
      <rect x={-w / 2} y={-12} width={w} height={24} rx={12} className={TONES.accent.solidFill} />
      <text x={0} y={4.5} textAnchor="middle" className="fill-white text-[13px] font-bold dark:fill-blue-950">{word}</text>
    </g>
  );
}
