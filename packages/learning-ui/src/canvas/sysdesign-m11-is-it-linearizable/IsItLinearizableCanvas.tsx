"use client";

import { useId, useState } from "react";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { HistoryView } from "../primitives/history-view";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import type { HistoryOp } from "../models/history";
import { historyLayout, opWords, VIEW_W } from "../models/history-layout";
import { LIN_AXIS, LIN_CLIENTS, analyse, flipRead, presetHistory } from "../models/linearizable-play";

const layout = historyLayout({ clients: LIN_CLIENTS, axis: LIN_AXIS, top: 46, laneH: 54 });
const H = layout.bottom + 8;

/** 11.3 beat 1: tap a read to change what it returned, and watch a point appear inside every bar or the pair that cannot fit. */
export function IsItLinearizableCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [ops, setOps] = useState<HistoryOp[]>(presetHistory);
  const titleId = useId();
  const descId = useId();
  const view = analyse(ops);

  const order = view.order ? view.order.map((id) => ops.find((o) => o.id === id)?.client).join(", ") : null;
  const description = `Ada writes x = 1 from 10 to 60. ${ops
    .filter((o) => o.kind === "read")
    .map((o) => `${o.client} reads x from ${o.start} to ${o.end} and gets ${o.value}`)
    .join(". ")}. ${view.verdict.text}.${order ? ` One order: ${order}.` : ""}`;

  return (
    <BeatFrame label={title} limits={limits} controls={<BeatButton onClick={() => setOps(presetHistory())}>Reset</BeatButton>} hint="Tap a read to change what it returned.">
      <svg viewBox={`0 0 ${VIEW_W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={VIEW_W} height={H} />
        <VerdictBanner width={VIEW_W} text={view.verdict.text} tone={view.verdict.tone} />
        <HistoryView
          layout={layout}
          ops={ops}
          words={ops.map((o) => opWords(o))}
          rings={view.rings}
          dots={view.dots}
          dotsOpacity={view.ok ? 1 : 0}
          pressable={(o) => o.kind === "read"}
          onBar={(o) => setOps(flipRead(ops, o.id))}
          barAction={() => "Tap to change what it returned"}
        />
      </svg>
    </BeatFrame>
  );
}
