"use client";

import { useId, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { formatAddressNumber, numberToBits, numberToIp, wrapWords } from "../models/net-address";
import {
  cidrAt,
  compareBits,
  rangeNumbers,
  rangeOf,
  relate,
  relationText,
  slotOf,
  windowSlots,
  type OverlapConfig,
} from "../models/net-subnet";
import { Caption, ControlButton } from "./bit-parts";
import { BitStrip, NativeRange, W, stripX } from "./net-parts";

type Props = { title: string; purpose: string; limits: string; config: OverlapConfig };

/** The overlap mode: blocks as ranges on one line, and the bits that make valid blocks nest or stay apart. */
export function OverlapView(props: Props) {
  return props.config.view === "line" ? <LineView {...props} /> : <NestView {...props} />;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** The short banner sentence and tone for how two blocks relate. */
function bannerFor(kind: "same" | "contains" | "inside" | "apart", adjacent: boolean, fixedName: string, movingName: string): { text: string; tone: Tone } {
  if (kind === "same") return { text: `Overlap: ${movingName} is the same block`, tone: "warn" };
  if (kind === "contains") return { text: `Overlap: ${movingName} is inside ${fixedName}`, tone: "warn" };
  if (kind === "inside") return { text: `Overlap: ${fixedName} is inside ${movingName}`, tone: "warn" };
  return { text: adjacent ? "No overlap: the blocks only touch" : "No overlap: the blocks are apart", tone: "good" };
}

// ---------------------------------------------------------------- line: ranges on one number line

const LINE_H = 388;
const AX0 = 12;
const AX1 = 408;
const AXIS = 172;

function LineView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const win = rangeOf(config.window);
  const fixed = rangeOf(config.fixed);
  const start = rangeOf(config.moving);
  const slots = windowSlots(config.window, start.prefix);
  const initial = slotOf(config.window, start.prefix, start.start);
  const [slot, setSlot] = useState(initial);

  const moving = rangeOf(cidrAt(slots.start(slot), start.prefix));
  const rel = relate(fixed, moving);
  const banner = bannerFor(rel.kind, rel.adjacent, config.fixedName, config.movingName);
  const x = (n: number) => AX0 + ((n - win.start) / win.size) * (AX1 - AX0);
  const edge = (a: { start: number; end: number }) => ({ left: x(a.start), right: Math.max(x(a.start) + 4, x(a.end + 1)) });
  const f = edge(fixed);
  const m = edge(moving);
  const overlapEdge = rel.overlap ? edge(rel.overlap) : null;

  const labelAt = (left: number, right: number, text: string) => {
    const centre = (left + right) / 2;
    const half = (text.length * 6.9) / 2;
    if (centre - half < AX0) return { x: AX0, anchor: "start" as const };
    if (centre + half > AX1) return { x: AX1, anchor: "end" as const };
    return { x: centre, anchor: "middle" as const };
  };
  const fixedLabel = `${config.fixedName} ${fixed.cidr}`;
  const movingLabel = `${config.movingName} ${moving.cidr}`;
  const fl = labelAt(f.left, f.right, fixedLabel);
  const ml = labelAt(m.left, m.right, movingLabel);
  const ticks = [0, 1, 2, 3].map((q) => win.start + (q * win.size) / 4);
  const summary = `${banner.text}. ${relationText({ name: config.fixedName, range: fixed }, { name: config.movingName, range: moving })} ${config.fixedName} runs ${rangeNumbers(fixed)}. ${config.movingName} runs ${rangeNumbers(moving)}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Slide the {config.movingName.toLowerCase()} network along the line.</>}
      controls={<ControlButton onClick={() => setSlot(initial)}>Reset</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${LINE_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={LINE_H} />
        <Caption x={AX0} y={66} anchor="start">every address is a number; a block is a stretch of them</Caption>

        <g aria-hidden="true">
          <line x1={AX0} x2={AX1} y1={AXIS} y2={AXIS} strokeWidth={2} strokeLinecap="round" className={NEUTRAL.faintStroke} />
          {ticks.map((t) => (
            <line key={t} x1={x(t)} x2={x(t)} y1={AXIS - 5} y2={AXIS + 5} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          ))}
          <rect x={f.left} y={AXIS - 46} width={f.right - f.left} height={36} rx={6} strokeWidth={2} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
          <text x={fl.x} y={AXIS - 56} textAnchor={fl.anchor} className={cn(TONES.accent.text, "text-[13px] font-bold tabular-nums")}>{fixedLabel}</text>
          {overlapEdge ? (
            <rect x={overlapEdge.left - 3} y={AXIS - 52} width={overlapEdge.right - overlapEdge.left + 6} height={108} rx={6} strokeWidth={2.5} strokeDasharray="6 4" className={cn("fill-transparent", TONES.warn.stroke)} />
          ) : null}
          <rect x={m.left} y={AXIS + 10} width={m.right - m.left} height={36} rx={6} strokeWidth={2} className={cn(TONES[rel.overlap ? "warn" : "good"].softFill, TONES[rel.overlap ? "warn" : "good"].stroke, SHAPE_TRANSITION)} />
          <text x={ml.x} y={AXIS + 76} textAnchor={ml.anchor} className={cn(TONES[rel.overlap ? "warn" : "good"].text, "text-[13px] font-bold tabular-nums")}>{movingLabel}</text>
          {ticks.map((t, k) => (
            <Caption key={t} x={k === 0 ? AX0 : x(t)} y={AXIS + 102} anchor={k === 0 ? "start" : "middle"}>{numberToIp(t)}</Caption>
          ))}

          <text x={AX0} y={AXIS + 134} className={cn(TONES.accent.text, "text-[14.5px] font-bold tabular-nums")}>{fixedLabel}</text>
          <text x={AX0} y={AXIS + 153} className={cn(NEUTRAL.text, "text-[14px] tabular-nums")}>{`${rangeNumbers(fixed)}, ${formatAddressNumber(fixed.size)} ${plural(fixed.size, "address", "addresses")}`}</text>
          <text x={AX0} y={AXIS + 178} className={cn(TONES[rel.overlap ? "warn" : "good"].text, "text-[14.5px] font-bold tabular-nums")}>{movingLabel}</text>
          <text x={AX0} y={AXIS + 197} className={cn(NEUTRAL.text, "text-[14px] tabular-nums")}>{`${rangeNumbers(moving)}, ${formatAddressNumber(moving.size)} ${plural(moving.size, "address", "addresses")}`}</text>
        </g>
        <VerdictBanner width={W} text={banner.text} tone={banner.tone} />
      </svg>
      <div className="mt-2 px-1 pb-1">
        <NativeRange
          label={`Slide the ${config.movingName.toLowerCase()} network`}
          valueText={moving.cidr}
          value={slot}
          min={0}
          max={slots.count - 1}
          onChange={setSlot}
          minLabel={numberToIp(win.start)}
          maxLabel={numberToIp(win.end)}
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- nest: valid blocks nest or stay apart

const NEST_H = 276;

function NestView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const win = rangeOf(config.window);
  const fixed = rangeOf(config.fixed);
  const first = rangeOf(config.moving);
  const minPrefix = config.minPrefix ?? win.prefix;
  const maxPrefix = config.maxPrefix ?? 28;
  const [prefix, setPrefix] = useState(first.prefix);
  const [start, setStart] = useState(first.start);

  const slots = windowSlots(config.window, prefix);
  const slot = slotOf(config.window, prefix, start);
  const moving = rangeOf(cidrAt(slots.start(slot), prefix));
  const rel = relate(fixed, moving);
  const bits = compareBits(fixed, moving);
  const banner = bannerFor(rel.kind, rel.adjacent, config.fixedName, config.movingName);
  const sentence = relationText({ name: config.fixedName, range: fixed }, { name: config.movingName, range: moving });
  const shared = rel.overlap ? `They share ${formatAddressNumber(rel.overlap.size)} ${plural(rel.overlap.size, "address", "addresses")}: ${rangeNumbers(rel.overlap)}.` : "";
  const lines = [...wrapWords(sentence, 56), ...wrapWords(shared, 56)].filter(Boolean);
  const agreeTo = bits.firstDiff ?? bits.shared;
  const summary = [banner.text + ".", sentence, shared, bits.nested ? `The first ${bits.shared} bits agree.` : `The first difference is bit ${(bits.firstDiff ?? 0) + 1} of 32.`].filter(Boolean).join(" ");
  const bracketX1 = agreeTo > 0 ? stripX(agreeTo - 1) + 11 : null;

  const reset = () => {
    setPrefix(first.prefix);
    setStart(first.start);
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Change the size and the place. Blocks nest or stay apart, never half overlap.</>}
      controls={<ControlButton onClick={reset}>Reset</ControlButton>}
    >
      <svg viewBox={`0 0 ${W} ${NEST_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={NEST_H} />

        <Caption x={8} y={62} anchor="start" strong>{`${config.fixedName} ${fixed.cidr}`}</Caption>
        <BitStrip bits={numberToBits(fixed.start)} y={68} tinted={fixed.prefix} marked={bits.firstDiff} markTone="warn" />
        <Caption x={8} y={118} anchor="start" strong>{`${config.movingName} ${moving.cidr}`}</Caption>
        <BitStrip bits={numberToBits(moving.start)} y={124} tinted={moving.prefix} marked={bits.firstDiff} markTone="warn" />

        <g aria-hidden="true">
          {bracketX1 !== null ? <line x1={stripX(0)} x2={bracketX1} y1={158} y2={158} strokeWidth={3} strokeLinecap="round" className={TONES.accent.stroke} /> : null}
          <text x={W / 2} y={180} textAnchor="middle" className={cn(bits.nested ? TONES.accent.text : TONES.warn.text, "text-[14.5px] font-bold tabular-nums")}>
            {bits.nested ? `The first ${bits.shared} bits agree` : `Bit ${(bits.firstDiff ?? 0) + 1} differs: the blocks cannot nest`}
          </text>
          {lines.map((line, k) => (
            <text key={k} x={W / 2} y={208 + k * 19} textAnchor="middle" className={cn(NEUTRAL.text, "text-[14px]")}>{line}</text>
          ))}
        </g>
        <VerdictBanner width={W} text={banner.text} tone={banner.tone} />
      </svg>
      <div className="mt-2 space-y-2 px-1 pb-1">
        <NativeRange
          label={`Size of the ${config.movingName.toLowerCase()} block`}
          valueText={`/${prefix}, ${formatAddressNumber(moving.size)} ${plural(moving.size, "address", "addresses")}`}
          value={prefix}
          min={minPrefix}
          max={maxPrefix}
          onChange={(p) => {
            setPrefix(p);
            setStart(moving.start);
          }}
          minLabel={`/${minPrefix}`}
          maxLabel={`/${maxPrefix}`}
        />
        <NativeRange
          label={`Where the ${config.movingName.toLowerCase()} block sits`}
          valueText={moving.cidr}
          value={slot}
          min={0}
          max={slots.count - 1}
          onChange={(s) => setStart(slots.start(s))}
          minLabel={numberToIp(win.start)}
          maxLabel={numberToIp(win.end)}
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
