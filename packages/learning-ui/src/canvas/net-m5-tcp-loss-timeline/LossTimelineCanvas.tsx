"use client";

import { useId, useMemo, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { FOCUS_RING } from "../primitives/tones";
import { TimelinePlayer } from "../renderers/timeline/TimelinePlayer";
import { cn } from "../../lib/utils";
import { RATES, buildLossTrace, clampRate, type Mode, type Rate } from "./lossModel";

// 5.5 beats 2 and 3: the same ten packets over TCP or over UDP, with one
// control, the loss rate. The model is lossModel.ts (model numbers: a packet
// every 20 ms, 40 ms to cross, one round trip to send a lost TCP packet
// again). The renderer is the shared timeline renderer; the control is a
// native range input so that it works with a finger, a mouse and the arrow
// keys. When the rate changes, the player jumps to the last step.


const HINTS: Record<Mode, string> = {
  tcp: "Drag the loss rate from 0% up. Watch the orange bars: packets that wait.",
  udp: "Drag the loss rate from 0% up. Count the lost packets. Nothing waits.",
};

export function LossTimeline({ mode, title, limits }: { mode: Mode; title: string; limits: string }) {
  const [rate, setRate] = useState<Rate>(0);
  const inputId = useId();
  const trace = useMemo(() => buildLossTrace(mode, rate), [mode, rate]);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={HINTS[mode]}
      controls={
        <label htmlFor={inputId} className="flex w-full items-center gap-3 text-sm font-semibold text-foreground">
          <span className="shrink-0">Loss rate</span>
          <input
            id={inputId}
            type="range"
            min={RATES[0]}
            max={RATES[RATES.length - 1]}
            step={10}
            value={rate}
            onChange={(event) => setRate(clampRate(Number(event.target.value)))}
            aria-valuetext={`${rate} percent of packets lost`}
            className={cn("h-11 min-w-0 flex-1 accent-blue-600 dark:accent-blue-400", FOCUS_RING)}
          />
          <span className="w-12 shrink-0 text-right tabular-nums">{rate}%</span>
        </label>
      }
    >
      <TimelinePlayer trace={trace} title={title} runKey={`${mode}-${rate}`} />
    </BeatFrame>
  );
}

