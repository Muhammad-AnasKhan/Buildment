"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  envelopeVerdict,
  estimateEnvelope,
  flowRate,
  formatBits,
  formatBytes,
  formatCount,
  pressures,
  pressureTone,
  type DrivingKey,
  type EnvelopeInputs,
  type Limits,
} from "../models/envelope-estimate";

export type EstimatorInputId = "users" | "requestsPerUser" | "peakFactor" | "itemBytes";

export type EstimatorSetup = {
  steps: Record<EstimatorInputId, readonly number[]>;
  start: EnvelopeInputs;
  limits: Limits;
  /** Plain names for the four inputs. */
  names: Record<EstimatorInputId, string>;
  /** Years shown on the last storage card. */
  years: number;
};

type Props = { title: string; purpose: string; limits: string; setup: EstimatorSetup };

const W = 420;
const H = 312;
const COL = [72, 210, 348] as const;
const ROW = [140, 210, 280] as const;
const USERS = { x: 210, y: 66 };
const BUS_Y = 96;

const sizeText = (bytes: number) => formatBytes(bytes);
const share = (s: number) => (s > 0 && s < 1 ? `1 in ${Math.round(1 / s)}` : `${Math.round(s * 100)}%`);

/** 2.3: the estimate drawn as its working; tap a blue number and drag it. */
export function EstimatorCanvas({ title, limits, setup }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<EnvelopeInputs>(setup.start);
  const [selected, setSelected] = useState<EstimatorInputId>("users");
  const { seconds, reduced } = useBeatClock(box);

  const r = estimateEnvelope(v);
  const p = pressures(r, setup.limits);
  const pr = (k: DrivingKey) => p.find((x) => x.key === k)?.ratio ?? 0;
  const verdict = envelopeVerdict(r, setup.limits);
  const tone = (k: DrivingKey) => pressureTone(pr(k));

  const inputs: ChainInput[] = [
    { id: "users", label: setup.names.users, steps: setup.steps.users, value: v.users, format: (n) => formatCount(n) },
    { id: "requestsPerUser", label: setup.names.requestsPerUser, steps: setup.steps.requestsPerUser, value: v.requestsPerUser, format: (n) => `${formatCount(n)} a day` },
    { id: "peakFactor", label: setup.names.peakFactor, steps: setup.steps.peakFactor, value: v.peakFactor, format: (n) => `× ${formatCount(n)}` },
    { id: "itemBytes", label: setup.names.itemBytes, steps: setup.steps.itemBytes, value: v.itemBytes, format: sizeText },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const mark = (k: DrivingKey) => (verdict.key === k ? verdict.tone : undefined);
  const cards: ChainCard[] = [
    { id: "users", x: USERS.x, y: USERS.y, w: 168, h: 40, value: formatCount(v.users), label: "daily users", input: "users" },
    { id: "reqDay", x: COL[0], y: ROW[0], value: formatCount(r.requestsPerDay), label: "requests a day" },
    { id: "avg", x: COL[0], y: ROW[1], value: `${formatCount(r.averagePerSecond)} /s`, label: "average" },
    { id: "peak", x: COL[0], y: ROW[2], value: `${formatCount(r.peakPerSecond)} /s`, label: "at peak", tone: tone("requests"), mark: mark("requests") },
    { id: "storeDay", x: COL[1], y: ROW[0], value: formatBytes(r.storedPerDayBytes), label: "new notes a day" },
    { id: "storeYear", x: COL[1], y: ROW[1], value: formatBytes(r.storedPerYearBytes), label: `a year, ${v.copies} copies`, tone: tone("storage"), mark: mark("storage") },
    { id: "storeYears", x: COL[1], y: ROW[2], value: formatBytes(r.storedPerYearBytes * setup.years), label: `after ${setup.years} years` },
    { id: "sentDay", x: COL[2], y: ROW[0], value: formatBytes(r.sentPerDayBytes), label: "plays sent a day" },
    { id: "bitsAvg", x: COL[2], y: ROW[1], value: formatBits(r.averageBitsPerSecond), label: "average" },
    { id: "bitsPeak", x: COL[2], y: ROW[2], value: formatBits(r.peakBitsPerSecond), label: "at peak", tone: tone("bandwidth"), mark: mark("bandwidth") },
  ];

  const rate = { requests: flowRate(pr("requests")), storage: flowRate(pr("storage")), bandwidth: flowRate(pr("bandwidth")) };
  const fromUsers = (x: number): [number, number][] => [[USERS.x, USERS.y], [USERS.x, BUS_Y], [x, BUS_Y], [x, ROW[0]]];
  const down = (x: number, row: 0 | 1): [number, number][] => [[x, ROW[row]], [x, ROW[row + 1]]];
  const mid = (x: number, row: 0 | 1): [number, number] => [x, (ROW[row] + ROW[row + 1]) / 2];
  const size = sizeText(v.itemBytes);
  const peak = `× ${formatCount(v.peakFactor)} peak`;
  const links: ChainLink[] = [
    { id: "u-req", points: fromUsers(COL[0]), chip: `× ${formatCount(v.requestsPerUser)} each`, chipAt: [COL[0], 107], input: "requestsPerUser", rate: rate.requests, tone: tone("requests") },
    { id: "req-avg", points: down(COL[0], 0), chip: "÷ 86,400 s", chipAt: mid(COL[0], 0), rate: rate.requests, tone: tone("requests") },
    { id: "avg-peak", points: down(COL[0], 1), chip: peak, chipAt: mid(COL[0], 1), input: "peakFactor", rate: rate.requests, tone: tone("requests") },
    { id: "u-store", points: fromUsers(COL[1]), chip: `${share(v.writeShare)} × ${size}`, chipAt: [COL[1], 107], input: "itemBytes", rate: rate.storage, tone: tone("storage") },
    { id: "store-year", points: down(COL[1], 0), chip: `× 365 × ${v.copies} copies`, chipAt: mid(COL[1], 0), rate: rate.storage, tone: tone("storage") },
    { id: "year-years", points: down(COL[1], 1), chip: `× ${setup.years} years`, chipAt: mid(COL[1], 1), rate: rate.storage, tone: tone("storage") },
    { id: "u-sent", points: fromUsers(COL[2]), chip: `${formatCount(v.readsPerUser)} plays × ${size}`, chipAt: [COL[2], 107], input: "itemBytes", rate: rate.bandwidth, tone: tone("bandwidth") },
    { id: "sent-avg", points: down(COL[2], 0), chip: "÷ 86,400 × 8 bits", chipAt: mid(COL[2], 0), rate: rate.bandwidth, tone: tone("bandwidth") },
    { id: "avg-peakbits", points: down(COL[2], 1), chip: peak, chipAt: mid(COL[2], 1), input: "peakFactor", rate: rate.bandwidth, tone: tone("bandwidth") },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const description = `Estimate. ${formatCount(v.users)} daily users, ${v.requestsPerUser} requests each, peak factor ${v.peakFactor}, notes of ${size}. Peak ${formatCount(r.peakPerSecond)} requests a second; ${formatBytes(r.storedPerYearBytes)} stored a year; ${formatBits(r.peakBitsPerSecond)} at peak. ${verdict.text}.`;

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
          onSelect={(id) => setSelected(id as EstimatorInputId)}
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
