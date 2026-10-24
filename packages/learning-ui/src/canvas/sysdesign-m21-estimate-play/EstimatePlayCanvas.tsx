"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatBytes, formatCount } from "../models/envelope-estimate";
import {
  bytesInWords,
  chainRates,
  feedEstimate,
  feedTail,
  feedVerdict,
  FOLLOW_STEPS,
  OPEN_STEPS,
  perSecondText,
  ring,
  USER_STEPS,
  type FeedInputs,
} from "../models/feed-estimate";
import {
  BYTES_PER_ID,
  DEFAULT_DAILY_USERS,
  DEFAULT_FOLLOWS,
  DEFAULT_OPENS,
  IDS_PER_TIMELINE,
  PEAK_FACTOR,
  POSTS_PER_USER,
  SECONDS_PER_DAY,
} from "../models/feed-numbers";
import { withCommas } from "../models/picture-controls";

type InputId = keyof FeedInputs;

const W = 420;
const H = 384;
const START = { x: 210, y: 66 };
const COL = [66, 210, 354] as const;
const ROW = [140, 208, 276, 344] as const;
const BUS_Y = 96;

const opensText = (n: number) => `${n} ${n === 1 ? "open" : "opens"}`;

/** 21.1: Hikaya's estimate as three chains from one card; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<FeedInputs>({ users: DEFAULT_DAILY_USERS, opens: DEFAULT_OPENS, follows: DEFAULT_FOLLOWS });
  const [selected, setSelected] = useState<InputId>("users");

  const r = feedEstimate(v);
  const verdict = feedVerdict(r);
  const ringed = ring(r);
  const tail = feedTail(r);
  const rates = chainRates(r);

  const inputs: ChainInput[] = [
    { id: "users", label: "Daily users", steps: USER_STEPS, value: v.users, format: formatCount, valueText: `${formatCount(v.users)} daily users, ${tail}` },
    { id: "opens", label: "Feed opens per user a day", steps: OPEN_STEPS, value: v.opens, format: opensText, valueText: `${v.opens} feed opens per user a day, ${tail}` },
    { id: "follows", label: "Follows per account", steps: FOLLOW_STEPS, value: v.follows, format: (n) => `${n} follows`, valueText: `${v.follows} follows per account, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "start", x: START.x, y: START.y, w: 168, h: 40, value: formatCount(v.users), label: "daily users", input: "users" },
    { id: "opens-day", x: COL[0], y: ROW[0], value: formatCount(r.opensPerDay), label: "feed opens a day" },
    { id: "opens-avg", x: COL[0], y: ROW[1], value: perSecondText(r.opensAverage), label: "feed opens, average" },
    { id: "opens-peak", x: COL[0], y: ROW[2], value: perSecondText(r.opensPeak), label: "feed opens, peak", tone: ringed === "opens" ? "warn" : undefined, mark: ringed === "opens" ? "warn" : undefined },
    { id: "lookups", x: COL[0], y: ROW[3], value: perSecondText(r.lookupsPeak), label: "lookups if built on read", tone: ringed === "lookups" ? "warn" : undefined, mark: ringed === "lookups" ? "warn" : undefined },
    { id: "posts-day", x: COL[1], y: ROW[0], value: formatCount(r.postsPerDay), label: "posts a day" },
    { id: "posts-avg", x: COL[1], y: ROW[1], value: perSecondText(r.postsAverage), label: "posts, average" },
    { id: "posts-peak", x: COL[1], y: ROW[2], value: perSecondText(r.postsPeak), label: "posts, peak" },
    { id: "storage", x: COL[2], y: ROW[0], value: formatBytes(r.storageBytes), label: "timeline storage" },
  ];

  const fromStart = (x: number): [number, number][] => (x === START.x ? [[START.x, START.y], [x, ROW[0]]] : [[START.x, START.y], [START.x, BUS_Y], [x, BUS_Y], [x, ROW[0]]]);
  const down = (x: number, row: number): [number, number][] => [[x, ROW[row]], [x, ROW[row + 1]]];
  const mid = (x: number, row: number): [number, number] => [x, (ROW[row] + ROW[row + 1]) / 2];
  const peakTone = ringed === "opens" ? "warn" : "accent";
  const links: ChainLink[] = [
    { id: "to-opens-day", points: fromStart(COL[0]), chip: `× ${opensText(v.opens)}`, chipAt: [COL[0], 107], input: "opens", rate: rates.opensDay, tone: "accent" },
    { id: "to-opens-avg", points: down(COL[0], 0), chip: `÷ ${withCommas(SECONDS_PER_DAY)} s`, chipAt: mid(COL[0], 0), rate: rates.opensAverage, tone: "accent" },
    { id: "to-opens-peak", points: down(COL[0], 1), chip: `× ${PEAK_FACTOR} peak (assumed)`, chipAt: mid(COL[0], 1), rate: rates.opensPeak, tone: peakTone },
    { id: "to-lookups", points: down(COL[0], 2), chip: `× ${v.follows} follows`, chipAt: mid(COL[0], 2), input: "follows", rate: rates.lookups, tone: ringed === "lookups" ? "warn" : "accent" },
    { id: "to-posts-day", points: fromStart(COL[1]), chip: `× ${POSTS_PER_USER} (assumed)`, chipAt: [COL[1], 107], rate: rates.postsDay, tone: "accent" },
    { id: "to-posts-avg", points: down(COL[1], 0), chip: `÷ ${withCommas(SECONDS_PER_DAY)} s`, chipAt: mid(COL[1], 0), rate: rates.postsAverage, tone: "accent" },
    { id: "to-posts-peak", points: down(COL[1], 1), chip: `× ${PEAK_FACTOR} peak (assumed)`, chipAt: mid(COL[1], 1), rate: rates.postsPeak, tone: "accent" },
    { id: "to-storage", points: fromStart(COL[2]), chip: `× ${IDS_PER_TIMELINE} ids × ${BYTES_PER_ID} B`, chipAt: [COL[2], 107], rate: rates.storage, tone: "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringText = ringed === "lookups" ? "The lookups card is ringed." : ringed === "opens" ? "The peak feed opens card is ringed." : "No card is ringed.";
  const description = `Hikaya estimate. ${formatCount(v.users)} daily users, ${v.follows} follows per account, ${opensText(v.opens)} each a day. ${tail}, ${bytesInWords(r.storageBytes)} of timelines, ${r.readsPerPost} reads for each post. ${verdict.text}. ${ringText}`;

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
