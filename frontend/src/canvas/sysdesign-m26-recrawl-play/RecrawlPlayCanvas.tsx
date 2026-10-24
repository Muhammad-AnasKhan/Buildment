"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import {
  GAP_DEFAULT,
  GAPS,
  gapText,
  kindById,
  KIND_DEFAULT,
  KINDS,
  percent,
  recrawl,
  recrawlValueText,
  recrawlVerdict,
  strip,
  visitsText,
  type PageKind,
} from "../models/crawl-recrawl";

const W = 420;
const H = 480;
const CHIP_Y = 62;
const PANEL = { x: 8, y: 90, w: 404, h: 126 };
const STRIP = { x0: 20, x1: 400 };
const CHANGE_ROW = { label: 108, y0: 116, y1: 136 };
const VISIT_ROW = { label: 162, y0: 170, y1: 190 };
const BARS = { fresh: 246, wasted: 292, x0: 20, x1: 400, h: 14 };
const READOUT = { y: 330, h: 40 };
const RAIL = { x0: 40, x1: 380, y: 430 };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 26.3 beat 6: pick a kind of page, drag the visit gap, and read how fresh the copy is and how many visits find nothing new. */
export function RecrawlPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [kind, setKind] = useState<PageKind>(KIND_DEFAULT);
  const [gap, setGap] = useState<number>(GAP_DEFAULT);

  const k = kindById(kind);
  const r = recrawl(k.perDay, gap);
  const verdict = recrawlVerdict(r);
  const s = strip(k.perDay, gap);
  const valueText = recrawlValueText(kind, r);
  const fresh = percent(r.fresh);
  const wasted = percent(r.wasted);

  const widths = KINDS.map((o) => chipWidth(o.chip));
  const xs = rowPositions(widths, 24, 8);
  const sx = (days: number) => r1(STRIP.x0 + (days / s.days) * (STRIP.x1 - STRIP.x0));
  const freshTone: Tone = r.fresh >= 0.5 ? "good" : "bad";
  const wastedTone: Tone = r.wasted > 0.7 ? "warn" : "accent";
  const barW = BARS.x1 - BARS.x0;

  const description = `${k.label}, ${k.words}. Visited every ${gapText(gap)}. The saved copy is fresh ${fresh} percent of the time, and ${wasted} percent of visits find nothing new. ${verdict.text}. At this gap, 10 million pages need ${visitsText(r.visitsPerDay)} visits a day.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Pick a <b>kind of page</b>, then drag the <b>visit gap</b>.
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />

        <g role="radiogroup" aria-label="Kind of page">
          {KINDS.map((o, i) => (
            <SvgRadioChip key={o.id} x={xs[i]} y={CHIP_Y} text={o.chip} width={widths[i]} label={`${o.label}, ${o.words}`} checked={o.id === kind} onSelect={() => setKind(o.id)} />
          ))}
        </g>

        {/* The strip: the page's changes on top, DalilBot's visits below. */}
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} className={NEUTRAL.surface} />
        <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={1.5} className={cn("fill-none", NEUTRAL.line)} />
        <text x={STRIP.x0} y={CHANGE_ROW.label} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
          {`Page changes: ${k.words.replace("changes ", "")}`}
        </text>
        {s.denseChanges ? (
          <text x={STRIP.x1} y={CHANGE_ROW.label} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
            more than shown
          </text>
        ) : null}
        <g aria-hidden>
          {s.changes.map((t, i) => (
            <line key={`c${i}`} x1={sx(t)} x2={sx(t)} y1={CHANGE_ROW.y0} y2={CHANGE_ROW.y1} strokeWidth={2.5} strokeLinecap="round" className={NEUTRAL.doneStroke} />
          ))}
        </g>
        <text x={STRIP.x0} y={VISIT_ROW.label} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
          {`DalilBot visits: every ${gapText(gap)}`}
        </text>
        {s.denseVisits ? (
          <text x={STRIP.x1} y={VISIT_ROW.label} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
            more than shown
          </text>
        ) : null}
        <g aria-hidden>
          {s.visits.map((t, i) => (
            <line key={`v${i}`} x1={sx(t)} x2={sx(t)} y1={VISIT_ROW.y0} y2={VISIT_ROW.y1} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} />
          ))}
        </g>
        <text x={STRIP.x1} y={PANEL.y + PANEL.h - 8} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
          {`this strip: ${gapText(Math.max(1 / 24, Number(s.days.toFixed(2))))}`}
        </text>

        {/* Two bars. */}
        {[
          { y: BARS.fresh, label: "Fresh: the copy matches the page", share: r.fresh, text: `${fresh}%`, tone: freshTone },
          { y: BARS.wasted, label: "Wasted visits: nothing new found", share: r.wasted, text: `${wasted}%`, tone: wastedTone },
        ].map((b) => (
          <g key={b.label}>
            <text x={BARS.x0} y={b.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{b.label}</text>
            <text x={BARS.x1} y={b.y - 8} textAnchor="end" className={cn(TONES[b.tone].text, "text-[15px] font-bold tabular-nums")}>{b.text}</text>
            <rect x={BARS.x0} y={b.y} width={barW} height={BARS.h} rx={7} className="fill-muted" />
            <rect
              x={BARS.x0}
              y={b.y}
              width={barW}
              height={BARS.h}
              rx={7}
              style={{ transform: `scaleX(${Math.max(0.012, b.share)})`, transformBox: "fill-box", transformOrigin: "left center" }}
              className={cn(TONES[b.tone].solidFill, "transition-transform duration-200 motion-reduce:transition-none")}
            />
          </g>
        ))}

        {/* The cost of the gap for the whole crawl. */}
        <rect x={8} y={READOUT.y + 3} width={404} height={READOUT.h} rx={12} className="fill-foreground/[0.06]" />
        <rect x={8} y={READOUT.y} width={404} height={READOUT.h} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
        <text x={20} y={READOUT.y + 25} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Visits a day for 10 million pages</text>
        <text x={400} y={READOUT.y + 26} textAnchor="end" className={cn(NEUTRAL.text, "text-[16px] font-bold tabular-nums")}>{visitsText(r.visitsPerDay)}</text>

        {/* The visit gap. */}
        <text x={RAIL.x0} y={RAIL.y - 34} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>
          {`Visit gap: ${gapText(gap)}`}
        </text>
        <SnapStopsRail
          svgRef={svg}
          x0={RAIL.x0}
          x1={RAIL.x1}
          y={RAIL.y}
          stops={GAPS.map((v) => {
            const t = gapText(v).split(" ");
            return { value: v, label: [t[0], t[1]] };
          })}
          value={gap}
          onChange={setGap}
          ariaLabel="Visit gap"
          valueText={valueText}
        />

        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
    </BeatFrame>
  );
}
