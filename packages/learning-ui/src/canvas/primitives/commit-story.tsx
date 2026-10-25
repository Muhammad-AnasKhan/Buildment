"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "./beat-frame";
import { BeatSegmented } from "./beat-segmented";
import { DotGrid, VerdictBanner } from "./svg-parts";
import { NEUTRAL, TONES } from "./tones";
import { commitLines, dotPositions, dotRadius, historyStats, type CommitStoryConfig } from "../models/commit-story";
import { wrapWords } from "../models/sorter";

// A playable commit history: two tabs show the same work as two histories.
// Each commit is a dot on a lane of days, bigger when more lines changed. Tap a
// dot, or use the arrow keys, to read the commit like a reviewer would. Switching
// tabs slides the dots into their new places.

const W = 420;
const LEFT = 36;
const RIGHT = 384;
const LANE_Y = 112;
const AXIS_Y = 150;
const CARD = { x: 24, y: 184, w: 372, h: 160 };
const H = CARD.y + CARD.h + 12;
const HIT_R = 26;
const BASE_R = 10;
const MSG_CHARS = 40;
const NOTE_CHARS = 46;
const NOSCALE = "[vector-effect:non-scaling-stroke]";
const MOVE = "transition-transform duration-500 ease-out motion-reduce:transition-none";

const num = (n: number) => n.toLocaleString("en-US");
const plural = (n: number, one: string, many: string) => `${num(n)} ${n === 1 ? one : many}`;

