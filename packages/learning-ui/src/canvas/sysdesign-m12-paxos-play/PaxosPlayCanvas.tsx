"use client";

import { useId, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { LaneCards, type LaneCard } from "../primitives/lane-sequence";
import { LinkLine } from "../primitives/link-line";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { SvgPillButton } from "../primitives/svg-pill-button";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ACCEPTORS,
  DUEL_HINT,
  DUEL_REFUSALS,
  WANTS,
  accept,
  acceptorText,
  canAccept,
  canPrepare,
  describeStep,
  guide,
  nextNumber,
  prepare,
  promiseCount,
  proposalText,
  proposalValue,
  startPaxos,
  stepVerdict,
  valueNote,
  type AcceptorId,
  type PaxosState,
  type ProposerId,
  type Step,
} from "../models/paxos-play";

const W = 420;
const H = 462;
const PROP_X: Record<ProposerId, number> = { P1: 105, P2: 315 };
const PROP_Y = 84;
const ACC_X: Record<AcceptorId, number> = { A1: 70, A2: 210, A3: 350 };
const ACC_Y = 232;
const SLOT_Y = 281;
const CHIP_Y = 322;
const BUTTON_Y = 372;
const VALUE_Y = 418;
const DUEL_Y = 447;
/** Seconds for a message to reach an acceptor, and for the answer to come back. */
const LEG_S = 0.45;
const FLIGHT_S = LEG_S * 2;

type Flight = { id: number; at: number; who: ProposerId; to: AcceptorId; ok: boolean };
type Game = { s: PaxosState; last: Step | null; lines: string[] };

const r1 = (v: number) => Math.round(v * 10) / 10;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ALL: AcceptorId[] = [...ACCEPTORS];

