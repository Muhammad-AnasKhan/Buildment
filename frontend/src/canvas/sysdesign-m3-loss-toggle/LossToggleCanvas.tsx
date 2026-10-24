"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgChip, chipWidth, rowPositions } from "../primitives/svg-chip";
import { NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  FILES,
  REST_MS,
  VERSIONS,
  fileTones,
  finishMs,
  flightAt,
  lossVerdict,
  networkMs,
  timelines,
  type FileTimeline,
  type VersionId,
} from "../models/loss-compare";

const W = 420;
const H = 324;
const SERVER = { x: 62, y: 142 };
const BROWSER = { x: 358, y: 142 };
const LANES = [112, 142, 172] as const;
const LANE_X0 = SERVER.x + NODE_W / 2 + 14;
const LANE_X1 = BROWSER.x - NODE_W / 2 + 22;
const EDGE_R = BROWSER.x - NODE_W / 2;
const CHIPS_Y = 60;
const HELD = { x: 300, y: 192, w: 112, h: 40, slots: [326, 356, 386] as const, slotY: 206 };
const STRIP = { x0: 40, x1: 380, rows: [250, 270, 290] as const, axis: 302, maxMs: 320 };
const SLIDE_MS = 10;

const laneX = (pos: number) => LANE_X0 + (LANE_X1 - LANE_X0) * pos;
const stripX = (ms: number) => STRIP.x0 + (ms / STRIP.maxMs) * (STRIP.x1 - STRIP.x0);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ramp = (v: number) => Math.max(0, Math.min(1, v));

/** A file's packet: a small labelled tag with an opaque base, so lanes never run through the letter. */
function Packet({ x, y, letter, tone, opacity = 1 }: { x: number; y: number; letter: string; tone: Tone; opacity?: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={opacity}>
      <rect x={-12} y={-9} width={24} height={18} rx={5} className="fill-card" />
      <rect x={-12} y={-9} width={24} height={18} rx={5} strokeWidth={1.5} className={cn(TONES[tone].softFill, TONES[tone].stroke)} />
      <text x={0} y={4.5} textAnchor="middle" className={cn(TONES[tone].text, "text-[12px] font-bold")}>{letter}</text>
    </g>
  );
}

function Cross({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden>
      <line x1={x - 5} x2={x + 5} y1={y - 5} y2={y + 5} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
      <line x1={x - 5} x2={x + 5} y1={y + 5} y2={y - 5} strokeWidth={2.5} strokeLinecap="round" className={TONES.bad.stroke} />
    </g>
  );
}

type Drawn = { x: number; y: number; tone: Tone; opacity: number };

/** What to draw for one file at network time `ms`, and where its tap target sits. */
function drawFile(tl: FileTimeline, k: number, ms: number) {
  const y = LANES[k];
  const packets: Drawn[] = [];
  let crossAt: number | null = null;
  let hitX = LANE_X0;

  tl.flights.forEach((f, idx) => {
    const st = flightAt(f, ms);
    const tone: Tone = idx === 0 ? "accent" : "warn";
    if (st.phase === "before") {
      if (idx === 0) packets.push({ x: LANE_X0, y, tone: "accent", opacity: 0.5 });
      return;
    }
    hitX = Math.min(laneX(st.pos), EDGE_R - 14);
    if (st.phase === "flying") packets.push({ x: laneX(st.pos), y, tone: f.lost ? "bad" : tone, opacity: 1 });
    if (st.phase === "falling") {
      packets.push({ x: laneX(st.pos), y: y + st.fall * 22, tone: "bad", opacity: 1 - st.fall });
      crossAt = st.pos;
    }
    if (st.phase === "after" && f.lost) crossAt = st.pos;
  });

  // HTTP/2: the file arrived, but TCP holds it until the resend has come.
  let held: Drawn | null = null;
  if (tl.heldFromMs !== null && ms >= tl.heldFromMs) {
    const slot = { x: HELD.slots[k], y: HELD.slotY };
    if (ms < tl.usableMs) {
      const s = ramp((ms - tl.heldFromMs) / SLIDE_MS);
      held = { x: lerp(EDGE_R + 8, slot.x, s), y: lerp(y, slot.y, s), tone: "warn", opacity: 1 };
    } else {
      const s = ramp((ms - tl.usableMs) / SLIDE_MS);
      if (s < 1) held = { x: lerp(slot.x, BROWSER.x, s), y: lerp(slot.y, BROWSER.y, s), tone: "good", opacity: 1 - s };
    }
    if (ms >= tl.heldFromMs) hitX = EDGE_R - 14;
  }
  return { packets, crossAt, held, hitX, y };
}

