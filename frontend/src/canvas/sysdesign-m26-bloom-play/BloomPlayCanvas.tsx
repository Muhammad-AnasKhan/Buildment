"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatCount } from "../models/envelope-estimate";
import {
  barShares,
  bitsText,
  bloomPlan,
  bloomRates,
  bloomTail,
  bloomVerdict,
  ERROR_DEFAULT,
  ERROR_STEPS,
  errorText,
  gbText,
  hashesText,
  sizeText,
  skippedText,
  URL_STEPS,
  URLS_DEFAULT,
} from "../models/crawl-bloom";

type Values = { urls: number; error: number };
type InputId = keyof Values;

const W = 420;
const H = 428;
const CARD_W = 136;
const LEFT = 74;
const RIGHT = 346;
const ROW = [66, 136, 206] as const;
const BARS = { y: [270, 308, 346], x0: 142, x1: 346, h: 18 } as const;
const BAR_W = BARS.x1 - BARS.x0;

/** 26.4: DalilBot's seen set as a Bloom filter; drag the URLs and the error, compare the memory. */
export function BloomPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<Values>({ urls: URLS_DEFAULT, error: ERROR_DEFAULT });
  const [selected, setSelected] = useState<InputId>("error");

  const p = bloomPlan(v.urls, v.error);
  const verdict = bloomVerdict(p);
  const tail = bloomTail(p);
  const rates = bloomRates(p);
  const shares = barShares(p);

  const inputs: ChainInput[] = [
    { id: "urls", label: "URLs known", steps: URL_STEPS, value: v.urls, format: formatCount, valueText: `${tail}` },
    { id: "error", label: "Error rate", steps: ERROR_STEPS, value: v.error, format: errorText, valueText: `${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "urls", x: LEFT, y: ROW[0], w: CARD_W, value: formatCount(v.urls), label: "URLs known", input: "urls" },
    { id: "error", x: RIGHT, y: ROW[0], w: CARD_W, value: errorText(v.error), label: "error rate", input: "error" },
    { id: "bits", x: RIGHT, y: ROW[1], w: CARD_W, value: bitsText(p.bitsPerUrl), label: "per URL" },
    { id: "hashes", x: RIGHT, y: ROW[2], w: CARD_W, value: hashesText(p.hashes), label: "per URL checked" },
    { id: "bloom", x: LEFT, y: ROW[2], w: CARD_W, value: gbText(p.bloomGb), label: "Bloom filter memory", tone: verdict.tone, mark: verdict.tone },
  ];

  const links: ChainLink[] = [
    { id: "to-bits", points: [[RIGHT, ROW[0]], [RIGHT, ROW[1]]], chip: "-ln p ÷ 0.48", chipAt: [RIGHT, 101], rate: rates.bits, tone: "accent" },
    { id: "to-hashes", points: [[RIGHT, ROW[1]], [RIGHT, ROW[2]]], chip: "× 0.69", chipAt: [RIGHT, 171], rate: rates.hashes, tone: "accent" },
    { id: "to-bloom", points: [[LEFT, ROW[0]], [LEFT, ROW[2]]], chip: "× bits ÷ 8", chipAt: [LEFT, 136], rate: rates.memory, tone: "accent" },
    { id: "bits-to-bloom", points: [[RIGHT, ROW[1]], [210, ROW[1]], [210, ROW[2]], [LEFT, ROW[2]]], rate: rates.memory, tone: "accent" },
  ];

  const bars = [
    { id: "bloom", label: "Bloom filter", gb: p.bloomGb, share: shares.bloom, ringed: true },
    { id: "exact", label: "Exact fingerprints", gb: p.exactGb, share: shares.exact, ringed: false },
    { id: "strings", label: "URL strings", gb: p.stringsGb, share: shares.strings, ringed: false },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const description = `Bloom filter for the seen set. ${tail}. About ${skippedText(p.skippedPerBillion)} of every billion new URLs are wrongly skipped. Exact 8 byte fingerprints would take ${sizeText(p.exactGb)} and the URL strings ${sizeText(p.stringsGb)}. ${verdict.text}. The Bloom filter bar is ringed.`;

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
            <g>
              <text x={12} y={BARS.y[0] - 20} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>Memory, on one scale</text>
              {bars.map((b, i) => {
                const y = BARS.y[i];
                return (
                  <g key={b.id}>
                    {b.ringed ? <rect x={6} y={y - 7} width={408} height={BARS.h + 14} rx={12} strokeWidth={2.5} className={cn("fill-none", TONES[verdict.tone].stroke)} /> : null}
                    <text x={14} y={y + 13.5} className={cn(NEUTRAL.text, "text-[12px] font-medium")}>{b.label}</text>
                    <rect x={BARS.x0} y={y} width={BAR_W} height={BARS.h} rx={5} className="fill-muted" />
                    <rect
                      x={BARS.x0}
                      y={y}
                      width={BAR_W}
                      height={BARS.h}
                      rx={5}
                      style={{ transform: `scaleX(${Math.max(3 / BAR_W, b.share)})`, transformBox: "fill-box", transformOrigin: "left center" }}
                      className={cn(b.ringed ? TONES[verdict.tone].solidFill : "fill-muted-foreground/60", "transition-transform duration-200 motion-reduce:transition-none")}
                    />
                    <text x={406} y={y + 14} textAnchor="end" className={cn(b.ringed ? TONES[verdict.tone].text : NEUTRAL.text, "text-[14px] font-bold tabular-nums")}>
                      {sizeText(b.gb)}
                    </text>
                  </g>
                );
              })}
              <rect x={6} y={382} width={408} height={34} rx={12} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
              <text x={W / 2} y={403} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-semibold tabular-nums")}>
                {`${skippedText(p.skippedPerBillion)} skipped per billion new URLs`}
              </text>
            </g>
          }
        />
      </div>
    </BeatFrame>
  );
}
