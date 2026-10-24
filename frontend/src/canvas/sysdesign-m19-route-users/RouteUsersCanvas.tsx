"use client";

import { useId, useRef, useState } from "react";
import { Server, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatChoice } from "../primitives/beat-choice";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { LinkLine } from "../primitives/link-line";
import { SvgButton } from "../primitives/svg-button";
import { chipWidth, rowPositions } from "../primitives/svg-chip";
import { SvgRadioChip } from "../primitives/svg-radio-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { StepBar, type BarStep } from "../primitives/svg-step-bar";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { dotRate, laneDots } from "../models/lane-dots";
import {
  DEFAULT_POLICY,
  DEFAULT_TTL,
  DETECT_SECONDS,
  GROUPS,
  POLICIES,
  REGIONS,
  affectedGroups,
  darkSeconds,
  groupState,
  homeRegion,
  regionName,
  served,
  tripText,
  verdictFor,
  type GroupState,
  type PolicyId,
  type RegionId,
  type Ttl,
} from "./model";

const W = 420;
const H = 418;
const CHIP_Y = 66;
const GROUP = { x: 12, w: 120, h: 72, ys: [122, 206, 290] as const };
const REGION = { x: 288, w: 120, h: 76, ys: { eu: 150, na: 270 } as Record<RegionId, number> };
const BAR = { x0: 14, x1: 406, y: 354, keyY: 386, scaleMax: 390 };
/** Seconds of the story that pass in one second on screen. */
const SIM_SPEED = 60;

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 19.5 beat 2: pick a routing policy, fail a region, and watch where each group of users lands and how long they are dark. */
export function RouteUsersCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [policy, setPolicy] = useState<PolicyId>(DEFAULT_POLICY);
  const [ttl, setTtl] = useState<Ttl>(DEFAULT_TTL);
  const [failedList, setFailedList] = useState<RegionId[]>([]);
  const [since, setSince] = useState(0);

  const failed = new Set<RegionId>(failedList);
  const any = failed.size > 0;
  // Seconds of the story since the last change; a still picture shows the settled state.
  const story = !any ? 0 : clock.reduced ? Infinity : Math.max(0, (clock.seconds - since) * SIM_SPEED);
  const states = GROUPS.map((g) => ({ id: g.id, state: groupState(policy, ttl, failed, g.id, story) }));
  const hit = affectedGroups(policy, failed);
  const verdict = verdictFor(policy, ttl, failed);
  const dark = darkSeconds(policy, ttl);

  const restart = (next: RegionId[]) => {
    setFailedList(next);
    setSince(clock.seconds);
  };
  const toggleRegion = (r: RegionId) => restart(failed.has(r) ? failedList.filter((x) => x !== r) : [...failedList, r]);
  const pick = (p: PolicyId) => {
    setPolicy(p);
    setSince(clock.seconds);
  };
  const changeTtl = (t: Ttl) => {
    setTtl(t);
    setSince(clock.seconds);
  };
  const reset = () => {
    setPolicy(DEFAULT_POLICY);
    setTtl(DEFAULT_TTL);
    setFailedList([]);
  };

  // Where each line ends on a region: lines into one region are spread down its side.
  const lineEnds = new Map<string, number>();
  for (const r of REGIONS) {
    const into = states.filter((s) => s.state.kind !== "none" && s.state.region === r.id);
    into.forEach((s, k) => lineEnds.set(s.id, REGION.ys[r.id] + (k - (into.length - 1) / 2) * 20));
  }

  const widths = POLICIES.map((p) => chipWidth(p.label));
  const chipX = rowPositions(widths, (W - (widths.reduce((a, b) => a + b, 0) + 8 * (POLICIES.length - 1))) / 2);

  const steps: BarStep[] =
    policy === "anycast"
      ? [{ id: "detect", label: "detect", amount: DETECT_SECONDS, tone: "warn" }]
      : [
          { id: "detect", label: "detect", amount: DETECT_SECONDS, tone: "warn" },
          { id: "cache", label: "cache expires", amount: ttl, tone: "accent" },
        ];
  const barOn = any && hit.length > 0 && failed.size < 2;
  const progress = barOn ? (Number.isFinite(story) ? Math.min(1, story / dark) : 1) : 0;
  const shownSeconds = barOn ? Math.min(dark, Math.round(Number.isFinite(story) ? story : dark)) : 0;

  const statusOf = (s: GroupState, id: (typeof GROUPS)[number]["id"]): { text: string; tone: Tone } => {
    if (s.kind === "none") return { text: "no region", tone: "bad" };
    if (s.kind === "dark") return { text: "dark", tone: "bad" };
    const trip = tripText(id, s.region);
    return { text: trip.text, tone: trip.ms === 0 ? "good" : "warn" };
  };

  const description = `${POLICIES.find((p) => p.id === policy)?.full}. ${
    any ? `${[...failed].map(regionName).join(" and ")} ${failed.size === 1 ? "has" : "have"} failed. ${verdict.text}.` : "Both regions are healthy. Tap a region to fail it."
  } Groups: ${states.map((s) => `${GROUPS.find((g) => g.id === s.id)?.name} ${s.state.kind === "none" ? "has no region" : `on ${regionName(s.state.region)}${s.state.kind === "dark" ? " (dark)" : ""}`}`).join("; ")}.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Pick a <b>policy</b>, then tap a <b>region</b> to fail it. The cache time does not matter for anycast.
        </>
      }
      controls={
        <>
          <BeatChoice<"60" | "300">
            label="DNS cache (TTL)"
            options={[
              { id: "60", label: "TTL 60 s" },
              { id: "300", label: "TTL 300 s" },
            ]}
            value={String(ttl) as "60" | "300"}
            onChange={(id) => changeTtl(id === "300" ? 300 : 60)}
          />
          <BeatButton onClick={reset}>Reset</BeatButton>
        </>
      }
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          <g role="radiogroup" aria-label="Routing policy">
            {POLICIES.map((p, i) => (
              <SvgRadioChip key={p.id} x={chipX[i]} y={CHIP_Y} width={widths[i]} text={p.label} label={p.full} checked={policy === p.id} onSelect={() => pick(p.id)} />
            ))}
          </g>

          {/* A line from each group to the region it uses; dots flow while it is served. */}
          {states.map((s, gi) => {
            if (s.state.kind === "none") return null;
            const y1 = GROUP.ys[gi];
            const y2 = lineEnds.get(s.id) ?? REGION.ys[s.state.region];
            const x1 = GROUP.x + GROUP.w;
            const x2 = REGION.x;
            const isDark = s.state.kind === "dark";
            const dots = isDark ? [] : laneDots(clock.seconds, dotRate(0.55), clock.reduced, gi, 1.4);
            return (
              <g key={`line-${s.id}`} aria-hidden>
                <LinkLine x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={isDark ? 2 : 2.25} className={isDark ? TONES.bad.stroke : TONES.accent.stroke} />
                {dots.map((p, k) => (
                  <circle key={k} cx={r1(x1 + (x2 - x1) * p)} cy={r1(y1 + (y2 - y1) * p)} r={3.4} className={TONES.good.solidFill} />
                ))}
              </g>
            );
          })}

          {/* The three groups of users. */}
          {GROUPS.map((g, gi) => {
            const state = states[gi].state;
            const st = statusOf(state, g.id);
            const top = GROUP.ys[gi] - GROUP.h / 2;
            const isDark = state.kind === "dark" || state.kind === "none";
            return (
              <g key={g.id} aria-hidden>
                <rect x={GROUP.x} y={top + 3} width={GROUP.w} height={GROUP.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={GROUP.x} y={top} width={GROUP.w} height={GROUP.h} rx={14} strokeWidth={isDark ? 2 : 1.5} className={cn(NEUTRAL.surface, isDark ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                <circle cx={GROUP.x + 17} cy={top + 17} r={10} className="fill-violet-100 dark:fill-violet-500/20" />
                <User x={GROUP.x + 10} y={top + 10} width={14} height={14} strokeWidth={2} className="text-violet-700 dark:text-violet-300" />
                <text x={GROUP.x + 33} y={top + 21.5} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{g.name}</text>
                {Array.from({ length: 5 }, (_, k) => (
                  <circle key={k} cx={GROUP.x + 17 + k * 14} cy={top + 38} r={3.8} className={cn(isDark ? NEUTRAL.doneFill : TONES.good.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                ))}
                <rect x={GROUP.x + 7} y={top + 46} width={GROUP.w - 14} height={20} rx={10} className={cn(TONES[st.tone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={GROUP.x + GROUP.w / 2} y={top + 60} textAnchor="middle" className={cn(TONES[st.tone].text, "text-[11.5px] font-semibold tabular-nums")}>{st.text}</text>
              </g>
            );
          })}

          {/* The two regions: tap one to fail it. */}
          {REGIONS.map((r) => {
            const isDown = failed.has(r.id);
            const count = served(states, r.id);
            const base = GROUPS.filter((g) => homeRegion(policy, g.id) === r.id).length;
            const tone: Tone = isDown ? "bad" : count > base ? "warn" : "good";
            const text = isDown ? "down" : `serves ${count} of ${GROUPS.length}`;
            const top = REGION.ys[r.id] - REGION.h / 2;
            return (
              <SvgButton key={r.id} x={REGION.x} y={top} width={REGION.w} height={REGION.h} rx={14} label={isDown ? `${r.name} is down. Tap to bring it back.` : `Fail ${r.name}`} pressed={isDown} onPress={() => toggleRegion(r.id)}>
                <rect x={REGION.x} y={top + 3} width={REGION.w} height={REGION.h} rx={14} className="fill-foreground/[0.06]" />
                <rect x={REGION.x} y={top} width={REGION.w} height={REGION.h} rx={14} strokeWidth={isDown ? 2.5 : 1.5} className={cn(NEUTRAL.surface, isDown ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
                {isDown ? <rect x={REGION.x} y={top} width={REGION.w} height={REGION.h} rx={14} className={TONES.bad.softFill} /> : null}
                <circle cx={REGION.x + 17} cy={top + 20} r={11} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={REGION.x + 9} y={top + 12} width={16} height={16} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={REGION.x + 34} y={top + 25} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{r.name}</text>
                <rect x={REGION.x + 7} y={top + 46} width={REGION.w - 14} height={22} rx={11} className={cn(TONES[tone].softFill, "transition-colors duration-200 motion-reduce:transition-none")} />
                <text x={REGION.x + REGION.w / 2} y={top + 61} textAnchor="middle" className={cn(TONES[tone].text, "text-[11.5px] font-semibold tabular-nums")}>{text}</text>
              </SvgButton>
            );
          })}

          {/* The wait: detection, then (for DNS) the caches. */}
          <text x={BAR.x0} y={BAR.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>time since the failure</text>
          {barOn ? <text x={BAR.x1} y={BAR.y - 8} textAnchor="end" className={cn(shownSeconds >= dark ? TONES[verdict.tone].text : NEUTRAL.text, "text-[12.5px] font-bold tabular-nums")}>{`${shownSeconds} s`}</text> : null}
          <StepBar x0={BAR.x0} x1={BAR.x1} y={BAR.y} steps={steps} scaleMax={BAR.scaleMax} progress={progress} unit="s" keyY={BAR.keyY} showKey={barOn} />
          {!barOn ? (
            <text x={BAR.x0} y={BAR.keyY + 14} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>
              {!any ? "tap a region to fail it" : failed.size === 2 ? "both regions are down" : "no group was on it"}
            </text>
          ) : null}

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