/** 3.4: pick a version, tap a packet to drop it, and see which files wait. */
export function LossToggleCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [version, setVersion] = useState<VersionId>("h2");
  const [drop, setDrop] = useState<number | null>(0);

  const tls = timelines(version, drop);
  const verdict = lossVerdict(version, drop);
  const tones = fileTones(version, drop);
  const end = finishMs(version, drop);
  const ms = clock.reduced ? end + REST_MS : networkMs(clock.seconds, version, drop);
  const info = VERSIONS.find((v) => v.id === version) ?? VERSIONS[1];

  const ready = tls.filter((t) => ms >= t.usableMs).length;
  const heldCount = tls.filter((t) => t.heldFromMs !== null && ms >= t.heldFromMs && ms < t.usableMs).length;
  const lostFlight = drop !== null ? tls[drop].flights[0] : null;
  const resendFlight = drop !== null ? tls[drop].flights[1] : null;
  const serverStatus =
    ms >= end ? "done" : lostFlight && resendFlight && ms >= lostFlight.fromMs + 0.55 * (lostFlight.toMs - lostFlight.fromMs) ? `resends ${FILES[drop as number]}` : "sending";

  const summary = `${info.name}, ${drop === null ? "no packet dropped" : `the packet for file ${FILES[drop]} dropped`}. The files become usable at ${tls.map((t) => `${t.file} ${t.usableMs} ms`).join(", ")}. ${verdict.text}.`;

  const press = (k: number) => {
    setDrop((d) => (d === k ? null : k));
    clock.restart();
  };

  const chipXs = rowPositions(VERSIONS.map((v) => chipWidth(v.chip)), 14);
  const chipSpots = VERSIONS.map((v, i) => ({ v, x: chipXs[i] }));

  const drawn = tls.map((tl, k) => drawFile(tl, k, ms));

  return (
    <BeatFrame
      label={title}
      limits={limits}
      controls={<BeatButton onClick={() => clock.restart()}>Replay</BeatButton>}
      hint={<>Tap a <b>packet</b> to drop it. Tap again to undo.</>}
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{summary}</desc>
          <DotGrid width={W} height={H} />

          {LANES.map((y) => (
            <line key={y} x1={SERVER.x + NODE_W / 2} x2={EDGE_R} y1={y} y2={y} strokeWidth={1.5} strokeDasharray="4 5" strokeLinecap="round" className={NEUTRAL.faintStroke} />
          ))}

          {version === "h2" ? (
            <g>
              <rect x={HELD.x} y={HELD.y} width={HELD.w} height={HELD.h} rx={10} strokeWidth={1.5} strokeDasharray="5 4" className={cn("fill-card", NEUTRAL.faintStroke)} />
              <text x={HELD.x + HELD.w / 2} y={HELD.y + HELD.h - 7} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>held by TCP</text>
            </g>
          ) : null}

          {drawn.map((d, k) => d.packets.map((p, i) => <Packet key={`p-${k}-${i}`} x={p.x} y={p.y} letter={FILES[k]} tone={p.tone} opacity={p.opacity} />))}
          {drawn.map((d, k) => (d.held ? <Packet key={`h-${k}`} x={d.held.x} y={d.held.y} letter={FILES[k]} tone={d.held.tone} opacity={d.held.opacity} /> : null))}

          <SvgNode x={SERVER.x} y={SERVER.y} label="Server" kind="server" status={serverStatus} />
          <SvgNode x={BROWSER.x} y={BROWSER.y} label="Browser" kind="phone" status={`${ready}/3 ready`} statusTone={ready === 3 ? "good" : heldCount > 0 ? "warn" : undefined} />

          {drawn.map((d, k) => (d.crossAt !== null ? <Cross key={`x-${k}`} x={laneX(d.crossAt)} y={d.y} /> : null))}

          {/* The strip: when each file becomes usable. */}
          {FILES.map((f, k) => (
            <text key={`row-${f}`} x={20} y={STRIP.rows[k] + 4.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12px] font-bold")}>{f}</text>
          ))}
          <line x1={STRIP.x0} x2={STRIP.x1} y1={STRIP.axis} y2={STRIP.axis} strokeWidth={1.5} className={NEUTRAL.line} />
          {[0, 80, 160, 240, 320].map((t) => (
            <g key={t}>
              <line x1={stripX(t)} x2={stripX(t)} y1={STRIP.axis - 4} y2={STRIP.axis + 4} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={stripX(t)} y={STRIP.axis + 18} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t === 320 ? "320 ms" : t}</text>
            </g>
          ))}
          {tls.map((tl, k) => {
            const label = `${tl.file} ${tl.usableMs} ms`;
            const w = label.length * 7.2 + 16;
            const cx = Math.max(STRIP.x0 + w / 2, Math.min(W - 8 - w / 2, stripX(tl.usableMs)));
            const shown = ms >= tl.usableMs;
            const t = TONES[tones[k]];
            return (
              <g key={`tag-${tl.file}`} opacity={shown ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
                <rect x={cx - w / 2} y={STRIP.rows[k] - 10} width={w} height={20} rx={10} className="fill-card" />
                <rect x={cx - w / 2} y={STRIP.rows[k] - 10} width={w} height={20} rx={10} strokeWidth={1.5} className={cn(t.softFill, t.stroke)} />
                <text x={cx} y={STRIP.rows[k] + 4.5} textAnchor="middle" className={cn(t.text, "text-[12px] font-bold tabular-nums")}>{label}</text>
              </g>
            );
          })}

          {chipSpots.map(({ v, x }) => (
            <SvgChip key={v.id} x={x} y={CHIPS_Y} text={v.chip} label={v.name} pressed={v.id === version} onPress={() => { setVersion(v.id); clock.restart(); }} />
          ))}

          {/* Tap targets: one per file, riding along with its packet. */}
          {drawn.map((d, k) => (
            <g
              key={`hit-${k}`}
              role="button"
              tabIndex={0}
              aria-label={drop === k ? `Undo the drop of file ${FILES[k]}` : `Drop the packet for file ${FILES[k]}`}
              aria-pressed={drop === k}
              className="group cursor-pointer outline-none"
              onClick={() => press(k)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                press(k);
              }}
            >
              <rect x={d.hitX - 24} y={d.y - 15} width={48} height={30} rx={10} fill="none" pointerEvents="all" />
              <rect x={d.hitX - 24} y={d.y - 15} width={48} height={30} rx={10} className={cn("fill-none opacity-0 group-focus-visible:opacity-100", TONES.accent.stroke)} strokeWidth={2.5} />
            </g>
          ))}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
