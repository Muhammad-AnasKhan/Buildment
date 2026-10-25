"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailSlider } from "../primitives/rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { AXIS, B_DEFAULT, B_LADDER, bFromFraction, COPY_MS, cursorT, editVerdict, signedMs, SNAPS, twoRegions, type Rule } from "./model";

const W = 420;
const H = 352;
const EU_Y = 104;
const SG_Y = 214;
const X = (ms: number) => Math.round((20 + (ms - AXIS.from) * 0.95) * 10) / 10;
const AXIS_Y = 268;
const TICKS = [-80, 0, 80, 160, 240];
const R = 14;

const at = (x0: number, y0: number, x1: number, y1: number, p: number) => ({ x: Math.round((x0 + (x1 - x0) * p) * 10) / 10, y: Math.round((y0 + (y1 - y0) * p) * 10) / 10 });

function Blob({ x, y, dropped, conflict }: { x: number; y: number; dropped: boolean; conflict: boolean }) {
  return (
    <g opacity={dropped ? 0.45 : 1} className={SHAPE_TRANSITION}>
      <circle cx={x} cy={y} r={R} strokeWidth={2.5} strokeDasharray={dropped ? "4 3" : undefined} className={cn(TONES.accent.softFill, dropped ? TONES.bad.stroke : conflict ? TONES.warn.stroke : TONES.accent.stroke)} />
      <Pencil x={x - 8} y={y - 8} width={16} height={16} strokeWidth={2} className={cn("fill-none", TONES.accent.stroke)} aria-hidden />
      {dropped ? <line x1={x - R - 3} y1={y + R + 3} x2={x + R + 3} y2={y - R - 3} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} /> : null}
    </g>
  );
}

