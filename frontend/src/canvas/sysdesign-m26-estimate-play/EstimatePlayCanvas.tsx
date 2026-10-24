"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { NEUTRAL } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatCount } from "../models/envelope-estimate";
import { withCommas } from "../models/picture-controls";
import { DEFAULT_PAGES, DEFAULT_PAGE_KB, DEFAULT_WAIT } from "../models/crawl-numbers";
import {
  chainRates,
  crawlEstimate,
  driver,
  estimateTail,
  estimateVerdict,
  kbText,
  mbitText,
  PAGE_STEPS,
  rate,
  SIZE_STEPS,
  sitesText,
  terabytes,
  WAIT_STEPS,
  waitText,
  type CrawlInputs,
} from "../models/crawl-estimate";

type InputId = keyof CrawlInputs;

const W = 420;
const H = 348;
const CARD_W = 136;
const LEFT = 74;
const RIGHT = 346;
const ROW = [66, 140, 210, 280] as const;
const BUS_X = 168;

/** 26.1: DalilBot's estimate as two chains from one card; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<CrawlInputs>({ pages: DEFAULT_PAGES, sizeKb: DEFAULT_PAGE_KB, wait: DEFAULT_WAIT });
  const [selected, setSelected] = useState<InputId>("pages");

  const r = crawlEstimate(v);
  const verdict = estimateVerdict(r);
  const ring = driver(r);
  const tail = estimateTail(r);
  const rates = chainRates(r);

  const inputs: ChainInput[] = [
    { id: "pages", label: "Pages a month", steps: PAGE_STEPS, value: v.pages, format: formatCount, valueText: `${formatCount(v.pages)} pages a month, ${tail}` },
    { id: "sizeKb", label: "Page size", steps: SIZE_STEPS, value: v.sizeKb, format: kbText, valueText: `${v.sizeKb} KB a page, ${tail}` },
    { id: "wait", label: "Wait between requests to one site", steps: WAIT_STEPS, value: v.wait, format: waitText, valueText: `${waitText(v.wait)} between requests to one site, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "pages", x: LEFT, y: ROW[0], w: CARD_W, value: formatCount(v.pages), label: "pages a month", input: "pages" },
    { id: "perSecond", x: LEFT, y: ROW[1], w: CARD_W, value: rate(r.perSecond), label: "pages a second" },
    { id: "sites", x: LEFT, y: ROW[2], w: CARD_W, value: sitesText(r.sites), label: "busy at once", tone: ring === "sites" ? "warn" : undefined, mark: ring === "sites" ? "warn" : undefined },
    { id: "stored", x: RIGHT, y: ROW[0], w: CARD_W, value: terabytes(r.storedTb), label: "stored a month", tone: ring === "storage" ? "warn" : undefined, mark: ring === "storage" ? "warn" : undefined },
    { id: "mbit", x: RIGHT, y: ROW[1], w: CARD_W, value: mbitText(r.mbit), label: "data coming in", tone: ring === "bandwidth" ? "warn" : undefined, mark: ring === "bandwidth" ? "warn" : undefined },
    { id: "inFlight", x: RIGHT, y: ROW[2], w: CARD_W, value: withCommas(r.inFlight), label: "fetches in flight" },
    { id: "linkChecks", x: RIGHT, y: ROW[3], w: CARD_W, value: rate(r.linkChecks), label: "link checks a second" },
  ];

  const links: ChainLink[] = [
    { id: "to-per-second", points: [[LEFT, ROW[0]], [LEFT, ROW[1]]], chip: "÷ 2,592,000 s", chipAt: [LEFT, 103], rate: rates.perSecond, tone: "accent" },
    { id: "to-sites", points: [[LEFT, ROW[1]], [LEFT, ROW[2]]], chip: `× ${v.wait} s wait`, chipAt: [LEFT, 175], input: "wait", rate: rates.sites, tone: ring === "sites" ? "warn" : "accent" },
    { id: "to-stored", points: [[LEFT, ROW[0]], [RIGHT, ROW[0]]], chip: `× ${v.sizeKb} KB ÷ 4`, chipAt: [210, ROW[0]], input: "sizeKb", rate: rates.stored, tone: ring === "storage" ? "warn" : "accent" },
    { id: "to-mbit", points: [[LEFT, ROW[1]], [RIGHT, ROW[1]]], chip: `× ${v.sizeKb} KB × 8`, chipAt: [225, ROW[1]], input: "sizeKb", rate: rates.mbit, tone: ring === "bandwidth" ? "warn" : "accent" },
    { id: "to-in-flight", points: [[LEFT, ROW[1]], [BUS_X, ROW[1]], [BUS_X, ROW[2]], [RIGHT, ROW[2]]], chip: "× 0.5 s", chipAt: [225, ROW[2]], rate: rates.inFlight, tone: "accent" },
    { id: "to-link-checks", points: [[LEFT, ROW[1]], [BUS_X, ROW[1]], [BUS_X, ROW[3]], [RIGHT, ROW[3]]], chip: "× 50 links", chipAt: [225, ROW[3]], rate: rates.linkChecks, tone: "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringText =
    ring === "bandwidth" ? "The data coming in card is ringed." : ring === "sites" ? "The sites busy at once card is ringed." : ring === "storage" ? "The stored a month card is ringed." : "No card is ringed.";
  const description = `DalilBot estimate. ${formatCount(v.pages)} pages a month, ${v.sizeKb} KB a page, ${waitText(v.wait)} between requests to one site. ${tail}. ${verdict.text}. ${ringText}`;

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
          footer={
            <text x={W / 2} y={H - 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
              Assumptions: 0.5 s a fetch, 50 links a page, 4 to 1 saving
            </text>
          }
        />
      </div>
    </BeatFrame>
  );
}
