"use client";

import { useRef, useState } from "react";
import { Delete, RotateCcw, Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { keyName, KEYS, nextKeys, press, trieVerdict, walk, walkSentence, type Key } from "../models/trie-walk";

// 23.3: type letters and walk down the trie. The typed text is also the path:
// each letter is a node on a row, the next letters are drawn under the node
// the walk stands on, and the three queries stored on that node are the answer.
// Nothing below the node is read, which the counter says in numbers.

const W = 420;
const H = 420;
const NODE_R = 10;
const CHAIN_Y = 118;
const CHILD_Y = 160;
const nodeX = (i: number) => 21 + i * 26;
const BOX = { x: 8, y: 46, w: 404, h: 36 };
const CARD = { x: 8, y: 180, w: 404, h: 142 };
const ROWS_Y = 218;
const ROW_GAP = 28;
const BAR = { x: 206, w: 128 };
const TOP_COUNT = 9200;
const KEY = { w: 46, h: 38, pitch: 56, x0: 19, y: [346, 390] as const };
const FADE_IN = "animate-in fade-in duration-200 motion-reduce:animate-none";

/** The space character drawn as a small open box, so no font has to carry it. */
function SpaceMark({ x, y, className }: { x: number; y: number; className: string }) {
  return <path d={`M${x - 5} ${y - 2.5} v5 h10 v-5`} fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden />;
}

export function TrieWalkCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [typed, setTyped] = useState("");

  const w = walk(typed);
  const verdict = trieVerdict(w);
  const next = nextKeys(w);
  const here = w.path.length - 1;
  const cx = nodeX(here);
  const pulse = clock.reduced ? 0 : Math.sin(clock.seconds * 3) * 1.2;
  const sentence = walkSentence(w);
  const prefixText = w.node ? (w.node.prefix.length === 0 ? "start" : `“${w.node.prefix}”`) : `“${typed}”`;

  // The next letters fan out under the current node, kept inside the picture.
  const kids = w.children;
  const span = (kids.length - 1) * 30;
  const kidStart = Math.max(21, Math.min(399 - span, cx - span / 2));

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the <b>lit letters</b> to type and walk down. Tap an unlit one to see an empty answer.</>}
      controls={
        <BeatButton onClick={() => setTyped("")}>
          <RotateCcw aria-hidden className="size-4" />
          Reset
        </BeatButton>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Trie walk. ${sentence} ${verdict.text}.`} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* The search box. */}
          <rect x={BOX.x} y={BOX.y + 3} width={BOX.w} height={BOX.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <Search x={BOX.x + 12} y={BOX.y + 10} width={16} height={16} strokeWidth={2} className={cn("fill-none", NEUTRAL.doneStroke)} aria-hidden />
          <text x={BOX.x + 38} y={BOX.y + 24} xmlSpace="preserve" style={{ whiteSpace: "pre" }} className={cn(typed ? NEUTRAL.text : NEUTRAL.mutedText, "text-[16px] font-semibold")}>
            {typed || "Search Dalil"}
          </text>

          {/* The path: root, then one node for each letter walked. */}
          <text x={nodeX(0)} y={100} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>start</text>
          {w.path.slice(1).map((n, i) => (
            <line key={`edge-${n.prefix}`} x1={nodeX(i) + NODE_R} x2={nodeX(i + 1) - NODE_R} y1={CHAIN_Y} y2={CHAIN_Y} strokeWidth={2.5} className={cn(TONES.accent.stroke, FADE_IN)} />
          ))}
          {w.dead !== null ? (
            <line x1={nodeX(here) + NODE_R} x2={nodeX(here + 1) - NODE_R} y1={CHAIN_Y} y2={CHAIN_Y} strokeWidth={2} strokeDasharray="3 3" className={TONES.warn.stroke} />
          ) : null}

          {/* The next letters under the node the walk stands on. */}
          {kids.map((ch, i) => {
            const x = kidStart + i * 30;
            return (
              <g key={`kid-${w.node?.prefix}-${ch}`} className={FADE_IN}>
                <line x1={cx} y1={CHAIN_Y + NODE_R + 4} x2={x} y2={CHILD_Y - NODE_R} strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.faintStroke} />
                <circle cx={x} cy={CHILD_Y} r={NODE_R} strokeWidth={1.5} strokeDasharray="3 3" className={cn("fill-card", NEUTRAL.faintStroke)} />
                {ch === " " ? <SpaceMark x={x} y={CHILD_Y} className={NEUTRAL.doneStroke} /> : <text x={x} y={CHILD_Y + 4.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-bold")}>{ch}</text>}
              </g>
            );
          })}
          {w.node && kids.length === 0 ? (
            <text x={Math.min(cx - 10, 250)} y={CHILD_Y + 4} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>End of a query: no letter below</text>
          ) : null}
          {w.dead !== null ? (
            <text x={Math.min(nodeX(here + 1) - 10, 200)} y={CHILD_Y + 4} className={cn(TONES.warn.text, "text-[11.5px] font-semibold")}>
              {`No node for ${w.dead === " " ? "a space" : `“${w.dead}”`}: the walk stops`}
            </text>
          ) : null}

          {/* Nodes sit above their edges. */}
          {w.path.map((n, i) => {
            const current = w.node === n;
            const letter = n.prefix.slice(-1);
            return (
              <g key={`node-${n.prefix}`} className={i > 0 ? FADE_IN : undefined}>
                {current ? <circle cx={nodeX(i)} cy={CHAIN_Y} r={NODE_R + 5 + pulse} strokeWidth={2.5} className={cn("fill-none", TONES.accent.stroke)} /> : null}
                <circle cx={nodeX(i)} cy={CHAIN_Y} r={NODE_R} strokeWidth={2} className={cn(SHAPE_TRANSITION, current ? cn(TONES.accent.solidFill, "stroke-card") : cn(TONES.accent.softFill, TONES.accent.stroke))} />
                {i === 0 ? (
                  <circle cx={nodeX(0)} cy={CHAIN_Y} r={3.5} className={current ? "fill-white dark:fill-blue-950" : TONES.accent.solidFill} />
                ) : letter === " " ? (
                  <SpaceMark x={nodeX(i)} y={CHAIN_Y} className={current ? "stroke-white dark:stroke-blue-950" : TONES.accent.stroke} />
                ) : (
                  <text x={nodeX(i)} y={CHAIN_Y + 4.5} textAnchor="middle" className={cn(current ? "fill-white dark:fill-blue-950" : TONES.accent.text, "text-[12.5px] font-bold")}>{letter}</text>
                )}
              </g>
            );
          })}
          {w.dead !== null ? (
            <g className={FADE_IN}>
              <circle cx={nodeX(here + 1)} cy={CHAIN_Y} r={NODE_R} strokeWidth={2} strokeDasharray="3 3" className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              {w.dead === " " ? <SpaceMark x={nodeX(here + 1)} y={CHAIN_Y} className={TONES.warn.stroke} /> : <text x={nodeX(here + 1)} y={CHAIN_Y + 4.5} textAnchor="middle" className={cn(TONES.warn.text, "text-[12.5px] font-bold")}>{w.dead}</text>}
            </g>
          ) : null}

          {/* The answer stored on the node. */}
          <rect x={CARD.x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={14} className="fill-foreground/[0.06]" />
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={CARD.x + 14} y={CARD.y + 22} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>Best 3 stored on node</text>
          <text x={CARD.x + CARD.w - 14} y={CARD.y + 22} textAnchor="end" style={{ whiteSpace: "pre" }} className={cn(w.node ? TONES.accent.text : TONES.warn.text, "text-[13px] font-bold")}>{prefixText}</text>
          <g key={`answer-${typed}`} className={FADE_IN}>
            {w.answer.map((entry, i) => {
              const y = ROWS_Y + i * ROW_GAP;
              return (
                <g key={entry[0]}>
                  <circle cx={CARD.x + 24} cy={y} r={9} className="fill-muted" />
                  <text x={CARD.x + 24} y={y + 4} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-bold")}>{i + 1}</text>
                  <text x={CARD.x + 44} y={y + 5} className={cn(NEUTRAL.text, "text-[14px] font-semibold")}>{entry[0]}</text>
                  <rect x={BAR.x} y={y - 4} width={BAR.w} height={8} rx={4} className="fill-muted" />
                  <rect x={BAR.x} y={y - 4} width={Math.max(6, (entry[1] / TOP_COUNT) * BAR.w).toFixed(1)} height={8} rx={4} className={TONES.accent.solidFill} />
                  <text x={CARD.x + CARD.w - 14} y={y + 5} textAnchor="end" className={cn(NEUTRAL.text, "text-[13px] font-bold tabular-nums")}>{entry[1]}</text>
                </g>
              );
            })}
            {w.answer.length === 0 ? (
              <text x={CARD.x + CARD.w / 2} y={ROWS_Y + ROW_GAP + 5} textAnchor="middle" className={cn(w.dead !== null ? TONES.warn.text : NEUTRAL.mutedText, "text-[13px] font-semibold")}>
                {w.dead !== null ? "Empty answer: nothing starts with this" : "Type a letter to fill this card"}
              </text>
            ) : null}
          </g>
          <line x1={CARD.x + 14} x2={CARD.x + CARD.w - 14} y1={CARD.y + CARD.h - 26} y2={CARD.y + CARD.h - 26} strokeWidth={1} className={NEUTRAL.line} />
          <text x={CARD.x + 14} y={CARD.y + CARD.h - 8} className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>
            {`Steps: ${w.steps} ${w.steps === 1 ? "letter" : "letters"}`}
          </text>
          <text x={CARD.x + CARD.w - 14} y={CARD.y + CARD.h - 8} textAnchor="end" className={cn(NEUTRAL.text, "text-[12px] font-semibold tabular-nums")}>
            {`Queries read below the node: ${w.readBelow}`}
          </text>

          {/* The keys. */}
          {KEYS.map((key, n) => {
            const row = n < 7 ? 0 : 1;
            const col = n % 7;
            const x = KEY.x0 + col * KEY.pitch;
            const y = KEY.y[row];
            const lit = key !== "back" && next.has(key);
            const hint = key === "back" && w.dead !== null;
            return (
              <SvgButton key={key} x={x} y={y - 22} width={KEY.w} height={44} rx={14} label={keyLabel(key, lit)} onPress={() => setTyped((t) => press(t, key as Key))}>
                <rect x={x} y={y - KEY.h / 2 + 2} width={KEY.w} height={KEY.h} rx={11} className="fill-foreground/[0.06]" />
                <rect x={x} y={y - KEY.h / 2} width={KEY.w} height={KEY.h} rx={11} strokeWidth={lit || hint ? 2 : 1.5} className={cn(SHAPE_TRANSITION, "group-hover:fill-muted", lit || hint ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line))} />
                {key === "back" ? (
                  <Delete x={x + KEY.w / 2 - 10} y={y - 10} width={20} height={20} strokeWidth={2} className={cn("fill-none", hint ? TONES.accent.stroke : NEUTRAL.doneStroke)} aria-hidden />
                ) : key === " " ? (
                  <SpaceMark x={x + KEY.w / 2} y={y} className={lit ? TONES.accent.stroke : NEUTRAL.doneStroke} />
                ) : (
                  <text x={x + KEY.w / 2} y={y + 5.5} textAnchor="middle" className={cn(lit ? TONES.accent.text : NEUTRAL.mutedText, "text-[16px] font-bold")}>{key}</text>
                )}
              </SvgButton>
            );
          })}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p aria-live="polite" className="sr-only">
          {sentence}
        </p>
      </div>
    </BeatFrame>
  );
}

function keyLabel(key: Key, lit: boolean): string {
  if (key === "back") return "Backspace, remove the last letter";
  return `Type ${keyName(key)}${lit ? ", leads on from this node" : ""}`;
}
