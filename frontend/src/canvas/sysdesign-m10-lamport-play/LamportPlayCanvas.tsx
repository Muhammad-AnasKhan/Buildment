"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LaneBody, LaneCards, type LaneCard, type LaneEventView, type LaneMessageView } from "../primitives/lane-sequence";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { LABEL_HALO, NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  MAX_ACTIONS,
  NODE_IDS,
  NODE_INDEX,
  SCRIPT,
  describeAction,
  finishReceive,
  guessChips,
  localEvent,
  mergeText,
  nextScriptStep,
  planSend,
  playVerdict,
  scriptProgress,
  startRun,
  wrongGuessText,
  type GuessChip,
  type NodeId,
  type ReceivePlan,
  type Run,
} from "../models/lamport-play";

const W = 420;
const H = 434;
const COLS = [70, 210, 350];
const CARD_Y = 82;
const TOP = 142;
const PITCH = 38;
const ROWS = 6;
const PILL = { w: 54, h: 30 };
const PROMPT_Y = 376;
const CHIP_Y = 408;
/** Seconds the wrong chip shakes, and the right number takes to fly in. */
const SHAKE_S = 0.5;
const FLY_S = 0.6;

type Pending = { sent: Run; plan: ReceivePlan; chips: GuessChip[]; wrong: { id: string; text: string; at: number } | null };
type Fly = { at: number; fromX: number; node: NodeId; row: number; value: number };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 10.3 beat 4: tap a node for an event or a send, and guess each receive before the number appears. */
export function LamportPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const beat = useBeatClock(box);
  const [run, setRun] = useState<Run>(startRun);
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [fly, setFly] = useState<Fly | null>(null);
  const titleId = useId();
  const descId = useId();

  const shown = pending ? pending.sent : run;
  const full = run.actions.length >= MAX_ACTIONS;
  const lastRow = shown.events[shown.events.length - 1].row + (pending ? 1 : 0);
  const first = Math.max(0, lastRow - (ROWS - 1));

  // The newest event of each node is the live counter; older ones are the trail.
  const live = new Map<NodeId, number>();
  shown.events.forEach((e, i) => live.set(e.node, i));
  const events: LaneEventView[] = [];
  shown.events.forEach((e, i) => {
    if (e.row < first) return;
    const age = lastRow - e.row;
    events.push({
      key: `e${i}`,
      col: NODE_INDEX[e.node],
      row: e.row - first,
      text: String(e.value),
      style: live.get(e.node) === i ? (e.kind === "start" ? "start" : "current") : e.kind === "start" ? "start" : "past",
      opacity: live.get(e.node) === i ? 1 : Math.max(0.45, 1 - age * 0.1),
    });
  });
  const messages: LaneMessageView[] = [];
  shown.events.forEach((e, i) => {
    if (e.kind === "send" && e.link !== undefined && shown.events[i].row >= first) messages.push({ from: `e${i}`, to: `e${e.link}`, tone: "accent", past: e.link !== shown.events.length - 1 });
  });
  if (pending) {
    const sendIndex = shown.events.length - 1;
    events.push({ key: "ghost", col: NODE_INDEX[pending.plan.to], row: shown.events[sendIndex].row + 1 - first, text: "?", style: "start" });
    messages.push({ from: `e${sendIndex}`, to: "ghost", tone: "accent" });
  }

  const lastEvent = run.events[run.events.length - 1];
  const verdict = pending
    ? pending.wrong
      ? { text: pending.wrong.text, tone: "warn" as const }
      : { text: `What will ${pending.plan.to} show? Tap a guess`, tone: "accent" as const }
    : selected
      ? { text: `${selected} chosen: pick what it does`, tone: "accent" as const }
      : playVerdict(run);

  const sinceFly = fly ? beat.seconds - fly.at : Infinity;
  const arrival = (node: NodeId) => (!pending && lastEvent.kind === "receive" && lastEvent.node === node ? Math.max(0, Math.min(1, 1 - sinceFly / 1.6)) : 0);

  const cards: LaneCard[] = NODE_IDS.map((id) => ({
    id,
    x: COLS[NODE_INDEX[id]],
    label: `Node ${id}`,
    status: `counter ${shown.counters[id]}`,
    statusTone: lastEvent.kind !== "start" && !pending && lastEvent.node === id ? "accent" : undefined,
    mark: selected === id ? "accent" : pending && (pending.plan.from === id || pending.plan.to === id) ? "accent" : undefined,
    arrival: arrival(id),
    ariaLabel: `Node ${id}, counter ${shown.counters[id]}${selected === id ? ", chosen" : ""}`,
    pressed: selected === id,
    onPress: () => pressNode(id),
  }));

  function pressNode(id: NodeId) {
    if (pending || full) return;
    if (selected === null) setSelected(id);
    else if (selected === id) setSelected(null);
    else startSend(selected, id);
  }
  function startSend(from: NodeId, to: NodeId) {
    const { run: sent, plan } = planSend(run, from, to);
    setPending({ sent, plan, chips: guessChips(plan), wrong: null });
    setSelected(null);
  }
  function guess(chip: GuessChip, fromX: number) {
    if (!pending) return;
    if (!chip.correct) {
      setPending({ ...pending, wrong: { id: chip.id, text: wrongGuessText(pending.plan, chip), at: beat.seconds } });
      return;
    }
    const next = finishReceive(pending.sent, pending.plan);
    const row = next.events[next.events.length - 1].row;
    setRun(next);
    setPending(null);
    setFly({ at: beat.seconds, fromX, node: pending.plan.to, row, value: pending.plan.result });
  }
  function startOver() {
    setRun(startRun());
    setSelected(null);
    setPending(null);
    setFly(null);
  }

  // The strip under the lanes: a prompt, then the chips for this moment.
  let prompt = "";
  let chips: { key: string; text: string; label: string; onPress: () => void; shake?: number; guess?: { chip: GuessChip } }[] = [];
  if (pending) {
    prompt = `${pending.plan.to} has ${pending.plan.own}, the stamp is ${pending.plan.stamp}. New counter?`;
    chips = pending.chips.map((c) => ({
      key: c.id,
      text: c.label,
      label: `Guess: ${c.label}`,
      onPress: () => undefined,
      shake: pending.wrong?.id === c.id ? beat.seconds - pending.wrong.at : undefined,
      guess: { chip: c },
    }));
  } else if (selected) {
    prompt = `${selected} is chosen. What should it do?`;
    chips = [
      { key: "event", text: `Event on ${selected}`, label: `Local event on ${selected}`, onPress: () => { setRun(localEvent(run, selected)); setSelected(null); } },
      ...NODE_IDS.filter((n) => n !== selected).map((n) => ({ key: `to-${n}`, text: `Send to ${n}`, label: `Send from ${selected} to ${n}`, onPress: () => startSend(selected, n) })),
    ];
    chips.push({ key: "reset", text: "Start over", label: "Start over", onPress: startOver });
  } else {
    prompt = full ? "That is enough for one run" : lastEvent.kind === "receive" ? mergeText(lastEvent.before as number, lastEvent.stamp as number, lastEvent.value) : run.actions.length === 0 ? "Counters start at A 0, B 5, C 0" : `${lastEvent.node} is now ${lastEvent.value}`;
    if (run.actions.length > 0) chips = [{ key: "reset", text: "Start over", label: "Start over", onPress: startOver }];
  }
  const widths = chips.map((c) => chipWidth(c.text));
  const total = widths.reduce((a, b) => a + b, 0) + 8 * Math.max(0, widths.length - 1);
  const xs = rowPositions(widths, (W - total) / 2, 8);
  const showFormula = !pending && !selected && lastEvent.kind === "receive" && !full;

  const next = nextScriptStep(run.actions);
  const progress = scriptProgress(run.actions);
  const hint = pending
    ? "Tap the number you think comes next. A wrong guess says why."
    : next
      ? `Step ${next.index + 1} of ${SCRIPT.length}: ${describeAction(next.action)}.`
      : progress === SCRIPT.length
        ? "Script done. Now try a receiver far ahead of the sender, and one far behind."
        : "Free play. Tap a node, then an action. Notice that no counter ever goes down.";

  // The right guess flies from its chip to the new number in the lanes.
  const flight = fly && sinceFly < FLY_S && fly.row >= first
    ? (() => {
        const k = Math.max(0, sinceFly) / FLY_S;
        const e = 1 - (1 - k) * (1 - k);
        const tx = COLS[NODE_INDEX[fly.node]];
        const ty = TOP + (fly.row - first) * PITCH;
        return { x: r1(fly.fromX + (tx - fly.fromX) * e), y: r1(CHIP_Y + (ty - CHIP_Y) * e), value: fly.value, opacity: 1 - k * 0.5 };
      })()
    : null;

  const description = `Three nodes A, B and C with Lamport counters ${NODE_IDS.map((n) => `${n} ${shown.counters[n]}`).join(", ")}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={hint}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
          <LaneBody columns={COLS} top={TOP} pitch={PITCH} rows={ROWS} pillW={PILL.w} pillH={PILL.h} events={events} messages={messages} lifelineFrom={CARD_Y + 36} />
          <LaneCards cards={cards} y={CARD_Y} />

          {showFormula ? (
            <g>
              <rect x={W / 2 - 96} y={PROMPT_Y - 17} width={192} height={32} rx={16} className={cn(NEUTRAL.surface, TONES.good.stroke)} strokeWidth={2} />
              <text x={W / 2} y={PROMPT_Y + 4.5} textAnchor="middle" className={cn(TONES.good.text, "text-[14px] font-bold tabular-nums")}>{prompt}</text>
            </g>
          ) : (
            <text x={W / 2} y={PROMPT_Y + 4} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{prompt}</text>
          )}

          {chips.map((c, i) => {
            const shake = c.shake !== undefined && c.shake >= 0 && c.shake < SHAKE_S ? Math.sin(c.shake * 55) * 5 * (1 - c.shake / SHAKE_S) : 0;
            return (
              <g key={c.key} transform={`translate(${r1(shake)} 0)`}>
                <SvgChip x={xs[i]} y={CHIP_Y} text={c.text} width={widths[i]} label={c.label} pressed={false} onPress={c.guess ? () => guess((c.guess as { chip: GuessChip }).chip, xs[i] + widths[i] / 2) : c.onPress} />
              </g>
            );
          })}

          {flight ? (
            <g opacity={flight.opacity}>
              <rect x={flight.x - 20} y={flight.y - 15} width={40} height={30} rx={15} className={cn(TONES.good.softFill, TONES.good.stroke)} strokeWidth={2} />
              <text x={flight.x} y={flight.y + 4.8} textAnchor="middle" className={cn(TONES.good.text, LABEL_HALO, "text-[13px] font-bold tabular-nums")}>{flight.value}</text>
            </g>
          ) : null}
        </svg>
      </div>
    </BeatFrame>
  );
}
