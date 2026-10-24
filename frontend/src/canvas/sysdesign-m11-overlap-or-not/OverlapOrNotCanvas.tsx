"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { HistoryView } from "../primitives/history-view";
import { PictureSlider } from "../primitives/picture-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { BAR_H, PLOT_X0, PLOT_X1, VIEW_W, historyLayout, opWords, textWidth } from "../models/history-layout";
import {
  DEFAULT_READ_START,
  OVERLAP_AXIS,
  READ_LENGTH,
  READ_STARTS,
  VERDICTS,
  WRITE_END,
  WRITE_START,
  allowed,
  chipText,
  historyAt,
  snapStart,
  zoneOf,
} from "../models/overlap-or-not";

const TOP = 46;
const LANE_H = 70;
const layout = historyLayout({ clients: ["Ada", "Ben"], axis: OVERLAP_AXIS, top: TOP, laneH: LANE_H });
const H = layout.bottom + 8;
const CHIP_H = 20;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A bracket under a bar: a line with an end tick at each side. */
function Bracket({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  return (
    <g aria-hidden className={TONES.accent.stroke}>
      <line x1={x0} x2={x1} y1={y} y2={y} strokeWidth={2} strokeLinecap="round" />
      <line x1={x0} x2={x0} y1={y - 4} y2={y + 1} strokeWidth={2} strokeLinecap="round" />
      <line x1={x1} x2={x1} y1={y - 4} y2={y + 1} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/** 11.2 beat 3: drag Ben's read along the timeline and see which answers are allowed. */
export function OverlapOrNotCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [s, setS] = useState<number>(DEFAULT_READ_START);
  const titleId = useId();
  const descId = useId();

  const ops = historyAt(s);
  const zone = zoneOf(s);
  const verdict = VERDICTS[zone];
  const values = allowed(s);
  const chip = chipText(values);
  const chipW = Math.ceil(textWidth(chip, 11.5, true) + 14);

  const bandY = (lane: number) => layout.bandY(lane);
  const writeX = [layout.x(WRITE_START), layout.x(WRITE_END)] as const;
  const readX = [layout.x(s), layout.x(s + READ_LENGTH)] as const;

  const writeNote = `write lands in ${WRITE_START} to ${WRITE_END}`;
  const readNote = `read lands in ${s} to ${s + READ_LENGTH}`;
  const writeNoteW = textWidth(writeNote, 11.5, true);
  const readNoteW = textWidth(readNote, 11.5, true);
  const readRowW = readNoteW + 8 + chipW;
  const readRowX = Math.max(PLOT_X0 - 2, Math.min(readX[0], PLOT_X1 + 8 - readRowW));
  const writeRowX = Math.max(PLOT_X0 - 2, Math.min(writeX[0], PLOT_X1 + 8 - writeNoteW));
  const rowY = (lane: number) => bandY(lane) + 8;

  const description = `Ada writes x = 1 from ${WRITE_START} to ${WRITE_END}. Ben reads x from ${s} to ${s + READ_LENGTH}. ${verdict.text}. The read ${chip}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<BeatButton onClick={() => setS(DEFAULT_READ_START)}>Reset</BeatButton>}
      hint="Drag Ben's read left and right."
    >
      <PictureSlider
        svgRef={svg}
        x0={layout.x(10)}
        x1={layout.x(90)}
        label="Start of Ben's read"
        valueText={`Ben's read runs from ${s} to ${s + READ_LENGTH}. ${verdict.text}. It ${chip}.`}
        value={s}
        ladder={READ_STARTS}
        fromFraction={(f) => snapStart(f * 80)}
        onChange={setS}
      >
        <svg ref={svg} viewBox={`0 0 ${VIEW_W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={VIEW_W} height={H} />
          <VerdictBanner width={VIEW_W} text={verdict.text} tone={verdict.tone} />
          <HistoryView layout={layout} ops={ops} words={ops.map((o) => opWords(o, { hideReadValue: o.kind === "read" }))}>
            {/* Grips on the read bar: it moves as a whole. */}
            <g aria-hidden className="stroke-muted-foreground">
              {[readX[0] + 7, readX[0] + 11, readX[1] - 11, readX[1] - 7].map((gx) => (
                <line key={gx} x1={r1(gx)} x2={r1(gx)} y1={layout.barY(1) + 8} y2={layout.barY(1) + BAR_H - 8} strokeWidth={1.5} strokeLinecap="round" />
              ))}
            </g>
            {/* Where each operation may take effect. */}
            <Bracket x0={writeX[0]} x1={writeX[1]} y={bandY(0) + 2} />
            <Bracket x0={readX[0]} x1={readX[1]} y={bandY(1) + 2} />
            <text x={r1(writeRowX)} y={rowY(0) + 14} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{writeNote}</text>
            <text x={r1(readRowX)} y={rowY(1) + 14} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold")}>{readNote}</text>
            <g>
              <rect x={r1(readRowX + readNoteW + 8)} y={rowY(1)} width={chipW} height={CHIP_H} rx={CHIP_H / 2} strokeWidth={1.5} className={cn(TONES[zone === "overlap" ? "good" : "accent"].softFill, TONES[zone === "overlap" ? "good" : "accent"].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={r1(readRowX + readNoteW + 8 + chipW / 2)} y={rowY(1) + 14} textAnchor="middle" className={cn(TONES[zone === "overlap" ? "good" : "accent"].text, "text-[11.5px] font-semibold")}>{chip}</text>
            </g>
          </HistoryView>
        </svg>
      </PictureSlider>
    </BeatFrame>
  );
}
