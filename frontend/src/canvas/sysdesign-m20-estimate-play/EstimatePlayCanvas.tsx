"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatBytes, formatCount } from "../models/envelope-estimate";
import {
  chainRates,
  driver,
  estimateTail,
  estimateVerdict,
  NEW_LINK_STEPS,
  perSecond,
  READ_STEPS,
  waslaEstimate,
  YEAR_STEPS,
  yearsText,
  type WaslaInputs,
} from "../models/wasla-estimate";
import { DEFAULT_NEW_LINKS, DEFAULT_READS_PER_LINK, DEFAULT_YEARS, PEAK_FACTOR } from "../models/wasla-numbers";
import { withCommas } from "../models/picture-controls";

type InputId = keyof WaslaInputs;

const W = 420;
const H = 312;
const START = { x: 210, y: 66 };
const UP_X = 100;
const DOWN_X = 320;
const ROW = [140, 210, 280] as const;
const BUS_Y = 96;

/** 20.1: Wasla's estimate as two chains from one card; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<WaslaInputs>({ newLinks: DEFAULT_NEW_LINKS, reads: DEFAULT_READS_PER_LINK, years: DEFAULT_YEARS });
  const [selected, setSelected] = useState<InputId>("newLinks");

  const r = waslaEstimate(v);
  const verdict = estimateVerdict(r);
  const ring = driver(r);
  const tail = estimateTail(r);
  const rates = chainRates(r);

  const inputs: ChainInput[] = [
    { id: "newLinks", label: "New links a month", steps: NEW_LINK_STEPS, value: v.newLinks, format: formatCount, valueText: `${formatCount(v.newLinks)} new links a month, ${tail}` },
    { id: "reads", label: "Reads per link", steps: READ_STEPS, value: v.reads, format: (n) => `${formatCount(n)} reads`, valueText: `${withCommas(v.reads)} reads per link, ${tail}` },
    { id: "years", label: "Years kept", steps: YEAR_STEPS, value: v.years, format: yearsText, valueText: `${yearsText(v.years)} kept, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "start", x: START.x, y: START.y, w: 168, h: 40, value: formatCount(v.newLinks), label: "new links a month", input: "newLinks" },
    { id: "creates", x: UP_X, y: ROW[0], value: perSecond(r.createsPerSecond), label: "creates a second" },
    { id: "average", x: UP_X, y: ROW[1], value: perSecond(r.averagePerSecond), label: "redirects, average" },
    { id: "peak", x: UP_X, y: ROW[2], value: perSecond(r.peakPerSecond), label: "redirects, at peak", tone: ring === "peak" ? "warn" : undefined, mark: ring === "peak" ? "warn" : undefined },
    { id: "stored", x: DOWN_X, y: ROW[0], value: formatCount(r.linksStored), label: "links stored" },
    { id: "storage", x: DOWN_X, y: ROW[1], value: formatBytes(r.storageBytes), label: "storage", tone: ring === "storage" ? "warn" : undefined, mark: ring === "storage" ? "warn" : undefined },
  ];

  const fromStart = (x: number): [number, number][] => [[START.x, START.y], [START.x, BUS_Y], [x, BUS_Y], [x, ROW[0]]];
  const down = (x: number, row: 0 | 1): [number, number][] => [[x, ROW[row]], [x, ROW[row + 1]]];
  const mid = (x: number, row: 0 | 1): [number, number] => [x, (ROW[row] + ROW[row + 1]) / 2];
  const links: ChainLink[] = [
    { id: "to-creates", points: fromStart(UP_X), chip: "÷ 2,592,000 s", chipAt: [UP_X, 107], rate: rates.creates, tone: "accent" },
    { id: "to-average", points: down(UP_X, 0), chip: `× ${formatCount(v.reads)} reads`, chipAt: mid(UP_X, 0), input: "reads", rate: rates.average, tone: "accent" },
    { id: "to-peak", points: down(UP_X, 1), chip: `× ${PEAK_FACTOR} peak (assumed)`, chipAt: mid(UP_X, 1), rate: rates.peak, tone: ring === "peak" ? "warn" : "accent" },
    { id: "to-stored", points: fromStart(DOWN_X), chip: `× 12 × ${yearsText(v.years)}`, chipAt: [DOWN_X, 107], input: "years", rate: rates.storage, tone: "accent" },
    { id: "to-storage", points: down(DOWN_X, 0), chip: "× 300 B (assumed)", chipAt: mid(DOWN_X, 0), rate: rates.storage, tone: ring === "storage" ? "warn" : "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringText = ring === "peak" ? "The peak redirects card is ringed." : ring === "storage" ? "The storage card is ringed." : "No card is ringed.";
  const description = `Wasla estimate. ${formatCount(v.newLinks)} new links a month, ${v.reads} reads per link, kept ${yearsText(v.years)}. ${tail}. ${verdict.text}. ${ringText}`;

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