/** 12.7 beat 2: two proposers and three acceptors; choose who hears each message and watch the value get forced. */
export function PaxosPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const beat = useBeatClock(box);
  const titleId = useId();
  const descId = useId();
  const [game, setGame] = useState<Game>({ s: startPaxos(), last: null, lines: [] });
  const [active, setActive] = useState<ProposerId>("P1");
  const [targets, setTargets] = useState<AcceptorId[]>(ALL);
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(0);

  const { s, last } = game;
  const verdict = stepVerdict(last);
  const forced = proposalValue(s, active);
  const n = nextNumber(s, active);
  const sendTo = ACCEPTORS.filter((id) => targets.includes(id));
  const mayPrepare = canPrepare(s, active, sendTo);
  const mayAccept = canAccept(s, active, sendTo);
  const majority = proposalValue(s, active) !== null;
  const note = valueNote(s, active);
  const duel = s.refused >= DUEL_REFUSALS;
  const chosen = s.chosen[0] ?? null;

  function send(kind: "prepare" | "accept") {
    const step = kind === "prepare" ? prepare(s, active, sendTo) : accept(s, active, sendTo);
    if (!step) return;
    const added = step.replies.map((r) => ({ id: nextId.current++, at: beat.seconds, who: active, to: r.to, ok: r.ok }));
    setGame({ s: step.state, last: step, lines: [...game.lines, describeStep(step)].slice(-4) });
    setFlights(beat.reduced ? [] : added);
    setTargets(ALL);
  }
  function reset() {
    setGame({ s: startPaxos(), last: null, lines: [] });
    setActive("P1");
    setTargets(ALL);
    setFlights([]);
  }
  function choose(who: ProposerId) {
    setActive(who);
    setTargets(ALL);
  }
  function toggle(id: AcceptorId) {
    setTargets((now) => (now.includes(id) ? now.filter((x) => x !== id) : [...now, id]));
  }

  // Dots travelling along the straight link between a proposer and an acceptor.
  const dots = beat.reduced
    ? []
    : flights.flatMap((f) => {
        const since = beat.seconds - f.at;
        if (since < 0 || since > FLIGHT_S) return [];
        const from = { x: PROP_X[f.who], y: PROP_Y + 38 };
        const to = { x: ACC_X[f.to], y: ACC_Y - 38 };
        const out = since <= LEG_S;
        const k = out ? since / LEG_S : (since - LEG_S) / LEG_S;
        const a = out ? from : to;
        const b = out ? to : from;
        return [{ id: f.id, x: r1(lerp(a.x, b.x, k)), y: r1(lerp(a.y, b.y, k)), tone: out ? ("accent" as const) : f.ok ? ("good" as const) : ("bad" as const) }];
      });
  const arrival = (id: AcceptorId) =>
    beat.reduced ? 0 : Math.max(0, ...flights.filter((f) => f.to === id).map((f) => 1 - Math.abs(beat.seconds - f.at - LEG_S) / 0.5));

  const proposers: LaneCard[] = (["P1", "P2"] as const).map((id) => {
    const k = promiseCount(s, id);
    const prepared = s.rounds[id] !== null;
    return {
      id,
      x: PROP_X[id],
      label: id,
      status: prepared ? `${k} ${k === 1 ? "promise" : "promises"}` : `wants ${WANTS[id]}`,
      statusTone: prepared ? (k >= 2 ? "good" : "warn") : undefined,
      mark: active === id ? "accent" : undefined,
      ariaLabel: `${id}, wants ${WANTS[id]}, ${active === id ? "active, sends the next message" : "press to make it the active proposer"}`,
      pressed: active === id,
      onPress: () => choose(id),
    };
  });
  const acceptors: LaneCard[] = ACCEPTORS.map((id) => {
    const a = s.acceptors[id];
    const holdsChosen = chosen !== null && a.accepted?.v === chosen;
    return {
      id,
      x: ACC_X[id],
      label: id,
      status: a.promised === null ? "no promise" : `promised ${a.promised}`,
      statusTone: a.promised === null ? undefined : "accent",
      mark: holdsChosen ? "good" : undefined,
      arrival: arrival(id),
      ariaLabel: acceptorText(s, id),
    };
  });

  const chipTexts = ACCEPTORS.map((id) => (targets.includes(id) ? `${id} gets it` : `${id} skipped`));
  const prepareText = n === null ? "Prepare" : `Prepare ${n}`;
  const acceptText = majority && forced ? `Accept ${s.rounds[active]?.n}, ${forced.value}` : "Accept";
  const widths = [chipWidth(prepareText), chipWidth("Accept 2, A"), chipWidth("Reset")];
  const xs = rowPositions(widths, (W - (widths[0] + widths[1] + widths[2] + 20)) / 2, 10);

  const valueTone = forced ? (forced.locked ? (forced.value === WANTS[active] ? "accent" : "warn") : null) : null;
  const valueText = forced ? `sends ${forced.value}` : `wants ${WANTS[active]}`;
  const description = `Two proposers P1, which wants A, and P2, which wants B, and three acceptors. ${[...ACCEPTORS].map((id) => acceptorText(s, id)).join(". ")}. ${verdict.text}.`;

  return (
    <BeatFrame label={title} limits={limits} hint={guide(s).text}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />

          {/* The active proposer's three links: lit for the acceptors that will hear the next message. */}
          {ACCEPTORS.map((id) => (
            <LinkLine
              key={id}
              x1={PROP_X[active]}
              y1={PROP_Y + 38}
              x2={ACC_X[id]}
              y2={ACC_Y - 38}
              strokeWidth={targets.includes(id) ? 2.25 : 1.5}
              className={targets.includes(id) ? TONES.accent.stroke : "stroke-muted-foreground/25"}
            />
          ))}
          {dots.map((d) => (
            <circle key={d.id} cx={d.x} cy={d.y} r={6} className={cn(TONES[d.tone].solidFill, "stroke-card")} strokeWidth={2} />
          ))}

          <LaneCards cards={proposers} y={PROP_Y} />
          <LaneCards cards={acceptors} y={ACC_Y} />

          {/* What each acceptor holds. */}
          {ACCEPTORS.map((id) => {
            const a = s.acceptors[id].accepted;
            const holds = a !== null && chosen !== null && a.v === chosen;
            return (
              <g key={id}>
                <rect x={ACC_X[id] - 52} y={SLOT_Y - 12} width={104} height={24} rx={12} className={cn(NEUTRAL.surface, holds ? TONES.good.stroke : a ? TONES.accent.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} strokeWidth={1.5} />
                <text x={ACC_X[id]} y={SLOT_Y + 4.5} textAnchor="middle" className={cn(a ? NEUTRAL.text : NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>
                  {a ? `holds ${proposalText(a)}` : "holds nothing"}
                </text>
              </g>
            );
          })}

          {/* Which acceptors the next message reaches. */}
          <g role="group" aria-label="Acceptors that receive the next message">
            {ACCEPTORS.map((id, i) => {
              const w = chipWidth(chipTexts[i]);
              return (
                <SvgChip
                  key={id}
                  x={ACC_X[id] - w / 2}
                  y={CHIP_Y}
                  text={chipTexts[i]}
                  width={w}
                  label={`${id}, receives the message: ${targets.includes(id) ? "on" : "off"}`}
                  pressed={targets.includes(id)}
                  onPress={() => toggle(id)}
                />
              );
            })}
          </g>

          <SvgPillButton x={xs[0]} y={BUTTON_Y} width={widths[0]} text={prepareText} label={n === null ? `${active} has used all its numbers` : `${active} sends Prepare ${n}`} primary={!majority} disabled={!mayPrepare} onPress={() => send("prepare")} />
          <SvgPillButton x={xs[1]} y={BUTTON_Y} width={widths[1]} text={acceptText} label={majority ? `${active} sends ${acceptText}` : `${active} cannot send Accept: wait for a majority`} primary={majority} disabled={!mayAccept} onPress={() => send("accept")} />
          <SvgPillButton x={xs[2]} y={BUTTON_Y} width={widths[2]} text="Reset" label="Reset the acceptors and proposers" onPress={reset} />

          {/* The value box and the reason for it, visible without hovering. */}
          <rect x={14} y={VALUE_Y - 15} width={104} height={30} rx={15} strokeWidth={2} className={cn(NEUTRAL.surface, valueTone ? TONES[valueTone].stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          {forced?.locked ? <Lock x={24} y={VALUE_Y - 7} width={14} height={14} strokeWidth={2.25} className={cn(valueTone ? TONES[valueTone].stroke : NEUTRAL.doneStroke, "fill-none")} aria-hidden /> : null}
          <text x={forced?.locked ? 44 : 66} y={VALUE_Y + 4.5} textAnchor={forced?.locked ? "start" : "middle"} className={cn(valueTone ? TONES[valueTone].text : NEUTRAL.text, "text-[13px] font-bold")}>
            {valueText}
          </text>
          <text x={128} y={VALUE_Y + 4.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>
            {note}
          </text>

          {duel ? (
            <g>
              <rect x={W / 2 - 138} y={DUEL_Y - 14} width={276} height={28} rx={14} strokeWidth={2} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              <text x={W / 2} y={DUEL_Y + 4.5} textAnchor="middle" className={cn(TONES.warn.text, "text-[13px] font-bold")}>{DUEL_HINT}</text>
            </g>
          ) : null}
        </svg>
        {beat.reduced && game.lines.length > 0 ? (
          <ol className="mt-2 list-decimal space-y-1 pl-6 pr-2 text-sm text-foreground">
            {game.lines.map((line, i) => (
              <li key={`${i}-${line}`}>{line}</li>
            ))}
          </ol>
        ) : null}
        <div className="sr-only" aria-live="polite" role="status">
          <p>{game.lines[game.lines.length - 1] ?? "No messages yet."}</p>
          <ul>
            {ACCEPTORS.map((id) => (
              <li key={id}>{acceptorText(s, id)}</li>
            ))}
          </ul>
          <p>{verdict.text}</p>
        </div>
      </div>
    </BeatFrame>
  );
}
