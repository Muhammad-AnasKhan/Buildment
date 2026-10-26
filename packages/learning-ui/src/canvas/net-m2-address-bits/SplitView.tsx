"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES, type Tone } from "../primitives/tones";
import { blockSize, formatAddressNumber, usableCount } from "../models/net-address";
import {
  alignedStarts,
  boundaryScenario,
  cidrAt,
  checkPlacement,
  firstFit,
  generateSplitDrill,
  hostsPrefix,
  placeInOrder,
  rangeOf,
  startLabel,
  type BlockRange,
  type SplitConfig,
} from "../models/net-subnet";
import { Caption, ControlButton } from "./bit-parts";
import { ChoiceButton, DrillShell, NativeRange, VerdictChip, W } from "./net-parts";

type Props = { title: string; purpose: string; limits: string; config: SplitConfig };

/** The split mode: sizes, places, boundaries and a drill, on one block cut up for several networks. */
export function SplitView(props: Props) {
  switch (props.config.view) {
    case "size":
      return <SizeView {...props} />;
    case "place":
      return <PlaceView {...props} />;
    case "boundary":
      return <BoundaryView {...props} />;
    case "drill":
      return <SplitDrill {...props} />;
  }
}

function SplitDrill({ title, purpose, limits, config }: Props) {
  const makeItems = useMemo(() => (set: number) => generateSplitDrill(set, config.block), [config.block]);
  return <DrillShell title={title} purpose={purpose} limits={limits} makeItems={makeItems} />;
}

// ---------------------------------------------------------------- size: pick a prefix for each network

