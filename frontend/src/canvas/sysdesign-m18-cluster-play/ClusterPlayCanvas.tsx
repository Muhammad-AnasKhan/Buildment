"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { ladderStep, SliderRail } from "../primitives/picture-slider";
import { SvgButton } from "../primitives/svg-button";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  LOAD_LADDER,
  LOAD_MAX,
  MAX_PODS,
  WARM_S,
  advance,
  capacityOf,
  cpuOf,
  desiredNow,
  droppedOf,
  initSim,
  isServing,
  killPod,
  loadFraction,
  loadFromFraction,
  perPodLoad,
  servingCount,
  setAuto,
  setLoad,
  settle,
  toggleProbe,
  verdictFor,
  type Pod,
  type Sim,
} from "./model";

const W = 420;
const H = 476;
const CARD = { w: 92, h: 104 };
const COL_X = [12, 112, 212, 312];
const TOP_Y = 50;
const BOT_Y = 268;
const BAR = { x: 12, y: 196, w: 396, h: 30 };
const DROP_X = 414;
const RAIL = { x0: 40, x1: 380, y: 432 };
const TRAVEL_S = 0.5;
const DROP_S = 1.3;

const slotXY = (i: number) => ({ x: COL_X[i % 4], y: i < 4 ? TOP_Y : BOT_Y });
const cpuTone = (cpu: number): Tone => (cpu >= 100 ? "bad" : cpu >= 75 ? "warn" : "good");
const frac = (v: number) => v - Math.floor(v);

type PodLook = { chip: string; chipTone: Tone; text: string; textTone: Tone | null; bar: number; barTone: Tone };

function lookOf(p: Pod, cpu: number): PodLook {
  if (p.state === "killed") return { chip: "gone", chipTone: "bad", text: "killed", textTone: "bad", bar: 0, barTone: "bad" };
  if (p.state === "starting") return { chip: "starting", chipTone: "accent", text: "warming", textTone: "accent", bar: 1 - p.left / WARM_S, barTone: "accent" };
  if (p.probeFail) return { chip: "not ready", chipTone: "warn", text: "no traffic", textTone: "warn", bar: 0, barTone: "good" };
  return { chip: "ready", chipTone: "good", text: `${Math.round(cpu)}%`, textTone: cpuTone(cpu), bar: cpu / 100, barTone: cpuTone(cpu) };
}