export function CommitStory({ title, limits, histories, hint }: CommitStoryConfig & { title: string; limits: string }) {
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const focusAfter = useRef<number | null>(null);

  const history = histories[tab];
  const commits = history.commits;
  const stats = historyStats(history);
  const days = histories.flatMap((h) => h.commits.map((c) => c.day));
  const dayMin = days.length ? Math.min(...days) : 1;
  const dayMax = days.length ? Math.max(...days) : 1;
  const xs = dotPositions(commits, dayMin, dayMax, LEFT, RIGHT);
  const slots = Math.max(...histories.map((h) => h.commits.length), 1);
  const at = Math.min(sel, commits.length - 1);
  const commit = commits[at];
  const t = TONES[history.tone];

  useEffect(() => {
    if (focusAfter.current === null) return;
    svg.current?.querySelector<SVGGElement>(`[data-dot="${focusAfter.current}"]`)?.focus();
    focusAfter.current = null;
  }, [sel]);

  const go = (i: number, focus = false) => {
    if (focus) focusAfter.current = i;
    setSel(i);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const last = commits.length - 1;
    const target = e.key === "ArrowRight" || e.key === "ArrowDown" ? Math.min(last, i + 1) : e.key === "ArrowLeft" || e.key === "ArrowUp" ? Math.max(0, i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : e.key === "Enter" || e.key === " " ? i : -1;
    if (target < 0) return;
    e.preventDefault();
    go(target, true);
  };

  const statsText = `${plural(stats.commits, "commit", "commits")}, ${plural(stats.totalLines, "line", "lines")}, largest ${num(stats.largestLines)}`;
  const msg = wrapWords(commit.message, MSG_CHARS).slice(0, 2);
  const note = wrapWords(commit.note, NOTE_CHARS).slice(0, 3);
  const detail = `+${num(commit.added)} added, -${num(commit.removed)} removed, ${plural(commit.files, "file", "files")}`;
  const live = `${history.label}: ${history.verdict}. ${statsText}. Commit ${at + 1} of ${commits.length}, day ${commit.day}: ${commit.message}. ${detail}. ${commit.note}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={hint}
      controls={
        <BeatSegmented
          label="View"
          options={histories.map((h) => ({ id: h.id, label: h.label }))}
          value={history.id}
          onChange={(id) => {
            setTab(Math.max(0, histories.findIndex((h) => h.id === id)));
            setSel(0);
          }}
        />
      }
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${history.label}: ${history.verdict}. ${statsText}.`} className="block h-auto w-full select-none">
        <DotGrid width={W} height={H} />
        <VerdictBanner width={W} text={history.verdict} tone={history.tone} />
        <text x={W / 2} y={66} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold tabular-nums")}>{statsText}</text>

        {/* The lane of days: a line with the dots on it, and a day axis under it. */}
        <line x1={LEFT - 14} y1={LANE_Y} x2={RIGHT + 14} y2={LANE_Y} strokeWidth={2} className={NEUTRAL.line} />
        <line x1={LEFT - 14} y1={AXIS_Y} x2={RIGHT + 14} y2={AXIS_Y} strokeWidth={1.5} className={NEUTRAL.line} />
        {dayMax - dayMin <= 30
          ? Array.from({ length: dayMax - dayMin + 1 }, (_, i) => {
              const x = dayMax === dayMin ? (LEFT + RIGHT) / 2 : LEFT + (i / (dayMax - dayMin)) * (RIGHT - LEFT);
              return <line key={i} x1={x} y1={AXIS_Y} x2={x} y2={AXIS_Y + 5} strokeWidth={1.5} className={NEUTRAL.line} />;
            })
          : null}
        <text x={dayMax === dayMin ? W / 2 : LEFT} y={AXIS_Y + 23} textAnchor={dayMax === dayMin ? "middle" : "start"} className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>{`Day ${dayMin}`}</text>
        {dayMax !== dayMin ? <text x={RIGHT} y={AXIS_Y + 23} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] font-medium")}>{`Day ${dayMax}`}</text> : null}

        {Array.from({ length: slots }, (_, i) => {
          const c = commits[i];
          const r = c ? dotRadius(commitLines(c)) : 0;
          const k = r / BASE_R;
          const on = c !== undefined && i === at;
          const x = c ? xs[i] : W / 2;
          const common = { style: { transform: `translate(${x}px, ${LANE_Y}px)` }, className: cn(MOVE, c && "group cursor-pointer outline-none") };
          if (!c) {
            return (
              <g key={i} aria-hidden {...common}>
                <g className={MOVE} style={{ transform: "scale(0)" }}>
                  <circle r={BASE_R} className={cn(TONES[history.tone].softFill, t.stroke)} />
                </g>
              </g>
            );
          }
          return (
            <g
              key={i}
              {...common}
              data-dot={i}
              role="button"
              tabIndex={on ? 0 : -1}
              aria-pressed={on}
              aria-label={`Commit ${i + 1} of ${commits.length}, day ${c.day}: ${c.message}`}
              onClick={() => go(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <circle r={HIT_R} className="fill-transparent" />
              <g className={MOVE} style={{ transform: `scale(${k})` }}>
                <circle r={BASE_R} strokeWidth={2} className={cn(NOSCALE, "transition-colors duration-200 motion-reduce:transition-none", on ? t.solidFill : t.softFill, t.stroke)} />
                {on ? <circle r={BASE_R + 5 / k} strokeWidth={2.5} className={cn(NOSCALE, "fill-none", TONES.accent.stroke)} /> : null}
                <circle r={BASE_R + 9 / k} strokeWidth={2.5} className={cn(NOSCALE, "fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} />
              </g>
            </g>
          );
        })}

        {/* The selected commit, as a reviewer would read it. */}
        <rect x={CARD.x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={16} className="fill-foreground/[0.06]" />
        <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
        <text x={CARD.x + 16} y={CARD.y + 23} className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold uppercase tracking-wide tabular-nums")}>{`Commit ${at + 1} of ${commits.length}`}</text>
        <text x={CARD.x + CARD.w - 16} y={CARD.y + 23} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[13px] font-semibold tabular-nums")}>{`Day ${commit.day}`}</text>
        {msg.map((line, i) => (
          <text key={i} x={CARD.x + 16} y={CARD.y + 46 + i * 18} className={cn(NEUTRAL.text, "font-mono text-[13px] font-semibold")}>{line}</text>
        ))}
        <text x={CARD.x + 16} y={CARD.y + 46 + msg.length * 18 + 8} className="text-[13px] font-bold tabular-nums">
          <tspan className={TONES.good.text}>{`+${num(commit.added)}`}</tspan>
          <tspan dx={14} className={TONES.bad.text}>{`-${num(commit.removed)}`}</tspan>
          <tspan dx={14} className={NEUTRAL.mutedText}>{plural(commit.files, "file", "files")}</tspan>
        </text>
        {note.map((line, i) => (
          <text key={`n${i}`} x={CARD.x + 16} y={CARD.y + 46 + msg.length * 18 + 30 + i * 18} className={cn(NEUTRAL.text, "text-[13.5px] font-medium")}>{line}</text>
        ))}
      </svg>
      <p className="sr-only" aria-live="polite">{live}</p>
    </BeatFrame>
  );
}
