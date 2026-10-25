"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LaneBody, LaneCards, type LaneCard, type LaneEventView, type LaneMessageView } from "../primitives/lane-sequence";
import { RailSlider } from "../primitives/rail-slider";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import {
  DEFAULT_OFFSETS,
  MAX_ACTIONS,
  NODE_IDS,
  NODE_INDEX,
  OFFSET_MAX,
  OFFSET_MIN,
  OFFSET_SNAPS,
  OPENING,
  brokenReceives,
  clampOffset,
  formatOffset,
  hlcVerdict,
  maxAhead,
  runEvents,
  spread,
  stampAfter,
  stampOf,
  stampText,
  type Action,
  type Mode,
  type NodeId,
  type Offsets,
} from "../models/hlc-skewed";

const W = 420;
const H = 452;
const COLS = [62, 210, 358];
const CARD_Y = 76;
const RAIL_Y = 134;
const RAIL_HALF = 40;
const TOP = 180;
const PITCH = 36;
const ROWS = 6;
const PILL = { w: 112, h: 32 };
const PROMPT_Y = 404;
const CHIP_Y = 430;

/** 10.5 beat 6: skew three clocks, tap to send, and watch the stamps. */
export function HlcSkewedCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [offsets, setOffsets] = useState<Offsets>(DEFAULT_OFFSETS);
  const [actions, setActions] = useState<Action[]>([...OPENING]);
  const [mode, setMode] = useState<Mode>("hybrid");
  const [selected, setSelected] = useState<NodeId | null>(null);
  const titleId = useId();
  const descId = useId();

  const events = runEvents(offsets, actions);
  const full = actions.length >= MAX_ACTIONS;
  const first = Math.max(0, events.length - ROWS);
  const lastIndex = events.length - 1;

  const live = new Map<NodeId, number>();
  events.forEach((e, i) => live.set(e.node, i));
  const views: LaneEventView[] = [];
  events.forEach((e, i) => {
    if (i < first) return;
    const send = e.kind === "receive" ? events[e.link as number] : null;
    const broken = send ? !stampAfter(stampOf(e, mode), stampOf(send, mode)) : false;
    const age = lastIndex - i;
    views.push({
      key: `e${i}`,
      col: NODE_INDEX[e.node],
      row: i - first,
      text: stampText(e, mode),
      sub: mode === "wall" ? "wall clock" : `clock ${e.clock}`,
      badge: mode === "hybrid" && e.ahead > 0 ? { text: `+${e.ahead}`, tone: "warn" } : undefined,
      style: live.get(e.node) === i ? "current" : "past",
      tone: broken ? "bad" : send && i === lastIndex ? "good" : undefined,
      opacity: live.get(e.node) === i ? 1 : Math.max(0.5, 1 - age * 0.08),
    });
  });
  const messages: LaneMessageView[] = [];
  events.forEach((e, i) => {
    if (e.kind !== "send" || e.link === undefined || i < first) return;
    messages.push({ from: `e${i}`, to: `e${e.link}`, tone: "accent", past: e.link !== lastIndex });
  });

  const verdict = selected ? { text: `${selected} chosen: pick what it does`, tone: "accent" as const } : hlcVerdict(events, mode);

  function pressNode(id: NodeId) {
    if (full) return;
    if (selected === null) setSelected(id);
    else if (selected === id) setSelected(null);
    else send(selected, id);
  }
  function send(from: NodeId, to: NodeId) {
    setActions((a) => [...a, { kind: "send", from, to }]);
    setSelected(null);
  }
  function startOver() {
    setActions([...OPENING]);
    setSelected(null);
  }

  const cards: LaneCard[] = NODE_IDS.map((id) => ({
    id,
    x: COLS[NODE_INDEX[id]],
    label: `Node ${id}`,
    kind: "clock",
    status: `clock ${formatOffset(offsets[id])}`,
    statusTone: offsets[id] === 0 ? undefined : "warn",
    mark: selected === id ? "accent" : undefined,
    ariaLabel: `Node ${id}, clock ${formatOffset(offsets[id])}${selected === id ? ", chosen" : ""}`,
    pressed: selected === id,
    onPress: () => pressNode(id),
  }));

  // The strip under the lanes: what the run shows, or the actions for the chosen node.
  const receives = events.filter((e) => e.kind === "receive");
  const broken = brokenReceives(events, mode);
  const ahead = maxAhead(events);
  let prompt: string;
  if (selected) prompt = `${selected} is chosen. What should it do?`;
  else if (full) prompt = "That is enough for one run";
  else if (mode === "wall") prompt = broken === 0 ? "Every receive is stamped after its send, so far" : `${broken} of ${receives.length} receives are stamped before their send`;
  else prompt = ahead > 0 ? `Time part ran at most ${ahead} ms ahead (clock spread ${spread(offsets)} ms)` : `All receives are after their sends (clock spread ${spread(offsets)} ms)`;

  const chips: { key: string; text: string; label: string; onPress: () => void }[] = [];
  if (selected) {
    chips.push({ key: "event", text: `Event on ${selected}`, label: `Local event on ${selected}`, onPress: () => { setActions((a) => [...a, { kind: "local", node: selected }]); setSelected(null); } });
    for (const n of NODE_IDS.filter((v) => v !== selected)) chips.push({ key: `to-${n}`, text: `Send to ${n}`, label: `Send from ${selected} to ${n}`, onPress: () => send(selected, n) });
  }
  chips.push({ key: "reset", text: "Start over", label: "Start over", onPress: startOver });
  const widths = chips.map((c) => chipWidth(c.text));
  const total = widths.reduce((a, b) => a + b, 0) + 8 * (widths.length - 1);
  const xs = rowPositions(widths, (W - total) / 2, 8);

  const description = `Three nodes with clocks ${NODE_IDS.map((n) => `${n} ${formatOffset(offsets[n])}`).join(", ")}, in ${mode === "wall" ? "wall clock" : "hybrid"} mode. ${verdict.text}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag a <b>rail</b> to skew a clock. Tap a node, then where it sends. Amber +N: the time part is N ms ahead of the clock.</>}
      controls={
        <>
          <BeatButton pressed={mode === "wall"} onClick={() => setMode("wall")}>Wall clock</BeatButton>
          <BeatButton pressed={mode === "hybrid"} onClick={() => setMode("hybrid")}>Hybrid</BeatButton>
        </>
      }
    >
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <DotGrid width={W} height={H} />
        <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        <LaneBody columns={COLS} top={TOP} pitch={PITCH} rows={ROWS} pillW={PILL.w} pillH={PILL.h} events={views} messages={messages} lifelineFrom={RAIL_Y + 28} />
        <LaneCards cards={cards} y={CARD_Y} />

        {NODE_IDS.map((id) => {
          const cx = COLS[NODE_INDEX[id]];
          const x0 = cx - RAIL_HALF;
          const x1 = cx + RAIL_HALF;
          const at = (v: number) => x0 + ((v - OFFSET_MIN) / (OFFSET_MAX - OFFSET_MIN)) * (x1 - x0);
          const hx = at(offsets[id]);
          return (
            <RailSlider
              key={id}
              svgRef={svg}
              x0={x0}
              x1={x1}
              y={RAIL_Y}
              label={`Clock of node ${id}, milliseconds from true time`}
              valueText={`${formatOffset(offsets[id])}. ${verdict.text}`}
              value={offsets[id]}
              ladder={OFFSET_SNAPS}
              fromFraction={(f) => clampOffset(OFFSET_MIN + f * (OFFSET_MAX - OFFSET_MIN))}
              onChange={(v) => setOffsets((o) => ({ ...o, [id]: clampOffset(v) }))}
            >
              <g aria-hidden>
                <line x1={x0} x2={x1} y1={RAIL_Y} y2={RAIL_Y} strokeWidth={6} strokeLinecap="round" className="stroke-muted" />
                <line x1={at(0)} x2={hx} y1={RAIL_Y} y2={RAIL_Y} strokeWidth={6} strokeLinecap="round" className={TONES.accent.stroke} />
                {OFFSET_SNAPS.map((v) => (
                  <line key={v} x1={at(v)} x2={at(v)} y1={RAIL_Y - (v === 0 ? 10 : 7)} y2={RAIL_Y + (v === 0 ? 10 : 7)} strokeWidth={v === 0 ? 2 : 1.5} className={NEUTRAL.faintStroke} />
                ))}
                <circle cx={hx} cy={RAIL_Y} r={17} className={TONES.accent.softFill} />
                <circle cx={hx} cy={RAIL_Y} r={11} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={2.5} />
                <line x1={hx - 3} x2={hx - 3} y1={RAIL_Y - 4.5} y2={RAIL_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
                <line x1={hx + 3} x2={hx + 3} y1={RAIL_Y - 4.5} y2={RAIL_Y + 4.5} strokeWidth={1.75} strokeLinecap="round" className="stroke-card" />
              </g>
            </RailSlider>
          );
        })}

        <text x={W / 2} y={PROMPT_Y} textAnchor="middle" className={cn(selected ? NEUTRAL.text : broken > 0 && mode === "wall" ? TONES.bad.text : NEUTRAL.text, "text-[12.5px] font-semibold")}>{prompt}</text>
        {chips.map((c, i) => (
          <SvgChip key={c.key} x={xs[i]} y={CHIP_Y} text={c.text} width={widths[i]} label={c.label} pressed={false} onPress={c.onPress} />
        ))}
      </svg>
    </BeatFrame>
  );
}
