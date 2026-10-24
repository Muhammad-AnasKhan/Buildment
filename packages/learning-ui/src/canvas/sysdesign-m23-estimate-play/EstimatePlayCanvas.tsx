"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatCount } from "../models/envelope-estimate";
import {
  CALL_STEPS,
  defaultInputs,
  gbText,
  PRODUCT_STEPS,
  perSecond,
  rings,
  SEARCH_STEPS,
  searchEstimate,
  searchRates,
  searchTail,
  searchVerdict,
  SHOPPER_STEPS,
  shardsText,
  shoppersText,
  type SearchInputs,
} from "../models/search-estimate";

type InputId = keyof SearchInputs;

const W = 420;
const H = 304;
const COL = { a: 68, b: 210, c: 352 } as const;
const ROW = [84, 174, 264] as const;
const CARD_W = 124;

/** 23.1: Dalil's estimate as three chains; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<SearchInputs>(defaultInputs);
  const [selected, setSelected] = useState<InputId>("shoppers");

  const r = searchEstimate(v);
  const verdict = searchVerdict(r);
  const ring = rings(r);
  const tail = searchTail(r);
  const rate = searchRates(r);

  const inputs: ChainInput[] = [
    { id: "shoppers", label: "Shoppers a day", steps: SHOPPER_STEPS, value: v.shoppers, format: formatCount, valueText: `${shoppersText(v.shoppers)}, ${tail}` },
    { id: "searches", label: "Searches for each shopper", steps: SEARCH_STEPS, value: v.searches, format: (n) => `${n} ${n === 1 ? "search" : "searches"}`, valueText: `${v.searches} searches for each shopper, ${tail}` },
    { id: "calls", label: "Suggestion calls for each search", steps: CALL_STEPS, value: v.calls, format: (n) => `${n} ${n === 1 ? "call" : "calls"}`, valueText: `${v.calls} suggestion calls for each search, ${tail}` },
    { id: "products", label: "Products", steps: PRODUCT_STEPS, value: v.products, format: formatCount, valueText: `${formatCount(v.products)} products, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "shoppers", x: COL.a, y: ROW[0], w: CARD_W, value: formatCount(v.shoppers), label: "shoppers a day", input: "shoppers" },
    { id: "searches", x: COL.a, y: ROW[1], w: CARD_W, value: formatCount(r.searchesPerDay), label: "searches a day" },
    { id: "searchPeak", x: COL.a, y: ROW[2], w: CARD_W, value: perSecond(r.searchPeak), label: "searches, peak" },
    { id: "suggest", x: COL.b, y: ROW[2], w: CARD_W, value: perSecond(r.suggestPeak), label: "suggestions, peak", tone: ring.suggest ? "warn" : undefined, mark: ring.suggest ? "warn" : undefined },
    { id: "products", x: COL.c, y: ROW[0], w: CARD_W, value: formatCount(v.products), label: "products", input: "products" },
    { id: "index", x: COL.c, y: ROW[1], w: CARD_W, value: gbText(r.indexGb), label: "index size" },
    { id: "shards", x: COL.c, y: ROW[2], w: CARD_W, value: shardsText(r.shards), label: "of 10 GB each", tone: ring.shards ? "warn" : undefined, mark: ring.shards ? "warn" : undefined },
  ];

  const links: ChainLink[] = [
    { id: "to-searches", points: [[COL.a, ROW[0]], [COL.a, ROW[1]]], chip: `× ${v.searches} searches each`, chipAt: [COL.a, 129], input: "searches", rate: rate.searches, tone: "accent" },
    { id: "to-search-peak", points: [[COL.a, ROW[1]], [COL.a, ROW[2]]], chip: "÷ 86,400 × 3 peak", chipAt: [COL.a, 219], rate: rate.searchPeak, tone: "accent" },
    { id: "to-calls", points: [[COL.a + CARD_W / 2, ROW[1]], [COL.b, ROW[1]]], chip: `× ${v.calls} calls each`, chipAt: [COL.b - 24, ROW[1]], input: "calls", rate: rate.calls, tone: "accent" },
    { id: "to-suggest", points: [[COL.b, ROW[1]], [COL.b, ROW[2]]], chip: "÷ 86,400 × 3 peak", chipAt: [COL.b, 219], rate: rate.suggestPeak, tone: ring.suggest ? "warn" : "accent" },
    { id: "to-index", points: [[COL.c, ROW[0]], [COL.c, ROW[1]]], chip: "× 100 words × 4 B", chipAt: [COL.c, 129], rate: rate.index, tone: "accent" },
    { id: "to-shards", points: [[COL.c, ROW[1]], [COL.c, ROW[2]]], chip: "÷ 10 GB a shard", chipAt: [COL.c, 219], rate: rate.shards, tone: ring.shards ? "warn" : "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringed = [ring.suggest ? "the suggestions card" : "", ring.shards ? "the shards card" : ""].filter(Boolean).join(" and ");
  const ringText = ringed ? `Ringed: ${ringed}.` : "No card is ringed.";
  const description = `Dalil estimate. ${shoppersText(v.shoppers)}, ${v.searches} searches each, ${v.calls} suggestion calls for each search, ${formatCount(v.products)} products. ${tail}. ${verdict.text}. ${ringText}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<StepSlider input={sel} onChange={onChange} />}
      hint={<>Tap a <b>blue number</b> in the picture, then drag it sideways or use the slider. Grey chips are assumed.</>}
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
