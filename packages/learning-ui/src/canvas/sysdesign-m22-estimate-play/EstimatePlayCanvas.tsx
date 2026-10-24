"use client";

import { useRef, useState } from "react";
import { BeatFrame } from "../primitives/beat-frame";
import { EstimateChain, StepSlider, type ChainCard, type ChainInput, type ChainLink } from "../primitives/estimate-chain";
import { useBeatClock } from "../primitives/use-beat-clock";
import { formatBytes, formatCount } from "../models/envelope-estimate";
import {
  chainRates,
  chatEstimate,
  driver,
  estimateTail,
  estimateVerdict,
  gatewaysText,
  linesText,
  MESSAGE_STEPS,
  ONLINE_STEPS,
  onlineText,
  ratePerSecond,
  ringText,
  USER_STEPS,
  type ChatInputs,
} from "../models/dardasha-estimate";
import { DAILY_USERS, MESSAGES_PER_USER, ONLINE_SHARE } from "../models/dardasha-numbers";

type InputId = keyof ChatInputs;

const W = 420;
const H = 430;
const START = { x: 210, y: 66 };
const A = 70;
const B = 210;
const C = 350;
const ROW = [146, 226, 306, 386] as const;
const BUS_Y = 92;

/** 22.1: Dardasha's estimate as three chains from one card; drag the blue numbers. */
export function EstimatePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const { seconds, reduced } = useBeatClock(box);
  const [v, setV] = useState<ChatInputs>({ users: DAILY_USERS, perUser: MESSAGES_PER_USER, online: ONLINE_SHARE });
  const [selected, setSelected] = useState<InputId>("users");

  const r = chatEstimate(v);
  const verdict = estimateVerdict(r);
  const ring = driver(r);
  const tail = estimateTail(r);
  const rates = chainRates(r);

  const inputs: ChainInput[] = [
    { id: "users", label: "Daily users", steps: USER_STEPS, value: v.users, format: formatCount, valueText: `${formatCount(v.users)} daily users, ${v.perUser} messages each, ${tail}` },
    { id: "perUser", label: "Messages per user a day", steps: MESSAGE_STEPS, value: v.perUser, format: (n) => `${n} messages`, valueText: `${v.perUser} messages per user a day, ${formatCount(v.users)} daily users, ${tail}` },
    { id: "online", label: "Devices online at peak", steps: ONLINE_STEPS, value: v.online, format: onlineText, valueText: `${onlineText(v.online)} of devices online at peak, ${formatCount(v.users)} daily users, ${tail}` },
  ];
  const onChange = (id: string, value: number) => setV((old) => ({ ...old, [id]: value }));

  const cards: ChainCard[] = [
    { id: "start", x: START.x, y: START.y, w: 168, h: 40, value: formatCount(v.users), label: "daily users", input: "users" },
    { id: "day", x: B, y: ROW[0], value: formatCount(r.messagesPerDay), label: "messages a day" },
    { id: "average", x: B, y: ROW[1], value: ratePerSecond(r.averagePerSecond), label: "messages, average" },
    { id: "peak", x: B, y: ROW[2], value: ratePerSecond(r.peakPerSecond), label: "messages, at peak", tone: ring === "peak" ? "warn" : undefined, mark: ring === "peak" ? "warn" : undefined },
    { id: "deliveries", x: B, y: ROW[3], value: ratePerSecond(r.deliveriesPerSecond), label: "deliveries, at peak" },
    { id: "lines", x: C, y: ROW[0], value: linesText(r.openLines), label: "open lines", tone: ring === "lines" ? "warn" : undefined, mark: ring === "lines" ? "warn" : undefined },
    { id: "gateways", x: C, y: ROW[1], value: gatewaysText(r.gateways), label: "50,000 lines each" },
    { id: "storage", x: A, y: ROW[1], value: formatBytes(r.storageBytes), label: "storage a year", tone: ring === "storage" ? "warn" : undefined, mark: ring === "storage" ? "warn" : undefined },
  ];

  const down = (x: number, a: number, b: number): [number, number][] => [[x, a], [x, b]];
  const mid = (x: number, a: number, b: number): [number, number] => [x, (a + b) / 2];
  const links: ChainLink[] = [
    { id: "to-day", points: down(B, START.y, ROW[0]), chip: `× ${v.perUser} messages`, chipAt: [B, 108], input: "perUser", rate: rates.day, tone: "accent" },
    { id: "to-average", points: down(B, ROW[0], ROW[1]), chip: "÷ 86,400 s", chipAt: mid(B, ROW[0], ROW[1]), rate: rates.average, tone: "accent" },
    { id: "to-peak", points: down(B, ROW[1], ROW[2]), chip: "× 3 peak (assumed)", chipAt: mid(B, ROW[1], ROW[2]), rate: rates.peak, tone: ring === "peak" ? "warn" : "accent" },
    { id: "to-deliveries", points: down(B, ROW[2], ROW[3]), chip: "× 3 recipients (assumed)", chipAt: mid(B, ROW[2], ROW[3]), rate: rates.deliveries, tone: "accent" },
    { id: "to-lines", points: [[START.x, START.y], [START.x, BUS_Y], [C, BUS_Y], [C, ROW[0]]], chip: `× 1.5 × ${onlineText(v.online)}`, chipAt: [C, 108], input: "online", rate: rates.lines, tone: ring === "lines" ? "warn" : "accent" },
    { id: "to-gateways", points: down(C, ROW[0], ROW[1]), chip: "÷ 50,000 lines", chipAt: mid(C, ROW[0], ROW[1]), rate: rates.gateways, tone: ring === "lines" ? "warn" : "accent" },
    { id: "to-storage", points: [[B, ROW[0]], [A, ROW[0]], [A, ROW[1]]], chip: "× 365 × 300 B", chipAt: [A, 186], rate: rates.storage, tone: ring === "storage" ? "warn" : "accent" },
  ];

  const sel = inputs.find((i) => i.id === selected) ?? inputs[0];
  const description = `Dardasha estimate. ${formatCount(v.users)} daily users, ${v.perUser} messages each a day, ${onlineText(v.online)} of devices online at peak. ${tail}. ${verdict.text}. ${ringText(ring)}`;

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