function SizeView({ title, limits, config }: Props) {
  const choices = config.choices ?? [24, 25, 26, 27, 28];
  const needs = config.needs;
  const [picks, setPicks] = useState<(number | null)[]>(() => needs.map(() => null));
  const [refusal, setRefusal] = useState<string | null>(null);

  const pick = (row: number, prefix: number) => {
    const need = needs[row];
    const usable = usableCount(prefix);
    if (need.hosts > usable) {
      setRefusal(`${need.name}: ${formatAddressNumber(need.hosts)} devices do not fit in a /${prefix}, which has ${formatAddressNumber(usable)} usable addresses.`);
      return;
    }
    setRefusal(null);
    setPicks((prev) => prev.map((p, i) => (i === row ? prefix : p)));
  };

  const placed = picks.filter((p) => p !== null).length;
  const spare = needs.reduce((sum, need, i) => (picks[i] === null ? sum : sum + usableCount(picks[i] as number) - need.hosts), 0);
  const loose = needs.filter((need, i) => picks[i] !== null && picks[i] !== hostsPrefix(need.hosts)).length;

  let verdict: { text: string; tone: Tone };
  if (refusal) verdict = { text: "Too small: that block cannot hold them", tone: "bad" };
  else if (placed === 0) verdict = { text: "Pick a prefix for each network", tone: "accent" };
  else if (placed < needs.length) verdict = { text: `${placed} of ${needs.length} picked, ${formatAddressNumber(spare)} spare`, tone: "accent" };
  else if (loose === 0) verdict = { text: `All fit, ${formatAddressNumber(spare)} spare: the least possible`, tone: "good" };
  else verdict = { text: `All fit, ${formatAddressNumber(spare)} spare: ${loose} could be smaller`, tone: "warn" };
  const summary = `${verdict.text}.${refusal ? ` ${refusal}` : ""}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Pick the smallest block that holds each network.</>}
      controls={
        <ControlButton
          onClick={() => {
            setPicks(needs.map(() => null));
            setRefusal(null);
          }}
        >
          Reset
        </ControlButton>
      }
    >
      <div className="space-y-3 px-1 py-1">
        <VerdictChip text={verdict.text} tone={verdict.tone} />
        <ul className="grid gap-2">
          {needs.map((need, i) => {
            const best = hostsPrefix(need.hosts);
            const p = picks[i];
            return (
              <li key={need.name} className="rounded-xl border border-border bg-card p-3">
                <p className="text-sm font-semibold text-foreground">
                  {need.name}: <span className="tabular-nums">{formatAddressNumber(need.hosts)}</span> devices
                </p>
                <p className="mt-1 text-[13px] text-muted-foreground">Usable addresses under each prefix</p>
                <div role="group" aria-label={`Prefix for ${need.name}`} className="mt-1 grid grid-cols-5 gap-1.5">
                  {choices.map((prefix) => (
                    <ChoiceButton key={prefix} className="px-1" label={`${need.name}: /${prefix}, ${formatAddressNumber(usableCount(prefix))} usable addresses${p === prefix ? ", picked" : ""}`} pressed={p === prefix} onClick={() => pick(i, prefix)}>
                      <span className="block text-center text-base font-bold">{`/${prefix}`}</span>
                      <span className="block text-center text-[13px] font-medium">{formatAddressNumber(usableCount(prefix))}</span>
                    </ChoiceButton>
                  ))}
                </div>
                <p className="mt-2 text-sm leading-snug text-foreground">
                  {p === null
                    ? "Not picked yet."
                    : p === best
                      ? `/${p} holds ${formatAddressNumber(usableCount(p))}: ${formatAddressNumber(usableCount(p) - need.hosts)} spare. It is the smallest block that fits.`
                      : `/${p} holds ${formatAddressNumber(usableCount(p))}: ${formatAddressNumber(usableCount(p) - need.hosts)} spare. A /${best} would do (${formatAddressNumber(usableCount(best))} usable).`}
                </p>
              </li>
            );
          })}
        </ul>
        {refusal ? <p role="alert" className={cn("rounded-xl px-3 py-2 text-sm font-medium leading-snug ring-1 ring-inset", TONES.bad.chip)}>{refusal}</p> : null}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- the bar of the block

const BX0 = 12;
const BX1 = 408;
const BAR_Y = 84;
const BAR_H = 48;

const scaleOf = (parent: BlockRange) => (address: number) => BX0 + ((address - parent.start) / parent.size) * (BX1 - BX0);

type BarBlock = { name?: string; start: number; end: number; prefix: number; tone: "accent" | "good" | "bad" | "free" | "gap" };

/** The block as a bar with blocks drawn on it; names and prefixes are printed, so colour is never the only signal. */
function BlockBar({ parent, blocks }: { parent: BlockRange; blocks: BarBlock[] }) {
  const x = scaleOf(parent);
  return (
    <g aria-hidden="true">
      <rect x={BX0} y={BAR_Y} width={BX1 - BX0} height={BAR_H} rx={8} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-card", NEUTRAL.faintStroke)} />
      {blocks.map((b, k) => {
        const left = x(b.start);
        const right = Math.min(BX1, x(b.end + 1));
        const width = Math.max(2, right - left);
        const tone = b.tone === "free" || b.tone === "gap" ? null : TONES[b.tone];
        const centre = left + width / 2;
        return (
          <g key={k}>
            <rect
              x={left}
              y={BAR_Y}
              width={width}
              height={BAR_H}
              rx={6}
              strokeWidth={tone ? 2 : 1.5}
              strokeDasharray={tone ? undefined : "5 4"}
              className={cn(tone ? cn(tone.softFill, tone.stroke) : b.tone === "gap" ? cn(TONES.warn.softFill, TONES.warn.stroke) : cn("fill-transparent", NEUTRAL.faintStroke), SHAPE_TRANSITION)}
            />
            {width >= 90 && b.name ? (
              <>
                <text x={centre} y={BAR_Y + 20} textAnchor="middle" className={cn(tone ? tone.text : NEUTRAL.text, "text-[13px] font-medium")}>{b.name}</text>
                <text x={centre} y={BAR_Y + 39} textAnchor="middle" className={cn(tone ? tone.text : NEUTRAL.text, "text-[15px] font-bold tabular-nums")}>{`/${b.prefix}`}</text>
              </>
            ) : width >= 30 ? (
              <text x={centre} y={BAR_Y + 30} textAnchor="middle" className={cn(tone ? tone.text : b.tone === "gap" ? TONES.warn.text : NEUTRAL.mutedText, "text-[13px] font-bold tabular-nums")}>{b.tone === "free" ? "free" : b.tone === "gap" ? "gap" : `/${b.prefix}`}</text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** Start labels under the bar: the quarter marks, or every start of a prefix. */
function BarTicks({ parent, starts, every = 1 }: { parent: BlockRange; starts: number[]; every?: number }) {
  const x = scaleOf(parent);
  const labelled = starts.filter((_, k) => k % every === 0);
  return (
    <g aria-hidden="true">
      {starts.map((s) => (
        <line key={s} x1={x(s)} x2={x(s)} y1={BAR_Y + BAR_H} y2={BAR_Y + BAR_H + 8} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
      ))}
      {labelled.map((s, k) => (
        <Caption key={s} x={Math.min(BX1 - 6, Math.max(BX0 + 6, x(s)))} y={BAR_Y + BAR_H + 26} anchor={k === 0 && x(s) <= BX0 + 12 ? "start" : "middle"}>{startLabel(parent.cidr, s)}</Caption>
      ))}
    </g>
  );
}

const quarters = (parent: BlockRange) => [0, 1, 2, 3].map((q) => parent.start + (q * parent.size) / 4);

// ---------------------------------------------------------------- place: biggest first

const PLACE_H = 172;

function PlaceView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const { block, needs } = config;
  const parent = rangeOf(block);
  const label = (n: number) => startLabel(block, n);
  const [order, setOrder] = useState<number[]>([]);
  const [noRoom, setNoRoom] = useState<string | null>(null);

  const result = placeInOrder(block, needs, order);
  const free = result.free;
  const prefixes = needs.map((n) => hostsPrefix(n.hosts));

  const place = (index: number) => {
    if (order.includes(index)) return;
    if (firstFit(block, result.placements, prefixes[index]) === null) {
      setNoRoom(`No room for ${needs[index].name}`);
      return;
    }
    setNoRoom(null);
    setOrder([...order, index]);
  };

  const freeText = (f: { start: number; end: number }) => `${label(f.start)} to ${label(f.end)}`;
  let verdict: { text: string; tone: Tone };
  if (noRoom) verdict = { text: noRoom, tone: "bad" };
  else if (order.length === 0) verdict = { text: "Tap a block to drop it into the /24", tone: "accent" };
  else if (result.holes.length > 0) verdict = { text: `Gap ${freeText(result.holes[0])}: ${formatAddressNumber(result.holes[0].size)} addresses stranded`, tone: "warn" };
  else if (order.length === needs.length) verdict = { text: `All placed, no gaps. Free: ${free.length ? freeText(free[0]) : "none"}`, tone: "good" };
  else verdict = { text: `${order.length} of ${needs.length} placed. Free: ${free.length ? freeText(free[0]) : "none"}`, tone: "accent" };

  const barBlocks: BarBlock[] = [
    ...result.placements.map((p): BarBlock => ({ name: p.name, start: p.start, end: p.end, prefix: p.prefix, tone: "accent" })),
    ...free.map((f): BarBlock => ({ start: f.start, end: f.end, prefix: f.prefix, tone: result.holes.includes(f) ? "gap" : "free" })),
  ];
  const summary = `${verdict.text}. ${result.placements.map((p) => `${p.name} ${p.cidr}, ${label(p.start)} to ${label(p.end)}`).join("; ") || "Nothing placed yet"}. Free: ${free.map((f) => `${f.cidr}`).join(", ") || "none"}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Tap the biggest block first, then try the smallest first.</>}
      controls={
        <ControlButton
          onClick={() => {
            setOrder([]);
            setNoRoom(null);
          }}
        >
          Reset
        </ControlButton>
      }
    >
      <svg viewBox={`0 0 ${W} ${PLACE_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={PLACE_H} />
        <Caption x={BX0} y={72} anchor="start">{block}</Caption>
        <BlockBar parent={parent} blocks={barBlocks} />
        <BarTicks parent={parent} starts={quarters(parent)} />
        <Caption x={BX1} y={BAR_Y + BAR_H + 26} anchor="end">{label(parent.end)}</Caption>
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <ul className="mt-2 grid gap-2 px-1 pb-1 sm:grid-cols-3">
        {needs.map((need, i) => {
          const placed = result.placements.find((p) => p.name === need.name);
          return (
            <li key={need.name}>
              <ChoiceButton
                label={placed ? `${need.name}, ${need.hosts} devices, a /${prefixes[i]}, placed at ${label(placed.start)} to ${label(placed.end)}` : `Place ${need.name}, ${need.hosts} devices, a /${prefixes[i]}`}
                pressed={placed ? true : undefined}
                disabled={Boolean(placed)}
                onClick={() => place(i)}
              >
                <span className="block text-sm font-medium">{need.name}</span>
                <span className="block text-base font-bold">{`${formatAddressNumber(need.hosts)} devices, /${prefixes[i]}`}</span>
                <span className="block text-[13px] font-medium">{placed ? `${label(placed.start)} to ${label(placed.end)}` : "tap to place"}</span>
              </ChoiceButton>
            </li>
          );
        })}
      </ul>
      <p className="px-1 pb-1 text-sm text-muted-foreground">{free.length ? `Free: ${free.map((f) => `${f.cidr} (${freeText(f)})`).join(", ")}` : "Nothing is free."}</p>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}

// ---------------------------------------------------------------- boundary: a start must be a multiple of the size

const BOUNDARY_H = 252;
const LANE_Y = BAR_Y + BAR_H + 44;

function BoundaryView({ title, purpose, limits, config }: Props) {
  const ids = useId().replace(/:/g, "");
  const { block, needs } = config;
  const parent = rangeOf(block);
  const { taken, moving } = useMemo(() => boundaryScenario(block, needs), [block, needs]);
  const label = (n: number) => startLabel(block, n);
  const [offset, setOffset] = useState(Math.min(parent.size - 1, config.startOffset ?? 100));

  const start = parent.start + offset;
  const size = blockSize(moving.prefix);
  const check = checkPlacement(block, [taken], moving.prefix, start);
  const starts = alignedStarts(block, moving.prefix);
  const before = [...starts].reverse().find((s) => s < start);
  const after = starts.find((s) => s > start);
  const x = scaleOf(parent);

  let verdict: { text: string; tone: Tone };
  if (check.ok) verdict = { text: `Allowed: a /${moving.prefix} may start at ${label(start)}`, tone: "good" };
  else if (check.reasons.includes("unaligned")) verdict = { text: `Refused: ${label(start)} is not a start for a /${moving.prefix}`, tone: "bad" };
  else if (check.reasons.includes("overlap")) verdict = { text: `Refused: it overlaps ${taken.name}`, tone: "bad" };
  else verdict = { text: "Refused: it runs outside the block", tone: "bad" };

  const takenRange = { start: taken.start, end: taken.start + blockSize(taken.prefix) - 1 };
  const movingLeft = x(start);
  const movingRight = Math.min(BX1, x(start + size));
  const movingTone: Tone = check.ok ? "good" : "bad";
  const every = starts.length > 8 ? Math.ceil(starts.length / 8) : 1;
  const summary = `${verdict.text}. ${check.lines.join(" ")}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Slide the {moving.name} block to .100, then to the boundaries.</>}
      controls={
        <>
          <ControlButton onClick={() => before !== undefined && setOffset(before - parent.start)} disabled={before === undefined}>Previous boundary</ControlButton>
          <ControlButton onClick={() => after !== undefined && setOffset(after - parent.start)} disabled={after === undefined}>Next boundary</ControlButton>
        </>
      }
    >
      <svg viewBox={`0 0 ${W} ${BOUNDARY_H}`} role="group" aria-labelledby={`${ids}t ${ids}d`} className="block h-auto w-full select-none">
        <title id={`${ids}t`}>{title}</title>
        <desc id={`${ids}d`}>{`${purpose} ${summary}`}</desc>
        <DotGrid width={W} height={BOUNDARY_H} />
        <Caption x={BX0} y={58} anchor="start">{block}</Caption>
        <BlockBar parent={parent} blocks={[{ name: taken.name, start: takenRange.start, end: takenRange.end, prefix: taken.prefix, tone: "accent" }]} />
        {/* The block being moved sits in its own lane under the bar, so it never covers a label. */}
        <g aria-hidden="true">
          <rect
            x={movingLeft}
            y={LANE_Y}
            width={Math.max(2, movingRight - movingLeft)}
            height={38}
            rx={8}
            strokeWidth={2.5}
            strokeDasharray={check.ok ? undefined : "6 4"}
            className={cn(TONES[movingTone].softFill, TONES[movingTone].stroke, SHAPE_TRANSITION)}
          />
          {movingRight - movingLeft >= 40 ? (
            <text x={(movingLeft + movingRight) / 2} y={LANE_Y + 24} textAnchor="middle" className={cn(TONES[movingTone].text, "text-[13px] font-bold tabular-nums")}>
              {movingRight - movingLeft >= 76 ? `${moving.name} /${moving.prefix}` : `/${moving.prefix}`}
            </text>
          ) : null}
        </g>
        <BarTicks parent={parent} starts={starts} every={every} />
        <Caption x={BX1} y={LANE_Y + 62} anchor="end">{`Starts are multiples of ${size}`}</Caption>
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
      </svg>
      <div className="mt-2 space-y-2 px-1 pb-1">
        <NativeRange
          label={`Start of the ${moving.name} block`}
          valueText={`${label(start)}, ${check.ok ? "allowed" : "refused"}`}
          value={offset}
          min={0}
          max={parent.size - 1}
          onChange={setOffset}
          minLabel={label(parent.start)}
          maxLabel={label(parent.end)}
        />
        <ul className={cn("space-y-1 rounded-xl px-3 py-2 text-sm leading-snug ring-1 ring-inset", TONES[check.ok ? "good" : "bad"].chip)}>
          {check.ok ? <li>{`${cidrAt(start, moving.prefix)} starts on a boundary and the space is free.`}</li> : check.lines.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{summary}</p>
    </BeatFrame>
  );
}