/** Beat 2 of 8.6: drag the Singapore edit along the timeline and see when the two edits clash. */
export function TwoRegionsEditCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const clock = useBeatClock(box);
  const [b, setB] = useState<number>(B_DEFAULT);
  const [rule, setRule] = useState<Rule>("none");
  const o = twoRegions(b, rule);
  const v = editVerdict(o, rule);
  const c = cursorT(clock.seconds);

  const euX = X(0);
  const sgX = X(o.b);
  const euLand = { x: X(o.euCopyLandsAt), y: SG_Y };
  const sgLand = { x: X(o.sgCopyLandsAt), y: EU_Y };
  const euP = (c - 0) / COPY_MS;
  const sgP = (c - o.b) / COPY_MS;
  const euDropped = o.dropped === "EU";
  const sgDropped = o.dropped === "SG";

  const note = (region: "EU" | "SG") => (o.kept === region ? ": kept" : o.dropped === region ? ": lost" : "");
  const summary = `The EU edit is at 0 ms and the Singapore edit at ${signedMs(o.b)}. A copy takes ${COPY_MS} ms to cross. ${o.conflict ? "Each region accepted its edit before the other's copy arrived, so the edits clash." : "The later edit already had the earlier one, so there is no clash."} ${rule === "lww" && o.conflict ? `Last writer wins keeps the ${o.kept === "SG" ? "Singapore" : "EU"} edit and drops the other without a message.` : ""}`.trim();

  const landing = (p: { x: number; y: number }, arrived: boolean, key: string) => (
    <g key={key} opacity={arrived ? 1 : 0.25} className={SHAPE_TRANSITION}>
      <circle cx={p.x} cy={p.y} r={9} strokeWidth={2.5} className={cn(o.conflict ? cn(TONES.bad.softFill, TONES.bad.stroke) : cn(TONES.good.softFill, TONES.good.stroke))} />
      <text x={p.x} y={p.y + 4.2} textAnchor="middle" className={cn("text-[11.5px] font-bold", o.conflict ? TONES.bad.text : TONES.good.text)}>{o.conflict ? "!" : "ok"}</text>
    </g>
  );

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the <b>Singapore edit</b>.</>}
      controls={
        <BeatButton pressed={rule === "lww"} onClick={() => setRule((r) => (r === "lww" ? "none" : "lww"))}>
          Rule: {rule === "lww" ? "last writer wins" : "none"}
        </BeatButton>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          <VerdictBanner width={W} tone={v.tone} text={v.text} />

          {/* The EU lane, its edit and its titles. */}
          <text x={12} y={80} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>EU leader</text>
          <text x={408} y={80} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold tabular-nums")}>edit at 0 ms{note("EU")}</text>
          <line x1={X(AXIS.from)} x2={X(AXIS.to)} y1={EU_Y} y2={EU_Y} strokeWidth={2} strokeLinecap="round" className="stroke-muted" />

          {/* The copies: each edit is sent to the other region and lands 80 ms later. */}
          <line x1={euX} y1={EU_Y} x2={euLand.x} y2={euLand.y} strokeWidth={2} strokeLinecap="round" strokeDasharray="5 5" className={TONES.accent.stroke} />
          <line x1={sgX} y1={SG_Y} x2={sgLand.x} y2={sgLand.y} strokeWidth={2} strokeLinecap="round" strokeDasharray="5 5" className={TONES.accent.stroke} />
          {landing(euLand, c >= o.euCopyLandsAt, "eu-landing")}
          {landing(sgLand, c >= o.sgCopyLandsAt, "sg-landing")}
          {euP > 0 && euP < 1 ? <circle {...cxy(at(euX, EU_Y, euLand.x, euLand.y, euP))} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} /> : null}
          {sgP > 0 && sgP < 1 ? <circle {...cxy(at(sgX, SG_Y, sgLand.x, sgLand.y, sgP))} r={5} className={cn(TONES.accent.solidFill, "stroke-card")} strokeWidth={1.5} /> : null}

          <Blob x={euX} y={EU_Y} dropped={euDropped} conflict={o.conflict} />

          {/* The Singapore lane: its edit is the handle. */}
          <text x={12} y={250} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>Singapore leader</text>
          <text x={408} y={250} textAnchor="end" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-semibold tabular-nums")}>edit at {signedMs(o.b)}{note("SG")}</text>

          {/* The time axis. */}
          <line x1={X(AXIS.from)} x2={X(AXIS.to)} y1={AXIS_Y} y2={AXIS_Y} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
          {TICKS.map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1={AXIS_Y} y2={AXIS_Y + 6} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={X(t)} y={AXIS_Y + 21} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{t === 240 ? "240 ms" : t}</text>
            </g>
          ))}
          <text x={12} y={326} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>A copy takes {COPY_MS} ms to arrive.</text>
          <text x={12} y={342} className={cn(NEUTRAL.mutedText, "text-[12px]")}>{o.conflict ? "Red ring: the copy came too late, so the edits clash." : "Green ring: no clash, the later edit had seen the earlier."}</text>

          <RailSlider
            svgRef={svg}
            x0={X(-150)}
            x1={X(150)}
            y={SG_Y}
            label="Singapore edit time"
            valueText={`Singapore edit at ${signedMs(o.b)}. ${v.text}`}
            value={b}
            ladder={B_LADDER}
            fromFraction={bFromFraction}
            onChange={setB}
            onGrab={(g) => (g ? clock.freeze() : clock.unfreeze())}
          >
            <line x1={X(AXIS.from)} x2={X(AXIS.to)} y1={SG_Y} y2={SG_Y} strokeWidth={2} strokeLinecap="round" className="stroke-muted" />
            {SNAPS.map((s) => (
              <line key={s} x1={X(s)} x2={X(s)} y1={SG_Y + 8} y2={SG_Y + 18} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
            ))}
            <circle cx={sgX} cy={SG_Y} r={R + 5} className={cn(TONES.accent.softFill, "opacity-70")} />
            <Blob x={sgX} y={SG_Y} dropped={sgDropped} conflict={o.conflict} />
          </RailSlider>
        </svg>
      </div>
    </BeatFrame>
  );
}

function cxy(p: { x: number; y: number }) {
  return { cx: p.x, cy: p.y };
}
