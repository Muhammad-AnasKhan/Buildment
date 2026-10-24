"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RadioChipRow } from "../primitives/radio-chip-row";
import { SvgChip, chipWidth } from "../primitives/svg-chip";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, SHAPE_TRANSITION, TONES } from "../primitives/tones";
import {
  ALERTS,
  BUDGET_MIN,
  DEFAULT_INCIDENT,
  INCIDENTS,
  NAIVE_CAPTION,
  badMinutes,
  budgetShare,
  burnCurve,
  burnText,
  burnRate,
  firingNow,
  firingRuns,
  incidentOf,
  pctText,
  resultOf,
  scrubKey,
  scrubText,
  verdictFor,
  type AlertId,
  type IncidentId,
} from "./model";

const W = 420;
const H = 556;
const PX0 = 160;
const PX1 = 394;
const CT = 98;
const CB = 212;
const BURN_MAX = 28;
const ROW_TOP = { naive: 240, fast: 310, slow: 368 } as const;
const BUDGET_Y = 434;
const SCRUB_Y = 510;
const REPLAY_MS = 7000;
const VIOLET_STROKE = "stroke-violet-600 dark:stroke-violet-400";
const VIOLET_FILL = "fill-violet-600 dark:fill-violet-400";

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 17.4 beat 3: pick an incident, switch alerts on and off, drag through time and see who is paged. */
export function BurnReplayCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const [incident, setIncident] = useState<IncidentId>(DEFAULT_INCIDENT);
  const [on, setOn] = useState<Record<AlertId, boolean>>({ naive: true, fast: true, slow: true });
  const inc = incidentOf(incident);
  const [scrub, setScrub] = useState<number>(inc.axis);
  const [playing, setPlaying] = useState(false);

  const x = Math.max(0, Math.min(inc.axis, scrub));
  const xOf = (m: number) => r1(PX0 + (m / inc.axis) * (PX1 - PX0));
  const yOf = (burn: number) => r1(CB - (Math.min(BURN_MAX, burn) / BURN_MAX) * (CB - CT));
  const verdict = verdictFor(incident, on);
  const fired = firingNow(inc, x, on);

  // Replay: walk the scrubber from minute 0 to the end of the axis, once.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const f = Math.min(1, (now - t0) / REPLAY_MS);
      setScrub(Math.round(f * inc.axis));
      if (f < 1) raf = requestAnimationFrame(loop);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, inc.axis]);

  const replay = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      setScrub(inc.axis);
      return;
    }
    setScrub(0);
    setPlaying(true);
  };
  const pickIncident = (id: IncidentId) => {
    setPlaying(false);
    setIncident(id);
    setScrub(incidentOf(id).axis);
  };
  const toggle = (id: AlertId) => setOn((o) => ({ ...o, [id]: !o[id] }));

  const step = inc.axis > 150 ? 2 : 1;
  const curve = (w: number) => {
    const pts = burnCurve(inc, w, step);
    const past = pts.filter((p) => p.x < x).map((p) => ({ x: p.x, v: p.v }));
    past.push({ x, v: burnRate(inc, x, w) });
    const future = [{ x, v: burnRate(inc, x, w) }, ...pts.filter((p) => p.x > x)];
    const d = (list: { x: number; v: number }[]) => list.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.x)} ${yOf(p.v)}`).join(" ");
    return { past: d(past), future: d(future) };
  };
  const c1 = curve(60);
  const c6 = curve(360);
  const budgetBad = badMinutes(inc, x);
  const share = budgetShare(budgetBad);
  const budgetW = share > 0 ? Math.max(3, r1(share * (PX1 - PX0))) : 0;

  const chipW = ALERTS.map((a) => chipWidth(a.chip));
  const description = `Replay of a ${inc.noun}. At minute ${x} the 1 hour burn rate is ${burnText(burnRate(inc, x, 60))} and the 6 hour burn rate is ${burnText(burnRate(inc, x, 6 * 60))}. ${ALERTS.map((a) => `${a.label}: ${on[a.id] ? (resultOf(a.id, inc).page === null ? "never pages" : `pages at minute ${resultOf(a.id, inc).page}`) : "off"}`).join("; ")}. ${pctText(share)} percent of the 30 day budget is used. ${verdict.text}.`;

  const ticksY = CB + 17;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Pick an <b>incident</b>, switch <b>alerts</b> on or off, then drag the <b>time rail</b>.</>}
      controls={
        <BeatButton onClick={replay}>
          <RotateCcw aria-hidden className="size-4" />
          Replay
        </BeatButton>
      }
    >
      <div>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <RadioChipRow x={14} y={64} options={INCIDENTS.map((i) => ({ id: i.id, text: i.label, label: `${i.noun} at ${i.rate} percent errors` }))} value={incident} onChange={pickIncident} ariaLabel="Incident" />

          {/* Burn rate over time, with the incident shaded behind it. */}
          <rect x={PX0} y={CT} width={PX1 - PX0} height={CB - CT} rx={8} strokeWidth={1.5} className={cn(NEUTRAL.surface, NEUTRAL.line)} />
          <rect x={PX0 + 1} y={CT + 1} width={Math.max(2, xOf(inc.duration) - PX0 - 1)} height={CB - CT - 2} className={cn(TONES.warn.softFill, "opacity-90")} />
          <line x1={PX0} x2={PX1} y1={yOf(14.4)} y2={yOf(14.4)} strokeWidth={1.75} strokeDasharray="5 4" className={TONES.bad.stroke} />
          <line x1={PX0} x2={PX1} y1={yOf(6)} y2={yOf(6)} strokeWidth={1.75} strokeDasharray="5 4" className={VIOLET_STROKE} />
          <path d={c6.future} fill="none" strokeWidth={2} strokeLinejoin="round" opacity={0.35} className={VIOLET_STROKE} />
          <path d={c1.future} fill="none" strokeWidth={2} strokeLinejoin="round" opacity={0.35} className={TONES.accent.stroke} />
          <path d={c6.past} fill="none" strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" className={VIOLET_STROKE} />
          <path d={c1.past} fill="none" strokeWidth={2.75} strokeLinejoin="round" strokeLinecap="round" className={TONES.accent.stroke} />
          <line x1={xOf(x)} x2={xOf(x)} y1={CT} y2={CB} strokeWidth={1.75} className="stroke-foreground/70" />
          <circle cx={xOf(x)} cy={yOf(burnRate(inc, x, 360))} r={4.5} strokeWidth={2} className={cn(VIOLET_FILL, "stroke-card")} />
          <circle cx={xOf(x)} cy={yOf(burnRate(inc, x, 60))} r={4.5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} />

          <text x={PX0 - 6} y={yOf(14.4) + 4.5} textAnchor="end" className={cn(TONES.bad.text, "text-[11.5px] font-bold tabular-nums")}>14.4</text>
          <text x={PX0 - 6} y={yOf(6) + 4.5} textAnchor="end" className={cn("fill-violet-800 dark:fill-violet-200", "text-[11.5px] font-bold tabular-nums")}>6</text>
          <line x1={14} x2={30} y1={114} y2={114} strokeWidth={2.75} strokeLinecap="round" className={TONES.accent.stroke} />
          <text x={36} y={118.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>1 h burn</text>
          <line x1={14} x2={30} y1={136} y2={136} strokeWidth={2.75} strokeLinecap="round" className={VIOLET_STROKE} />
          <text x={36} y={140.5} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>6 h burn</text>
          <rect x={14} y={152} width={16} height={12} rx={3} className={cn(TONES.warn.softFill, TONES.warn.stroke)} strokeWidth={1.5} />
          <text x={36} y={162} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>incident</text>
          {inc.ticks.map((m) => (
            <text key={m} x={xOf(m)} y={ticksY} textAnchor={m === 0 ? "start" : m === inc.axis ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{m === inc.axis ? `${m} min` : String(m)}</text>
          ))}

          {/* One row per alert: the toggle, the bar that fills while it fires, a page tick where it opens. */}
          {ALERTS.map((a, i) => {
            const t = ROW_TOP[a.id];
            const res = resultOf(a.id, inc);
            const runs = firingRuns(a.id, inc);
            const isOn = on[a.id];
            const reached = res.page !== null && x >= res.page;
            const line = !isOn
              ? ""
              : res.page === null
                ? "never pages"
                : !reached
                  ? "quiet so far"
                  : `paged at minute ${res.page}, ${pctText(res.share ?? 0)}% of budget used`;
            return (
              <g key={a.id}>
                <SvgChip x={14} y={t + 17} width={chipW[i]} text={a.chip} label={`${a.label}, ${isOn ? "on" : "off"}`} pressed={isOn} onPress={() => toggle(a.id)} />
                <text x={14} y={t + 49} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{a.rule}</text>
                <rect x={PX0} y={t + 7} width={PX1 - PX0} height={20} rx={7} strokeWidth={isOn ? 0 : 1.5} strokeDasharray={isOn ? undefined : "4 4"} className={cn(isOn ? "fill-muted" : cn("fill-transparent", NEUTRAL.faintStroke), SHAPE_TRANSITION)} />
                {isOn
                  ? runs.map((run) => {
                      if (x < run.from) return null;
                      const end = Math.min(run.to, x);
                      const w = Math.max(3, xOf(end) - xOf(run.from));
                      return <rect key={run.from} x={xOf(run.from)} y={t + 7} width={r1(w)} height={20} rx={4} className={TONES.bad.solidFill} />;
                    })
                  : null}
                {isOn && reached && res.page !== null ? (
                  <g>
                    <line x1={xOf(res.page)} x2={xOf(res.page)} y1={t + 1} y2={t + 33} strokeWidth={3} strokeLinecap="round" className="stroke-red-700 dark:stroke-red-300" />
                  </g>
                ) : null}
                <text x={PX0} y={t + 49} className={cn(reached && isOn ? NEUTRAL.text : NEUTRAL.mutedText, "text-[11.5px]", reached && isOn && "font-semibold")}>{line}</text>
                {a.id === "naive" ? <text x={14} y={t + 66} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>{NAIVE_CAPTION}</text> : null}
              </g>
            );
          })}

          {/* The budget, drained as the scrubber moves. */}
          <text x={14} y={BUDGET_Y + 21} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Budget</text>
          <text x={14} y={BUDGET_Y + 38} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>{`${BUDGET_MIN.toFixed(1)} bad min`}</text>
          <rect x={PX0} y={BUDGET_Y + 6} width={PX1 - PX0} height={20} rx={7} className="fill-muted" />
          {budgetW > 0 ? <rect x={PX0} y={BUDGET_Y + 6} width={budgetW} height={20} rx={4} className={cn(TONES.warn.solidFill, "transition-[width] duration-150 motion-reduce:transition-none")} style={{ width: budgetW }} /> : null}
          <text x={PX0} y={BUDGET_Y + 44} className={cn(NEUTRAL.text, "text-[11.5px] font-semibold tabular-nums")}>{`${pctText(share)}% of the budget used`}</text>

          {/* The time rail. */}
          <text x={14} y={SCRUB_Y + 5} className={cn(NEUTRAL.text, "text-[13px] font-bold")}>Time</text>
          <TightRailSlider
            svgRef={svg}
            x0={PX0}
            x1={PX1}
            y={SCRUB_Y}
            label="Minutes into the incident"
            valueText={scrubText(inc, x, on)}
            value={x}
            min={0}
            max={inc.axis}
            fromFraction={(f) => Math.round(f * inc.axis)}
            onKey={(v, key) => scrubKey(v, key, inc.axis)}
            onChange={(v) => {
              setPlaying(false);
              setScrub(v);
            }}
            onGrab={(g) => g && setPlaying(false)}
            above={24}
            below={34}
            side={18}
          >
            <g aria-hidden>
              <line x1={PX0} x2={PX1} y1={SCRUB_Y} y2={SCRUB_Y} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
              <line x1={PX0} x2={xOf(x)} y1={SCRUB_Y} y2={SCRUB_Y} strokeWidth={5} strokeLinecap="round" className={TONES.accent.stroke} />
              <circle cx={xOf(x)} cy={SCRUB_Y} r={19} className={TONES.accent.softFill} />
              <circle cx={xOf(x)} cy={SCRUB_Y} r={13} strokeWidth={2.5} className={cn(TONES.accent.solidFill, "stroke-card")} />
              <text x={(PX0 + PX1) / 2} y={SCRUB_Y + 40} textAnchor="middle" className={cn(NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{`minute ${x}`}</text>
            </g>
          </TightRailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
        <p className="sr-only" aria-live="polite">{`${verdict.text}. ${fired.length ? `Firing now: ${fired.join(", ")}.` : "No alert firing now."}`}</p>
      </div>
    </BeatFrame>
  );
}
