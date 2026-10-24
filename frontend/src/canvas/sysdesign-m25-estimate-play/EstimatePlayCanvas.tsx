"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { NEUTRAL } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatCount } from "../models/envelope-estimate";
import {
  CHECKOUT_SECONDS,
  DEFAULT_FANS,
  DEFAULT_SEATS,
  dropRates,
  dropRing,
  dropTail,
  dropVerdict,
  estimateDrop,
  FAN_STEPS,
  FIRST_SECONDS,
  FIRST_SHARE_PERCENT,
  moneyText,
  percentText,
  perSeat,
  perSecond,
  REQUESTS_PER_FAN,
  SEAT_STEPS,
  TICKET_PRICE,
  type DropInputs,
} from "../models/ticket-drop";

type InputId = keyof DropInputs;

const W = 420;
const H = 312;
const COL = [72, 210, 348] as const;
const ROW = [66, 150, 234] as const;
const BUS_Y = 96;
const CARD_W = 128;

const fromTop = (x: number, row: 0 | 1 | 2 = 1): [number, number][] => [[x, ROW[0]], [x, ROW[row]]];

/** 25.1 beat 2: Tazkara's ticket drop as three chains; drag the fans and the seats. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<DropInputs>({ fans: DEFAULT_FANS, seats: DEFAULT_SEATS });
  const [selected, setSelected] = useState<InputId>("fans");

  const r = estimateDrop(v);
  const verdict = dropVerdict(r);
  const ring = dropRing(r);
  const rates = dropRates(r);
  const tail = dropTail(v, r);

  const inputs: ChainInput[] = [
    { id: "fans", label: "Fans waiting", steps: FAN_STEPS, value: v.fans, format: formatCount, valueText: tail },
    { id: "seats", label: "Seats", steps: SEAT_STEPS, value: v.seats, format: formatCount, valueText: tail },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const failedRing = ring === "failed";
  const cards: ChainCard[] = [
    { id: "fans", x: COL[0], y: ROW[0], w: CARD_W, value: formatCount(v.fans), label: "fans waiting", input: "fans" },
    { id: "seats", x: COL[2], y: ROW[0], w: CARD_W, value: formatCount(v.seats), label: "seats", input: "seats" },
    { id: "fansPerSecond", x: COL[0], y: ROW[1], w: CARD_W, value: perSecond(r.fansPerSecond), label: "fans a second" },
    { id: "requests", x: COL[0], y: ROW[2], w: CARD_W, value: perSecond(r.requestsPerSecond), label: "requests, at peak" },
    { id: "perSeat", x: COL[1], y: ROW[1], w: CARD_W, value: perSeat(r.fansPerSeat), label: "fans competing" },
    { id: "failed", x: COL[1], y: ROW[2], w: CARD_W, value: percentText(r.failPercent), label: "of holds must fail", tone: failedRing ? "warn" : undefined, mark: failedRing ? "warn" : undefined },
    { id: "payments", x: COL[2], y: ROW[1], w: CARD_W, value: perSecond(r.paymentsPerSecond), label: "payments a second", tone: failedRing ? undefined : "warn", mark: failedRing ? undefined : "warn" },
    { id: "money", x: COL[2], y: ROW[2], w: CARD_W, value: moneyText(r.moneyMoved), label: "money moved, 2 min" },
  ];

  const links: ChainLink[] = [
    { id: "to-fans-second", points: fromTop(COL[0]), chip: `x ${FIRST_SHARE_PERCENT}%, ÷ ${FIRST_SECONDS} s`, chipAt: [COL[0], 116], rate: rates.fansPerSecond, tone: "accent" },
    { id: "to-requests", points: [[COL[0], ROW[1]], [COL[0], ROW[2]]], chip: `x ${REQUESTS_PER_FAN} requests`, chipAt: [COL[0], 192], rate: rates.requests, tone: "accent" },
    { id: "fans-to-seat", points: [[COL[0], ROW[0]], [COL[0], BUS_Y], [COL[1], BUS_Y], [COL[1], ROW[1]]], chip: "fans ÷ seats", chipAt: [COL[1], 122], rate: rates.fansPerSeat, tone: "accent" },
    { id: "seats-to-seat", points: [[COL[2], ROW[0]], [COL[2], BUS_Y], [COL[1], BUS_Y]], rate: rates.fansPerSeat, tone: "accent" },
    { id: "to-failed", points: [[COL[1], ROW[1]], [COL[1], ROW[2]]], chip: "1 - seats / holds", chipAt: [COL[1], 192], rate: rates.failed, tone: failedRing ? "warn" : "accent" },
    { id: "to-payments", points: fromTop(COL[2]), chip: `÷ ${CHECKOUT_SECONDS} s`, chipAt: [COL[2], 116], rate: rates.payments, tone: failedRing ? "accent" : "warn" },
    { id: "to-money", points: [[COL[2], ROW[1]], [COL[2], ROW[2]]], chip: `x ${TICKET_PRICE} a ticket`, chipAt: [COL[2], 192], rate: rates.money, tone: "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const ringText = failedRing ? "The share of holds that must fail is ringed." : "The payments a second card is ringed.";
  const description = `Tazkara ticket drop. ${tail}. ${verdict.text}. ${ringText}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<StepSlider input={sel} onChange={onChange} />}
      hint={
        <>
          Tap <b>fans</b> or <b>seats</b> in the picture, then drag it sideways or use the slider.
        </>
      }
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
            <g aria-hidden>
              <text x={14} y={H - 24} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                Assumed, not measured: half the fans arrive in 10 s,
              </text>
              <text x={14} y={H - 8} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
                4 requests and 1 hold each, 2 minutes to pay, 80 a ticket.
              </text>
            </g>
          }
        />
      </div>
    </BeatFrame>
  );
}