/** 18.4 beat 5: kill a pod, fail a probe, drag the load, and watch the Deployment and the autoscaler respond. */
export function ClusterPlayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const { seconds, reduced } = clock;
  const [sim, setSim] = useState<Sim>(() => initSim());
  const last = useRef(seconds);

  useEffect(() => {
    const dt = seconds - last.current;
    last.current = seconds;
    if (reduced || dt <= 0 || dt > 0.25) return;
    setSim((s) => advance(s, dt));
  }, [seconds, reduced]);

  // Under reduced motion each action jumps straight to the settled picture.
  const act = (fn: (s: Sim) => Sim) => setSim((s) => (reduced ? settle(fn(s)) : fn(s)));
  const reset = () => setSim(initSim(sim.auto));

  const cpu = cpuOf(sim);
  const serving = servingCount(sim);
  const cap = capacityOf(sim);
  const dropped = droppedOf(sim);
  const verdict = verdictFor(sim);
  const want = desiredNow(sim);
  const perPod = perPodLoad(sim);

  const t = seconds;
  const dots: { key: string; x: number; y: number }[] = [];
  sim.pods.forEach((p, i) => {
    if (!isServing(p) || sim.load <= 0) return;
    const { x } = slotXY(i);
    const cx = x + CARD.w / 2;
    const top = i < 4;
    const y0 = top ? BAR.y : BAR.y + BAR.h;
    const y1 = top ? TOP_Y + CARD.h : BOT_Y;
    const n = Math.max(1, Math.ceil(Math.min(8, perPod / 12) * TRAVEL_S));
    for (let k = 0; k < n; k++) {
      const p01 = frac(t / TRAVEL_S + k / n + i * 0.13);
      dots.push({ key: `${p.id}-${k}`, x: cx, y: Math.round((y0 + (y1 - y0) * p01) * 10) / 10 });
    }
  });
  const dropDots: { key: number; y: number }[] = [];
  if (dropped > 0) {
    const n = Math.min(6, Math.ceil(dropped / 50));
    for (let k = 0; k < n; k++) dropDots.push({ key: k, y: Math.round((BAR.y + BAR.h / 2 + (392 - BAR.y - BAR.h / 2) * frac(t / DROP_S + k / n)) * 10) / 10 });
  }

  const marks = cap > 0 ? [{ at: loadFraction(cap), label: `full at ${cap}`, tone: "warn" as const }] : [];
  const autoText = sim.auto ? `autoscaler wants ${want}` : "autoscaler off";
  const description = `${verdict.text}. ${serving} of ${sim.pods.length} pods are serving. Load ${sim.load} requests a second, each serving pod ${Math.round(cpu)}% busy${dropped > 0 ? `, ${dropped} requests a second dropped` : ""}. ${sim.auto ? `The autoscaler wants ${want} pods.` : "The autoscaler is off."}`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>pod</b> to kill it, tap its <b>pill</b> to fail its probe, drag the <b>load</b>.
        </>
      }
      controls={
        <>
          <BeatChoice label="Autoscaler" options={[{ id: "off", label: "Autoscaler off" }, { id: "on", label: "Autoscaler on" }]} value={sim.auto ? "on" : "off"} onChange={(v) => act((s) => setAuto(s, v === "on"))} />
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* Empty places a Deployment can grow into (up to 8 pods). */}
          {Array.from({ length: MAX_PODS - sim.pods.length }, (_, k) => {
            const { x, y } = slotXY(sim.pods.length + k);
            return <rect key={`slot-${k}`} x={x} y={y} width={CARD.w} height={CARD.h} rx={13} strokeWidth={1.5} strokeDasharray="5 5" className="fill-none stroke-muted-foreground/30" />;
          })}

          {/* The Service reaches only serving pods. */}
          {sim.pods.map((p, i) => {
            const { x } = slotXY(i);
            const cx = x + CARD.w / 2;
            const top = i < 4;
            const on = isServing(p);
            return (
              <line
                key={`wire-${p.id}`}
                x1={cx}
                x2={cx}
                y1={top ? BAR.y : BAR.y + BAR.h}
                y2={top ? TOP_Y + CARD.h : BOT_Y}
                strokeWidth={on ? 2 : 1.5}
                strokeDasharray={on ? undefined : "3 5"}
                className={cn("transition-colors duration-200 motion-reduce:transition-none", on ? TONES.accent.stroke : NEUTRAL.faintStroke)}
              />
            );
          })}

          {/* The Service bar. */}
          <rect x={BAR.x} y={BAR.y + 3} width={BAR.w} height={BAR.h} rx={15} className="fill-foreground/[0.06]" />
          <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx={15} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <text x={BAR.x + 14} y={BAR.y + 19.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold tabular-nums")}>{`Service: ${sim.load} requests a second`}</text>
          <text x={BAR.x + BAR.w - 14} y={BAR.y + 19.5} textAnchor="end" className={cn(sim.auto && want !== sim.replicas ? TONES.accent.text : NEUTRAL.mutedText, "text-[12px] font-semibold tabular-nums")}>{autoText}</text>

          {/* The pods. */}
          {sim.pods.map((p, i) => {
            const { x, y } = slotXY(i);
            const look = lookOf(p, cpu);
            const killed = p.state === "killed";
            const dashed = p.state === "starting";
            const state = killed ? "killed" : p.state === "starting" ? "starting" : p.probeFail ? "alive but not ready" : `ready, ${Math.round(cpu)}% busy`;
            return (
              <g key={p.id} style={{ transform: `translate(${x}px, ${y}px)` }} className="transition-transform duration-300 motion-reduce:transition-none">
                <g className="animate-in fade-in zoom-in-90 [animation-duration:400ms] [transform-box:fill-box] origin-center motion-reduce:animate-none">
                  <rect x={0} y={3} width={CARD.w} height={CARD.h} rx={13} className="fill-foreground/[0.06]" />
                  <rect x={0} y={0} width={CARD.w} height={CARD.h} rx={13} strokeWidth={killed ? 2.5 : 1.5} strokeDasharray={dashed ? "5 4" : undefined} className={cn(NEUTRAL.surface, killed ? TONES.bad.stroke : dashed ? TONES.accent.stroke : p.probeFail ? TONES.warn.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                  {killed ? <rect x={0} y={0} width={CARD.w} height={CARD.h} rx={13} className={TONES.bad.softFill} /> : null}

                  <SvgButton x={0} y={0} width={CARD.w} height={58} rx={13} label={`Kill pod ${p.id}, ${state}`} onPress={() => act((s) => killPod(s, p.id))}>
                    <text x={10} y={19} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`pod ${p.id}`}</text>
                    <X x={CARD.w - 22} y={8} width={12} height={12} strokeWidth={2.5} className="text-muted-foreground" aria-hidden />
                    <rect x={10} y={28} width={72} height={9} rx={4.5} className="fill-muted" />
                    {look.bar > 0 ? <rect x={10} y={28} width={Math.max(5, Math.round(look.bar * 72 * 10) / 10)} height={9} rx={4.5} className={cn(TONES[look.barTone].solidFill, "transition-colors duration-200 motion-reduce:transition-none")} /> : null}
                    <text x={CARD.w / 2} y={53} textAnchor="middle" className={cn(look.textTone ? TONES[look.textTone].text : NEUTRAL.mutedText, "text-[12.5px] font-bold tabular-nums")}>{look.text}</text>
                  </SvgButton>

                  <SvgButton x={4} y={60} width={CARD.w - 8} height={40} rx={13} label={killed ? `Pod ${p.id} is gone` : `Readiness probe of pod ${p.id}: ${state}. Press to ${p.probeFail ? "fix" : "fail"} it`} onPress={() => act((s) => toggleProbe(s, p.id))}>
                    <rect x={7} y={69} width={CARD.w - 14} height={22} rx={11} strokeWidth={1.5} className={cn(TONES[look.chipTone].softFill, TONES[look.chipTone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                    <text x={CARD.w / 2} y={84.5} textAnchor="middle" className={cn(TONES[look.chipTone].text, "text-[11.5px] font-semibold")}>{look.chip}</text>
                  </SvgButton>
                </g>
              </g>
            );
          })}

          {/* Requests flow from the Service to serving pods; the rest fall off the right edge. */}
          {dots.map((d) => (
            <circle key={d.key} cx={d.x} cy={d.y} r={3.2} className={TONES.accent.solidFill} />
          ))}
          {dropDots.map((d) => (
            <circle key={`drop-${d.key}`} cx={DROP_X} cy={d.y} r={3.2} className={TONES.bad.solidFill} />
          ))}
          {dropped > 0 ? <text x={W - 24} y={BOT_Y + CARD.h + 22} textAnchor="end" className={cn(TONES.bad.text, "text-[12.5px] font-bold tabular-nums")}>{`${dropped} a second dropped`}</text> : null}

          <TightRailSlider
            svgRef={svg}
            x0={RAIL.x0}
            x1={RAIL.x1}
            y={RAIL.y}
            label="Load in requests a second"
            valueText={`${sim.load} requests a second, ${Math.round(cpu)}% busy${dropped > 0 ? `, ${dropped} dropped` : ""}`}
            value={sim.load}
            min={0}
            max={LOAD_MAX}
            fromFraction={loadFromFraction}
            onKey={(v, k) => ladderStep(LOAD_LADDER, v, k)}
            onChange={(v) => act((s) => setLoad(s, v))}
            above={24}
            below={40}
            side={26}
          >
            <SliderRail x0={RAIL.x0} x1={RAIL.x1} y={RAIL.y} fraction={loadFraction(sim.load)} marks={marks} ends={["0", `${LOAD_MAX}`]} caption={`Load: ${sim.load} a second`} />
          </TightRailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
