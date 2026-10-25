"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  DEFAULT_HALF_LIFE,
  HALF_LIVES,
  hoursText,
  likesText,
  POSTS,
  rankPosts,
  rankValueText,
  rankVerdict,
  score2,
  type Ranked,
} from "../models/rank-score";

const W = 420;
const FORMULA = { y: 48, h: 38 };
const STACK = { x: 8, y: 98, w: 404, h: 44, gap: 4 };
const RAIL = { x0: 34, x1: 386, y: 386 };
const H = RAIL.y + 40;
/** The score bar: its full length stands for a score of 6. */
const BAR = { x: 258, w: 96, max: 6 };
const CHIP_W = 84;
const OP_W = 22;

const slotY = (rank: number) => STACK.y + rank * (STACK.h + STACK.gap);

/** 21.4: drag the half-life and watch five posts change places. */
export function RankPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const { freeze, unfreeze } = useBeatClock(box);
  const [half, setHalf] = useState<number>(DEFAULT_HALF_LIFE);
  const [selected, setSelected] = useState<string>("dina");

  const ranked = rankPosts(half);
  const byId = new Map(ranked.map((p) => [p.id, p]));
  const verdict = rankVerdict(ranked[0]);
  const sel = byId.get(selected) ?? ranked[0];
  const valueText = rankValueText(half, ranked);
  const grab = (g: boolean) => (g ? freeze() : unfreeze());

  const pick = (e: KeyboardEvent, id: string) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setSelected(id);
  };

  // The formula for the tapped post: three factors multiplied into a score.
  const formulaX0 = (W - (4 * CHIP_W + 3 * OP_W)) / 2;
  const chips: { label: string; value: string }[] = [
    { label: "closeness", value: sel.closeness.toFixed(2) },
    { label: "popularity", value: sel.engagement.toFixed(2) },
    { label: "freshness", value: sel.freshness.toFixed(2) },
    { label: "score", value: score2(sel.score) },
  ];
  const ops = ["×", "×", "="];

  const description = `Five posts ranked by closeness times popularity times freshness. Half-life ${hoursText(half)}. ${ranked.map((p, i) => `${i + 1}: ${p.name}, score ${score2(p.score)}`).join(". ")}. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>half-life</b> and watch the order change. Tap a post to see its score.</>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The formula for the tapped post. */}
          <g aria-hidden>
            {chips.map((c, i) => {
              const x = formulaX0 + i * (CHIP_W + OP_W);
              const last = i === chips.length - 1;
              return (
                <g key={c.label}>
                  <rect x={x} y={FORMULA.y} width={CHIP_W} height={FORMULA.h} rx={12} className={NEUTRAL.surface} />
                  <rect x={x} y={FORMULA.y} width={CHIP_W} height={FORMULA.h} rx={12} strokeWidth={last ? 2 : 1.5} className={cn(last ? cn(TONES.accent.softFill, TONES.accent.stroke) : cn(NEUTRAL.surface, NEUTRAL.line))} />
                  <text x={x + CHIP_W / 2} y={FORMULA.y + 15} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                    {c.label}
                  </text>
                  <text x={x + CHIP_W / 2} y={FORMULA.y + 31} textAnchor="middle" className={cn(last ? TONES.accent.text : NEUTRAL.text, "text-[14.5px] font-bold tabular-nums")}>
                    {c.value}
                  </text>
                  {i < ops.length ? (
                    <text x={x + CHIP_W + OP_W / 2} y={FORMULA.y + 25} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[16px] font-semibold")}>
                      {ops[i]}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          {/* The five posts. They stay in the same place in the markup and slide to their rank. */}
          {POSTS.map((post) => {
            const p = byId.get(post.id) as Ranked;
            const isSel = sel.id === p.id;
            const yc = STACK.h / 2;
            const barW = Math.max(0, Math.min(1, p.score / BAR.max)) * BAR.w;
            const barWr = Math.round(barW * 100) / 100;
            return (
              <g
                key={p.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${p.name}, rank ${p.rank + 1}, score ${score2(p.score)}`}
                onClick={() => setSelected(p.id)}
                onKeyDown={(e) => pick(e, p.id)}
                style={{ transform: `translateY(${slotY(p.rank)}px)` }}
                className="group cursor-pointer outline-none transition-transform duration-300 motion-reduce:transition-none"
              >
                <rect x={STACK.x} y={3} width={STACK.w} height={STACK.h} rx={13} className="fill-foreground/[0.06]" />
                <rect x={STACK.x} y={0} width={STACK.w} height={STACK.h} rx={13} strokeWidth={isSel ? 2 : 1.5} className={cn(NEUTRAL.surface, isSel ? TONES.accent.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                {isSel ? <rect x={STACK.x} y={0} width={STACK.w} height={STACK.h} rx={13} className={TONES.accent.softFill} /> : null}
                <rect x={STACK.x - 3} y={-3} width={STACK.w + 6} height={STACK.h + 6} rx={16} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
                <circle cx={STACK.x + 20} cy={yc} r={11} className={p.rank === 0 ? TONES.accent.solidFill : "fill-muted"} />
                <text x={STACK.x + 20} y={yc + 4.5} textAnchor="middle" className={cn(p.rank === 0 ? "fill-white dark:fill-blue-950" : NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>
                  {p.rank + 1}
                </text>
                <text x={STACK.x + 40} y={yc - 3} className={cn(NEUTRAL.text, "text-[12.5px] font-bold")}>
                  {p.name}
                  {p.role ? <tspan className={cn(NEUTRAL.mutedText, "font-medium")}>{`, ${p.role}`}</tspan> : null}
                </text>
                <text x={STACK.x + 40} y={yc + 13} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                  {`${likesText(p.likes)}, ${p.ageHours} h old`}
                </text>
                <rect x={STACK.x + 172} y={yc - 10} width={68} height={20} rx={10} className="fill-muted" />
                <text x={STACK.x + 206} y={yc + 4} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>
                  {`close ${p.closeness.toFixed(1)}`}
                </text>
                <rect x={BAR.x} y={yc - 5} width={BAR.w} height={10} rx={5} className="fill-muted" />
                <rect x={BAR.x} y={yc - 5} width={barWr} height={10} rx={5} style={{ width: barWr }} className={cn(p.rank === 0 ? TONES.accent.solidFill : NEUTRAL.doneFill, "transition-[width,fill] duration-300 motion-reduce:transition-none")} />
                <text x={STACK.x + STACK.w - 10} y={yc + 5} textAnchor="end" className={cn(NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>
                  {score2(p.score)}
                </text>
              </g>
            );
          })}

          {/* The half-life rail. */}
          <text x={RAIL.x0 - 14} y={RAIL.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            {`Half-life: age halves a post's value every ${hoursText(half)}`}
          </text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={HALF_LIVES.map((h) => ({ value: h, label: `${h} h` }))}
            value={half}
            onChange={setHalf}
            ariaLabel="Half-life in hours"
            valueText={valueText}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <ol className="sr-only" aria-label="Posts in rank order">
          {ranked.map((p) => (
            <li key={p.id}>{`${p.name}: score ${score2(p.score)}`}</li>
          ))}
        </ol>
      </div>
    </BeatFrame>
  );
}
