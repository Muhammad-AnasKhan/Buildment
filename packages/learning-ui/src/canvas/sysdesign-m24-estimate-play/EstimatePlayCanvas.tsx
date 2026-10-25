"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatBytes, formatCount } from "../models/envelope-estimate";
import { withCommas } from "../models/picture-controls";
import {
  bandwidthText,
  chainRates,
  DEFAULT_DRIVERS,
  DEFAULT_GAP,
  DEFAULT_RIDERS,
  driver,
  DRIVER_STEPS,
  estimateTail,
  estimateVerdict,
  GAP_STEPS,
  perSecond,
  RIDER_STEPS,
  safarEstimate,
  type SafarInputs,
} from "../models/safar-estimate";

type InputId = keyof SafarInputs;

const W = 420;
const H = 314;
const LEFT = 108;
const RIGHT = 316;
const GUTTER = 212;
const ROW = [68, 138, 208, 278] as const;
const CARD_W = 160;

/** The ride requests card: the spec writes about 580 a second. */
const requestsText = (n: number) => `${Math.round(n / 10) * 10} /s`;

/** 24.1 beat 2: Safar's estimate as chains of small sums; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<SafarInputs>({ drivers: DEFAULT_DRIVERS, gap: DEFAULT_GAP, riders: DEFAULT_RIDERS });
  const [selected, setSelected] = useState<InputId>("drivers");

  const r = safarEstimate(v);
  const verdict = estimateVerdict(r);
  const ring = driver(r);
  const tail = estimateTail(r, v);
  const rates = chainRates(r);

  const inputs: ChainInput[] = [
    { id: "drivers", label: "Drivers online", steps: DRIVER_STEPS, value: v.drivers, format: formatCount, valueText: tail },
    { id: "gap", label: "Seconds between reports", steps: GAP_STEPS, value: v.gap, format: (n) => `${n} s`, valueText: tail },
    { id: "riders", label: "Riders with the app open", steps: RIDER_STEPS, value: v.riders, format: formatCount, valueText: `${withCommas(v.riders)} riders with the app open, ${withCommas(r.searchesPerSecond)} searches a second` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "drivers", x: LEFT, y: ROW[0], w: CARD_W, value: formatCount(v.drivers), label: "drivers online", input: "drivers" },
    { id: "reports", x: LEFT, y: ROW[1], w: CARD_W, value: perSecond(r.reportsPerSecond), label: "reports a second", tone: ring === "reports" ? "warn" : undefined, mark: ring === "reports" ? "warn" : undefined },
    { id: "bandwidth", x: LEFT, y: ROW[2], w: CARD_W, value: bandwidthText(r.bandwidthBytes), label: "bandwidth in" },
    { id: "memory", x: LEFT, y: ROW[3], w: CARD_W, value: formatBytes(r.memoryBytes), label: "latest places, 100 B each" },
    { id: "riders", x: RIGHT, y: ROW[0], w: CARD_W, value: formatCount(v.riders), label: "riders with the app open", input: "riders" },
    { id: "searches", x: RIGHT, y: ROW[1], w: CARD_W, value: perSecond(r.searchesPerSecond), label: "searches a second", tone: ring === "searches" ? "warn" : undefined, mark: ring === "searches" ? "warn" : undefined },
    { id: "rides", x: RIGHT, y: ROW[2], w: CARD_W, value: "10 million", label: "rides a day, assumed" },
    { id: "requests", x: RIGHT, y: ROW[3], w: CARD_W, value: requestsText(r.requestsPerSecond), label: "ride requests at peak" },
  ];

  const down = (x: number, row: 0 | 1 | 2): [number, number][] => [[x, ROW[row]], [x, ROW[row + 1]]];
  const mid = (x: number, row: 0 | 1 | 2): [number, number] => [x, (ROW[row] + ROW[row + 1]) / 2];
  const links: ChainLink[] = [
    { id: "to-reports", points: down(LEFT, 0), chip: `÷ ${v.gap} s apart`, chipAt: mid(LEFT, 0), input: "gap", rate: rates.reports, tone: "accent" },
    { id: "to-bandwidth", points: down(LEFT, 1), chip: "× 50 B assumed", chipAt: mid(LEFT, 1), rate: rates.bandwidth, tone: "accent" },
    // Memory hangs off the drivers card: the line runs down the gutter between the two columns.
    { id: "to-memory", points: [[LEFT, ROW[0]], [GUTTER, ROW[0]], [GUTTER, ROW[3]], [LEFT, ROW[3]]], chip: "× 100 B", chipAt: [GUTTER, 243], rate: rates.memory, tone: "accent" },
    { id: "to-searches", points: down(RIGHT, 0), chip: "÷ 5 s assumed", chipAt: mid(RIGHT, 0), rate: rates.searches, tone: ring === "searches" ? "warn" : "accent" },
    { id: "to-requests", points: down(RIGHT, 2), chip: "÷ 86,400 × 5 peak", chipAt: mid(RIGHT, 2), rate: rates.requests, tone: "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringText = ring === "reports" ? "The reports a second card is ringed." : ring === "searches" ? "The searches a second card is ringed." : "No card is ringed.";
  const description = `Safar estimate. ${tail}. About 580 ride requests a second at peak, ${formatBytes(r.memoryBytes)} of latest places. ${verdict.text}. ${ringText}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<StepSlider input={sel} onChange={onChange} />}
      hint={<>Tap a <b>blue number</b> in the picture, then drag it sideways or use the slider.</>}
    >
      <div ref={box}>
        <EstimateChain
          width={W}
          height={H}
          cards={cards}
          links={links}
          inputs={inputs}
          selected={selected}
          onSelect={(id) => setSelected(id as InputId)}
          onChange={onChange}
          seconds={seconds}
          reduced={reduced}
          verdict={verdict}
          description={description}
        />
      </div>
    </BeatFrame>
  );
}
