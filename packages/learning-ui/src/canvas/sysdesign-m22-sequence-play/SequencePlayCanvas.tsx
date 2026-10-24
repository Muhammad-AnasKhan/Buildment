"use client";

import { useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { BeatActionButton, BeatChoice } from "../primitives/beat-choice";
import { BeatFrame } from "../primitives/beat-frame";
import { SnapStopsRail } from "../primitives/snap-stops-rail";
import { SvgNode } from "../primitives/svg-node";
import { SvgPillButton } from "../primitives/svg-pill-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { useSettledStart } from "../primitives/use-settled-start";
import {
  DELAY_DEFAULT,
  DELAY_STEPS,
  holdMs,
  legProgress,
  legs,
  listText,
  msText,
  orderRun,
  orderVerdict,
  other,
  phoneRows,
  SENDER_NAME,
  SENDER_TEXT,
  simAt,
  type OrderRun,
  type PhoneId,
  type Row,
  type Sender,
  type Sort,
} from "../models/dardasha-order";

const W = 420;
const H = 522;
const SENDERS: Record<Sender, { x: number; y: number }> = { dana: { x: 72, y: 78 }, omar: { x: 348, y: 78 } };
const BUTTON = { y: 136, w: 92 };
const PANEL = { x: 112, y: 168, w: 196, h: 78 };
const SLOT = { w: 84, h: 38, y: 196 };
const PHONES: Record<PhoneId, { x: number; y: number; name: string }> = {
  layla: { x: 72, y: 318, name: "Layla" },
  sami: { x: 348, y: 318, name: "Sami" },
};
const LIST = { y: 356, rowH: 25, w: 128 };
const RAIL = { x0: 50, x1: 370, y: 480 };

type Pt = [number, number];
const PATH_IN: Record<Sender, [Pt, Pt]> = {
  dana: [[120, 108], [160, 168]],
  omar: [[300, 108], [260, 168]],
};
const PATH_OUT: Record<PhoneId, [Pt, Pt]> = {
  layla: [[160, 246], [112, 288]],
  sami: [[260, 246], [308, 288]],
};

const r1 = (v: number) => Math.round(v * 10) / 10;
const lerp = (a: Pt, b: Pt, p: number): Pt => [r1(a[0] + (b[0] - a[0]) * p), r1(a[1] + (b[1] - a[1]) * p)];
const SENDER_TONE: Record<Sender, Tone> = { dana: "accent", omar: "warn" };
const listLeft = (phone: PhoneId) => PHONES[phone].x - LIST.w / 2;
const slotLeft = (n: 1 | 2) => PANEL.x + 10 + (n - 1) * (SLOT.w + 8);

/** A message dot: Dana's is a circle and Omar's a rounded square, so shape and colour both tell them apart. */
function Marker({ sender, x, y, r = 5.5 }: { sender: Sender; x: number; y: number; r?: number }) {
  const tone = TONES[SENDER_TONE[sender]];
  return sender === "dana" ? (
    <circle cx={x} cy={y} r={r} className={cn(tone.solidFill, "stroke-card")} strokeWidth={1.5} />
  ) : (
    <rect x={r1(x - r)} y={r1(y - r)} width={r * 2} height={r * 2} rx={2.5} className={cn(tone.solidFill, "stroke-card")} strokeWidth={1.5} />
  );
}

function ListRows({ run, phone, sort, t, disagree }: { run: OrderRun; phone: PhoneId; sort: Sort; t: number; disagree: boolean }) {
  const rows = phoneRows(run, phone, sort, t);
  const left = listLeft(phone);
  return (
    <g role="list" aria-label={listText(run, phone, sort)}>
      {rows.map((row: Row | null, i) => {
        const y = LIST.y + i * LIST.rowH;
        const held = row?.state === "held";
        return (
          <g key={i} role="listitem" aria-label={row ? (held ? `Number ${row.n} is held, it waits for number ${row.n - 1}` : `Number ${row.n}, ${SENDER_NAME[row.sender]}: ${SENDER_TEXT[row.sender]}`) : "empty"}>
            <rect
              x={left}
              y={y}
              width={LIST.w}
              height={22}
              rx={8}
              strokeWidth={1.5}
              strokeDasharray={row && !held ? undefined : "4 3"}
              className={cn(NEUTRAL.surface, row && !held ? (disagree ? TONES.bad.stroke : NEUTRAL.line) : NEUTRAL.faintStroke, "transition-colors duration-200 motion-reduce:transition-none")}
              opacity={row ? (held ? 0.6 : 1) : 0.5}
            />
            {row ? (
              <g opacity={held ? 0.6 : 1}>
                <circle cx={left + 13} cy={y + 11} r={8} className={held ? "fill-muted" : cn(TONES[SENDER_TONE[row.sender]].softFill)} />
                <text x={left + 13} y={y + 15} textAnchor="middle" className={cn(NEUTRAL.text, "text-[11.5px] font-bold tabular-nums")}>{row.n}</text>
                <text x={left + 28} y={y + 15} className={cn(held ? NEUTRAL.mutedText : NEUTRAL.text, "text-[11.5px] font-medium")}>
                  {held ? `waits for no. ${row.n - 1}` : `${SENDER_NAME[row.sender]}: ${SENDER_TEXT[row.sender]}`}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

/** 22.4 beat 2: tap Send for Dana and Omar, drag the delay to Sami, and sort by arrival or by number. */
export function SequencePlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const settled = useSettledStart(clock.seconds);
  const [taps, setTaps] = useState<Sender[]>(["dana", "omar"]);
  const [delay, setDelay] = useState<number>(DELAY_DEFAULT);
  const [sort, setSort] = useState<Sort>("arrival");

  const complete = taps.length === 2;
  const first = taps[0];
  const run = orderRun(first, delay, complete ? 2 : 1);
  const t = clock.reduced || settled ? Infinity : simAt(run, clock.seconds);
  const grab = (g: boolean) => (g ? clock.freeze() : clock.unfreeze());

  const tap = (s: Sender) => {
    if (taps.length === 2) setTaps([s]);
    else if (taps[0] !== s) setTaps([taps[0], s]);
    else return;
    clock.restart();
  };

  const verdict = complete
    ? orderVerdict(run, sort)
    : { text: `Tap Send under ${SENDER_NAME[other(first)]}`, tone: "accent" as Tone };
  const hold = sort === "number" ? holdMs(run) : 0;
  const disagree = complete && sort === "arrival" && verdict.tone === "bad";

  const statusOf = (phone: PhoneId): { text: string; tone: Tone } => {
    const shown = phoneRows(run, phone, sort, t).filter((r): r is Row => !!r && r.state === "shown").map((r) => r.n);
    if (shown.length === 0) return { text: "nothing yet", tone: "accent" };
    const inOrder = shown.every((n, i) => i === 0 || n > shown[i - 1]);
    const tone: Tone = !inOrder ? "bad" : shown[0] !== 1 ? "warn" : "good";
    return { text: `shows ${shown.join(", ")}`, tone };
  };

  const hops = legs(run).map((leg) => ({ leg, p: legProgress(leg, t) })).filter((h) => h.p !== null);
  const pointOf = (leg: (typeof hops)[number]["leg"], p: number): Pt => {
    if (leg.to === "service") {
      const [a, b] = PATH_IN[leg.sender];
      return lerp(a, b, p);
    }
    const [a, b] = PATH_OUT[leg.to];
    return lerp(a, b, p);
  };
  const arrivedAtService = (n: 1 | 2) => run.msgs.find((m) => m.n === n && m.atService <= t);

  const description = `Dana and Omar write to the same chat. ${SENDER_NAME[first]} sends first. The service numbers messages 1 and 2 in the order they arrive. The path to Sami takes ${msText(delay)} for message 1. Phones sort by ${sort}. ${listText(run, "layla", sort)}. ${listText(run, "sami", sort)}. ${hold > 0 ? `Sami's phone holds message 2 for ${hold} milliseconds. ` : ""}${verdict.text}.`;

  const sendButton = (s: Sender) => {
    const index = taps.indexOf(s);
    const sent = index >= 0;
    const text = !sent ? "Send" : index === 0 ? "Sent first" : "Sent second";
    return (
      <SvgPillButton
        x={SENDERS[s].x - BUTTON.w / 2}
        y={BUTTON.y}
        width={BUTTON.w}
        text={text}
        label={`${SENDER_NAME[s]} sends "${SENDER_TEXT[s]}"${sent ? `, sent ${index === 0 ? "first" : "second"}` : ""}`}
        primary={!sent && !complete && taps.length === 1}
        onPress={() => tap(s)}
      />
    );
  };

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap <b>Send</b> under Dana and under Omar, then drag the <b>delay</b> to Sami.
        </>
      }
      controls={
        <>
          <BeatChoice<Sort>
            label="Phones sort by"
            options={[
              { id: "arrival", label: "Sort by arrival" },
              { id: "number", label: "Sort by number" },
            ]}
            value={sort}
            onChange={setSort}
          />
          <BeatActionButton onClick={clock.restart}>Replay</BeatActionButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The paths, drawn first so the cards cover their ends. */}
          <g aria-hidden>
            {(["dana", "omar"] as Sender[]).map((s) => (
              <line key={s} x1={PATH_IN[s][0][0]} y1={PATH_IN[s][0][1]} x2={PATH_IN[s][1][0]} y2={PATH_IN[s][1][1]} strokeWidth={1.75} strokeDasharray="3 4" strokeLinecap="round" className={NEUTRAL.faintStroke} />
            ))}
            {(["layla", "sami"] as PhoneId[]).map((p) => (
              <line key={p} x1={PATH_OUT[p][0][0]} y1={PATH_OUT[p][0][1]} x2={PATH_OUT[p][1][0]} y2={PATH_OUT[p][1][1]} strokeWidth={1.75} strokeDasharray="3 4" strokeLinecap="round" className={p === "sami" && delay > 140 ? TONES.warn.stroke : NEUTRAL.faintStroke} />
            ))}
          </g>

          <SvgNode x={SENDERS.dana.x} y={SENDERS.dana.y} label="Dana" kind="phone" status={`writes: ${SENDER_TEXT.dana}`} statusTone="accent" />
          <SvgNode x={SENDERS.omar.x} y={SENDERS.omar.y} label="Omar" kind="phone" status={`writes: ${SENDER_TEXT.omar}`} statusTone="warn" />
          {sendButton("dana")}
          {sendButton("omar")}

          {/* The chat service and its numbered lane. */}
          <g>
            <rect x={PANEL.x} y={PANEL.y + 3} width={PANEL.w} height={PANEL.h} rx={14} className="fill-foreground/[0.06]" />
            <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={14} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
            <text x={PANEL.x + PANEL.w / 2} y={PANEL.y + 20} textAnchor="middle" className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Chat service</text>
            {([1, 2] as const).map((n) => {
              const m = arrivedAtService(n);
              const x = slotLeft(n);
              return (
                <g key={n} role="img" aria-label={m ? `Number ${n}: ${SENDER_NAME[m.sender]}, ${SENDER_TEXT[m.sender]}` : `Number ${n}: empty`}>
                  <rect x={x} y={SLOT.y} width={SLOT.w} height={SLOT.h} rx={10} strokeWidth={1.5} strokeDasharray={m ? undefined : "4 3"} className={cn(m ? cn(TONES[SENDER_TONE[m.sender]].softFill, TONES[SENDER_TONE[m.sender]].stroke) : cn(NEUTRAL.surface, NEUTRAL.faintStroke), "transition-colors duration-200 motion-reduce:transition-none")} />
                  <text x={x + 9} y={SLOT.y + 15} className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>no. {n}</text>
                  {m ? (
                    <>
                      <text x={x + 9} y={SLOT.y + 31} className={cn(NEUTRAL.text, "text-[12px] font-bold")}>{`${SENDER_NAME[m.sender]}: ${SENDER_TEXT[m.sender]}`}</text>
                    </>
                  ) : null}
                </g>
              );
            })}
          </g>

          <SvgNode x={PHONES.layla.x} y={PHONES.layla.y} label="Layla" kind="phone" status={statusOf("layla").text} statusTone={statusOf("layla").tone} />
          <SvgNode x={PHONES.sami.x} y={PHONES.sami.y} label="Sami" kind="phone" status={statusOf("sami").text} statusTone={statusOf("sami").tone} mark={disagree ? "bad" : undefined} />

          {/* The delay on each path, beside the line. */}
          {(
            [
              ["layla", 136, "40 ms", false],
              ["sami", 352, `slow: ${msText(delay)}`, true],
            ] as const
          ).map(([p, cx, text, slow]) => {
            const w = r1(text.length * 6.4 + 18);
            return (
              <g key={p}>
                <rect x={r1(cx - w / 2 + (p === "layla" ? -44 : 0))} y={257} width={w} height={20} rx={10} strokeWidth={1.5} className={cn(NEUTRAL.surface, slow && delay > 140 ? TONES.warn.stroke : NEUTRAL.line)} />
                <text x={r1(cx + (p === "layla" ? -44 : 0))} y={271.2} textAnchor="middle" className={cn(slow && delay > 140 ? TONES.warn.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>{text}</text>
              </g>
            );
          })}

          {/* Messages in flight. */}
          <g aria-hidden>
            {hops.map(({ leg, p }) => {
              const [x, y] = pointOf(leg, p as number);
              return <Marker key={`${leg.n}-${leg.to}`} sender={leg.sender} x={x} y={y} />;
            })}
          </g>

          {/* What each phone shows. */}
          <ListRows run={run} phone="layla" sort={sort} t={t} disagree={false} />
          <ListRows run={run} phone="sami" sort={sort} t={t} disagree={disagree} />
          {hold > 0 ? (
            <g>
              <rect x={PHONES.sami.x - 52} y={LIST.y + 2 * LIST.rowH + 2} width={104} height={20} rx={10} strokeWidth={1.5} className={cn(TONES.warn.softFill, TONES.warn.stroke)} />
              <text x={PHONES.sami.x} y={LIST.y + 2 * LIST.rowH + 16.2} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-semibold tabular-nums")}>{`no. 2 held ${msText(hold)}`}</text>
            </g>
          ) : null}

          {/* The delay to Sami: a rail with five stops. */}
          <text x={W / 2} y={RAIL.y - 26} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>slow path to Sami: the first message takes</text>
          <SnapStopsRail
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            stops={DELAY_STEPS.map((v) => ({ value: v, label: v >= 1000 ? "1 s" : `${v} ms` }))}
            value={delay}
            onChange={setDelay}
            ariaLabel="Delay on the slow path to Sami"
            valueText={`${msText(delay)} delay to Sami for the first message. ${listText(run, "sami", sort)}`}
            onGrab={grab}
          />

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}

