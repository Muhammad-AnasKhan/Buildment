"use client";

import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { NEUTRAL } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatBits, formatBytes, formatCount } from "../models/envelope-estimate";
import { withCommas } from "../models/picture-controls";
import {
  bitsInWords,
  chainRates,
  driver,
  estimateTail,
  estimateVerdict,
  lamhaEstimate,
  machinesText,
  MINUTE_STEPS,
  minutesLabel,
  perSecond,
  UPLOAD_STEPS,
  VIEW_STEPS,
  viewersText,
  type LamhaInputs,
} from "../models/lamha-estimate";
import { DEFAULT_MINUTES, DEFAULT_UPLOADS, DEFAULT_VIEWS, PEAK_FACTOR, SENT_MBIT, STORED_MB_PER_VIDEO, WORKER_MINUTES_PER_VIDEO } from "../models/lamha-numbers";

type InputId = keyof LamhaInputs;

const W = 420;
const H = 392;
const COL_A = 72;
const COL_STORED = 212;
const COL_BUSY = 348;
const ROW = [70, 140, 210, 280, 350] as const;
const UP = { x: 280, y: 70 };
const BUS_Y = 102;

/** 27.1: Lamha's estimate as three chains; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<LamhaInputs>({ views: DEFAULT_VIEWS, minutes: DEFAULT_MINUTES, uploads: DEFAULT_UPLOADS });
  const [selected, setSelected] = useState<InputId>("views");

  const r = lamhaEstimate(v);
  const verdict = estimateVerdict(r);
  const ring = driver(r);
  const rates = chainRates(r);
  const tail = estimateTail(r);

  const inputs: ChainInput[] = [
    { id: "views", label: "Views a day", steps: VIEW_STEPS, value: v.views, format: formatCount, valueText: `${formatCount(v.views)} views a day, ${tail}` },
    { id: "minutes", label: "Minutes watched per view", steps: MINUTE_STEPS, value: v.minutes, format: minutesLabel, valueText: `${minutesLabel(v.minutes)} watched per view, ${tail}` },
    { id: "uploads", label: "Uploads a day", steps: UPLOAD_STEPS, value: v.uploads, format: formatCount, valueText: `${withCommas(v.uploads)} uploads a day, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "views", x: COL_A, y: ROW[0], value: formatCount(v.views), label: "views a day", input: "views" },
    { id: "vps", x: COL_A, y: ROW[1], value: perSecond(r.viewsPerSecond), label: "views a second" },
    { id: "viewers", x: COL_A, y: ROW[2], value: viewersText(r.viewersAtOnce), label: "viewers at once" },
    { id: "sentAvg", x: COL_A, y: ROW[3], value: formatBits(r.sentAverageBps), label: "video sent, average" },
    { id: "sentPeak", x: COL_A, y: ROW[4], value: formatBits(r.sentPeakBps), label: "video sent, peak", tone: ring === "sent" ? "warn" : undefined, mark: ring === "sent" ? "warn" : undefined },
    { id: "uploads", x: UP.x, y: UP.y, w: 168, h: 40, value: formatCount(v.uploads), label: "uploads a day", input: "uploads" },
    { id: "stored", x: COL_STORED, y: ROW[1], value: formatBytes(r.storedYearBytes), label: "stored a year", tone: ring === "stored" ? "warn" : undefined, mark: ring === "stored" ? "warn" : undefined },
    { id: "busyAvg", x: COL_BUSY, y: ROW[1], value: machinesText(r.machinesAverage), label: "busy machines, avg" },
    { id: "busyPeak", x: COL_BUSY, y: ROW[2], value: machinesText(r.machinesPeak), label: "busy machines, peak", tone: ring === "machines" ? "warn" : undefined, mark: ring === "machines" ? "warn" : undefined },
  ];

  const down = (x: number, a: number, b: number): [number, number][] => [[x, ROW[a]], [x, ROW[b]]];
  const mid = (x: number, a: number, b: number): [number, number] => [x, (ROW[a] + ROW[b]) / 2];
  const fromUploads = (x: number): [number, number][] => [[UP.x, UP.y], [UP.x, BUS_Y], [x, BUS_Y], [x, ROW[1]]];
  const links: ChainLink[] = [
    { id: "l-vps", points: down(COL_A, 0, 1), chip: "÷ 86,400 s", chipAt: mid(COL_A, 0, 1), rate: rates.perSecond, tone: "accent" },
    { id: "l-viewers", points: down(COL_A, 1, 2), chip: `× ${v.minutes} min × 60`, chipAt: mid(COL_A, 1, 2), input: "minutes", rate: rates.viewers, tone: "accent" },
    { id: "l-avg", points: down(COL_A, 2, 3), chip: `× ${SENT_MBIT} Mbit/s`, chipAt: mid(COL_A, 2, 3), rate: rates.sentAverage, tone: "accent" },
    { id: "l-peak", points: down(COL_A, 3, 4), chip: `× ${PEAK_FACTOR} peak`, chipAt: mid(COL_A, 3, 4), rate: rates.sentPeak, tone: ring === "sent" ? "warn" : "accent" },
    { id: "l-stored", points: fromUploads(COL_STORED), chip: `× ${STORED_MB_PER_VIDEO} MB × 365`, chipAt: [COL_STORED, BUS_Y + 14], rate: rates.stored, tone: ring === "stored" ? "warn" : "accent" },
    { id: "l-busy", points: fromUploads(COL_BUSY), chip: `× ${WORKER_MINUTES_PER_VIDEO} / 1,440`, chipAt: [COL_BUSY, BUS_Y + 14], rate: rates.busyAverage, tone: "accent" },
    { id: "l-busy-peak", points: down(COL_BUSY, 1, 2), chip: `× ${PEAK_FACTOR} peak`, chipAt: mid(COL_BUSY, 1, 2), rate: rates.busyPeak, tone: ring === "machines" ? "warn" : "accent" },
  ];

  const ringText =
    ring === "sent" ? "The video sent at peak card is ringed." : ring === "stored" ? "The stored a year card is ringed." : ring === "machines" ? "The busy machines at peak card is ringed." : "No card is ringed.";
  const description = `Lamha estimate. ${formatCount(v.views)} views a day, ${minutesLabel(v.minutes)} per view, ${withCommas(v.uploads)} uploads a day. ${bitsInWords(r.sentPeakBps)} at peak. ${verdict.text}. ${ringText}`;
  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];

  const footer = (
    <g aria-hidden>
      <rect x={160} y={252} width={248} height={118} rx={14} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-none", NEUTRAL.faintStroke)} />
      <text x={172} y={272} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>assumptions, fixed</text>
      <text x={172} y={292} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`${SENT_MBIT} Mbit/s sent to a viewer`}</text>
      <text x={172} y={310} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`busiest second = ${PEAK_FACTOR} x average`}</text>
      <text x={172} y={328} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`${STORED_MB_PER_VIDEO} MB stored per video`}</text>
      <text x={172} y={346} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{`${WORKER_MINUTES_PER_VIDEO} worker-minutes per video`}</text>
    </g>
  );

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
          footer={footer}
        />
      </div>
    </BeatFrame>
  );
}
