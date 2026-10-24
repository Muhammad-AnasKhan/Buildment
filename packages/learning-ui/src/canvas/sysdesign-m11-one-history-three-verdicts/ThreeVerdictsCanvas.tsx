"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { BeatSegmented } from "../primitives/beat-segmented";
import { HistoryView } from "../primitives/history-view";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TONES } from "../primitives/tones";
import type { HistoryOp } from "../models/history";
import { historyLayout, opWords, VIEW_W } from "../models/history-layout";
import { PRESETS, describe, presetById, tapRead, valueText, type PresetId } from "../models/three-verdicts";

const TOP = 46;
const LANE_H = 54;
const MAX_LANES = 4;
const CHIPS_Y = TOP + MAX_LANES * LANE_H + 8 + 44 + 8;
const H = CHIPS_Y + 44 + 8;
const CHIP = { w: 128, h: 44, gap: 8 };

const MODELS = [
  { id: "lin", name: "Linearizable" },
  { id: "seq", name: "Sequential" },
  { id: "causal", name: "Causal" },
] as const;

/** 11.4 beat 1: pick a history, tap a read, and watch the three verdicts change. */
export function ThreeVerdictsCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const [presetId, setPresetId] = useState<PresetId>("stale");
  const [ops, setOps] = useState<HistoryOp[]>(() => presetById("stale").ops);
  const titleId = useId();
  const descId = useId();

  const preset = presetById(presetId);
  const view = describe(ops);
  const layout = historyLayout({
    clients: preset.clients,
    axis: { ...preset.axis, caption: "time (made-up ms)" },
    top: TOP + ((MAX_LANES - preset.clients.length) * LANE_H) / 2,
    laneH: LANE_H,
  });
  const format = (key: string, value: number) => valueText(key, value);

  const choose = (id: PresetId) => {
    setPresetId(id);
    setOps(presetById(id).ops);
  };
  const chipsX = (VIEW_W - (3 * CHIP.w + 2 * CHIP.gap)) / 2;
  const state = (id: "lin" | "seq" | "causal") => view.verdicts[id];

  const description = `${ops
    .map((o) => (o.kind === "write" ? `${o.client} writes ${o.key} = ${format(o.key, o.value)}` : `${o.client} reads ${o.key} and gets ${format(o.key, o.value)}`) + ` from ${o.start} to ${o.end}`)
    .join(". ")}. Linearizable: ${state("lin") ? "yes" : "no"}. Sequential: ${state("seq") ? "yes" : "no"}. Causal: ${state("causal") ? "yes" : "no"}. ${view.banner.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={
        <>
          <BeatSegmented label="History" options={PRESETS.map((p) => ({ id: p.id, label: p.label }))} value={presetId} onChange={choose} />
          <BeatButton onClick={() => setOps(preset.ops)}>Reset</BeatButton>
        </>
      }
      hint="Tap a read to change its value."
    >
      <svg viewBox={`0 0 ${VIEW_W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={VIEW_W} height={H} />
        <VerdictBanner width={VIEW_W} text={view.banner.text} tone={view.banner.tone} />
        <HistoryView
          layout={layout}
          ops={ops}
          words={ops.map((o) => opWords(o, { format }))}
          rings={view.rings}
          pressable={(o) => !!preset.lists[o.id]}
          onBar={(o) => setOps(tapRead(preset, ops, o.id))}
          barAction={() => "Tap to change its value"}
        />
        {MODELS.map((m, i) => {
          const ok = state(m.id);
          const tone = TONES[ok ? "good" : "bad"];
          const x = chipsX + i * (CHIP.w + CHIP.gap);
          return (
            <g key={m.id}>
              <rect x={x} y={CHIPS_Y} width={CHIP.w} height={CHIP.h} rx={14} strokeWidth={2} className={cn(tone.softFill, tone.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
              <text x={x + CHIP.w / 2} y={CHIPS_Y + 17} textAnchor="middle" className={cn(tone.text, "text-[12px] font-semibold")}>{m.name}</text>
              <text x={x + CHIP.w / 2} y={CHIPS_Y + 36} textAnchor="middle" className={cn(tone.text, "text-[15px] font-bold")}>{ok ? "yes" : "no"}</text>
            </g>
          );
        })}
      </svg>
    </BeatFrame>
  );
}
