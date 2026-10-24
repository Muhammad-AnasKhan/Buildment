"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { HistoryView } from "../primitives/history-view";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, type Tone } from "../primitives/tones";
import { mayReturn, type HistoryOp } from "../models/history";
import { historyLayout, mayReturnWords, opWords, VIEW_W } from "../models/history-layout";
import { BUILD_AXIS, BUILD_CLIENTS, MAX_OPS, NOTICE_FULL, NOTICE_REFUSED, addBar, buildSummary, presetHistory, removeBar } from "../models/history-build";

const TOP = 46;
const LANE_H = 60;
const layout = historyLayout({ clients: BUILD_CLIENTS, axis: BUILD_AXIS, top: TOP, laneH: LANE_H });
const CHIP_Y = layout.bottom + 24;
const H = CHIP_Y + 28;

type Notice = { text: string; tone: Tone } | null;

/** 11.2 beat 1: tap a lane to add a bar, tap a bar twice to remove it, and read which pairs overlap. */
export function BuildHistoryCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [ops, setOps] = useState<HistoryOp[]>(presetHistory);
  const [selected, setSelected] = useState<string | null>(null);
  const [write, setWrite] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const titleId = useId();
  const descId = useId();

  const verdict: { text: string; tone: Tone } = notice ?? (selected ? { text: "Tap the bar again to remove it", tone: "accent" } : { text: buildSummary(ops), tone: "accent" });

  const words = ops.map((o) => opWords(o, { hideReadValue: true }));
  const captions = ops.filter((o) => o.kind === "read").map((o) => ({ id: o.id, cands: mayReturnWords(mayReturn(ops, o)), tone: "accent" as const }));

  function pressBar(op: HistoryOp) {
    setNotice(null);
    if (selected === op.id) {
      setOps(removeBar(ops, op.id));
      setSelected(null);
    } else setSelected(op.id);
  }
  function pressLane(client: string, time: number | null) {
    setSelected(null);
    const res = addBar(ops, client, time, write);
    if (res.refused === "overlap") return setNotice({ text: NOTICE_REFUSED, tone: "warn" });
    if (res.refused === "full") return setNotice({ text: NOTICE_FULL, tone: "warn" });
    setOps(res.ops);
    setNotice(res.ops.length >= MAX_OPS ? { text: NOTICE_FULL, tone: "warn" } : null);
  }
  function reset() {
    setOps(presetHistory());
    setSelected(null);
    setNotice(null);
    setWrite(false);
  }

  const description = `${buildSummary(ops)}. ${ops
    .map((o) => {
      const base = `${o.client} ${o.kind === "write" ? `writes x = ${o.value}` : "reads x"} from ${o.start} to ${o.end}`;
      return o.kind === "read" ? `${base}, may return ${mayReturn(ops, o).join(" or ")}` : base;
    })
    .join(". ")}.`;

  return (
    <BeatFrame label={title} limits={limits} controls={<BeatButton onClick={reset}>Reset</BeatButton>} hint="Tap a lane to add a bar. Tap a bar twice to remove it.">
      <svg viewBox={`0 0 ${VIEW_W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={VIEW_W} height={H} />
        <VerdictBanner width={VIEW_W} text={verdict.text} tone={verdict.tone} />
        <HistoryView
          layout={layout}
          ops={ops}
          words={words}
          captions={captions}
          selected={selected}
          onBar={pressBar}
          barAction={(o) => (selected === o.id ? "Tap again to remove it" : "Tap to select it, then tap again to remove it")}
          onLane={pressLane}
          laneAction={(c) => `Add a ${write ? "write" : "read"} bar to ${c}'s lane`}
        />
        <text x={12} y={CHIP_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Tap a lane to add a</text>
        <g role="radiogroup" aria-label="Kind of bar to add">
          <SvgRadioChip x={146} y={CHIP_Y} text="read" width={58} label="Add a read bar" checked={!write} onSelect={() => setWrite(false)} />
          <SvgRadioChip x={212} y={CHIP_Y} text="write" width={64} label="Add a write bar" checked={write} onSelect={() => setWrite(true)} />
        </g>
      </svg>
    </BeatFrame>
  );
}
