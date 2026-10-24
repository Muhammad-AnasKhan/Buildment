"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { ladderStep, SliderRail } from "../primitives/picture-slider";
import { InfoChip, infoChipWidth } from "../primitives/svg-info-chip";
import { chipWidth, rowPositions, SvgChip } from "../primitives/svg-chip";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { TightRailSlider } from "../primitives/tight-rail-slider";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  ALL_ON,
  CPU_LADDER,
  CPU_WORK_MS,
  DEFAULT_CPU,
  DEFAULT_MEM,
  HOST_PROCESSES,
  MEM_LADDER,
  MEM_MAX,
  MEM_MIN,
  MEM_NEED_MB,
  SWITCHES,
  cpuFraction,
  cpuFromFraction,
  formatCpu,
  isKilled,
  memFraction,
  memFromFraction,
  memoryUsed,
  requestMs,
  verdictFor,
  viewFor,
  type SwitchId,
  type Switches,
} from "./model";

const W = 420;
const H = 500;
const CARD = { x: 10, y: 46, w: 400, h: 176 };
const ROW_X = 22;
const PILL = { x: 108, w: 290, h: 22 };
const ROWS = [128, 154, 180, 206];
const BAR = { x0: 14, x1: 406, y: 250, h: 16 };
const MEM_RAIL = { x0: 40, x1: 380, y: 322 };
const LANE = { x0: 24, x1: 396, y: 402 };
const CPU_RAIL = { x0: 40, x1: 380, y: 448 };

// Fixed chip widths, sized for the longer "off" wording, so a chip does not jump when it flips.
const CHIP_W = SWITCHES.map((s) => chipWidth(`${s.short} off`, 7));
const CHIP_X = rowPositions(CHIP_W, (W - (CHIP_W.reduce((a, b) => a + b, 0) + 6 * (SWITCHES.length - 1))) / 2, 6);

const r1 = (v: number) => Math.round(v * 10) / 10;

/** 18.2 beat 2: four namespace switches, a memory limit and a CPU limit around one service process. */
export function IsolationLayersCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const clock = useBeatClock(box);
  const [sw, setSw] = useState<Switches>(ALL_ON);
  const [mem, setMem] = useState(DEFAULT_MEM);
  const [cpu, setCpu] = useState(DEFAULT_CPU);

  const view = viewFor(sw);
  const killed = isKilled(mem);
  const ms = requestMs(cpu);
  const verdict = verdictFor(sw, mem, cpu);
  const toggle = (id: SwitchId) => setSw((s) => ({ ...s, [id]: !s[id] }));
  const reset = () => {
    setSw(ALL_ON);
    setMem(DEFAULT_MEM);
    setCpu(DEFAULT_CPU);
  };

  const used = memoryUsed(mem);
  const barW = BAR.x1 - BAR.x0;
  const cutX = r1(BAR.x0 + (mem / MEM_MAX) * barW);
  const fillW = r1((used / MEM_MAX) * barW);
  const limitLabelX = Math.max(BAR.x0 + 44, Math.min(BAR.x1 - 44, cutX));

  // One request crosses the lane in a time that follows the CPU limit: 200 ms is 0.9 s of picture time.
  const cross = (ms / CPU_WORK_MS) * 0.9;
  const t = clock.reduced ? cross : clock.seconds % (cross + 0.6);
  const dotX = r1(LANE.x0 + Math.min(1, t / cross) * (LANE.x1 - LANE.x0));

  const rowTone = (ok: boolean, bad = false): Tone => (ok ? "good" : bad ? "bad" : "warn");
  const rows: { label: string; tone: Tone; text: string; extra?: "dots" | "dot" }[] = [
    {
      label: "Processes",
      tone: rowTone(sw.pid),
      text: sw.pid ? "1: only itself, as number 1" : `${HOST_PROCESSES} on the host`,
      extra: sw.pid ? "dot" : "dots",
    },
    { label: "Port 3000", tone: rowTone(view.portFree, true), text: view.portFree ? "free: its own network" : "taken: the host uses it" },
    { label: "Files", tone: rowTone(sw.mnt), text: view.files === "image" ? "only the image: /app, /usr" : "the host's /etc and /home" },
    { label: "Host name", tone: rowTone(sw.host), text: view.name },
  ];

  const requestText = killed ? "No reply" : `Request: ${ms} ms`;
  const description = `${verdict.text}. Memory limit ${mem} MB, the service needs ${MEM_NEED_MB} MB${killed ? ", so it is killed with exit 137" : ""}. CPU limit ${formatCpu(cpu)}, a request takes ${ms} ms.`;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Tap a <b>switch</b> to turn an isolation off, then drag the two <b>limits</b>.
        </>
      }
      controls={<BeatButton onClick={reset}>Reset</BeatButton>}
    >
      <div ref={box}>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {/* The container card: four switches, then what the process can see. */}
          <rect x={CARD.x} y={CARD.y + 3} width={CARD.w} height={CARD.h} rx={16} className="fill-foreground/[0.06]" />
          <rect x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} rx={16} strokeWidth={killed ? 2.5 : 1.5} className={cn(NEUTRAL.surface, killed ? TONES.bad.stroke : NEUTRAL.line, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={ROW_X} y={CARD.y + 25} className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold")}>container</text>
          <InfoChip x={CARD.x + CARD.w - 12 - 128} y={CARD.y + 8} width={128} text={killed ? "killed: exit 137" : "running"} tone={killed ? "bad" : "good"} />

          <g role="group" aria-label="Isolation switches">
            {SWITCHES.map((s, i) => (
              <SvgChip key={s.id} x={CHIP_X[i]} y={92} width={CHIP_W[i]} text={`${s.short} ${sw[s.id] ? "on" : "off"}`} label={`${s.full} isolation`} pressed={sw[s.id]} onPress={() => toggle(s.id)} />
            ))}
          </g>

          <g opacity={killed ? 0.45 : 1} className="transition-opacity duration-200 motion-reduce:transition-none">
            {rows.map((r, i) => (
              <g key={r.label}>
                <text x={ROW_X} y={ROWS[i] + 4.5} className={cn(NEUTRAL.mutedText, "text-[12px] font-semibold")}>{r.label}</text>
                <rect x={PILL.x} y={ROWS[i] - PILL.h / 2} width={PILL.w} height={PILL.h} rx={11} strokeWidth={1.5} className={cn(TONES[r.tone].softFill, TONES[r.tone].stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
                {r.extra === "dot" ? <circle cx={PILL.x + 14} cy={ROWS[i]} r={4.5} className={TONES.good.solidFill} /> : null}
                {r.extra === "dots"
                  ? Array.from({ length: 16 }, (_, k) => <circle key={k} cx={PILL.x + 14 + k * 8.5} cy={ROWS[i]} r={2.8} className={TONES.warn.solidFill} />)
                  : null}
                <text x={PILL.x + (r.extra === "dots" ? 158 : r.extra === "dot" ? 26 : 12)} y={ROWS[i] + 4.5} className={cn(TONES[r.tone].text, "text-[12px] font-semibold")}>{r.text}</text>
              </g>
            ))}
          </g>

          {/* Memory: the bar fills to what the service needs; the red cut is the limit. */}
          <text x={BAR.x0} y={BAR.y - 8} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`The service needs ${MEM_NEED_MB} MB`}</text>
          <rect x={BAR.x0} y={BAR.y} width={barW} height={BAR.h} rx={8} className="fill-muted" />
          <rect x={BAR.x0} y={BAR.y} width={Math.max(fillW, 2)} height={BAR.h} rx={8} className={cn(killed ? TONES.bad.solidFill : TONES.good.solidFill, "transition-colors duration-200 motion-reduce:transition-none")} />
          <line x1={cutX} x2={cutX} y1={BAR.y - 4} y2={BAR.y + BAR.h + 4} strokeWidth={3} strokeLinecap="round" className={TONES.bad.stroke} />
          <text x={limitLabelX} y={BAR.y + BAR.h + 19} textAnchor="middle" className={cn(TONES.bad.text, "text-[12px] font-semibold tabular-nums")}>{`limit ${mem} MB`}</text>

          <TightRailSlider
            svgRef={svg}
            x0={MEM_RAIL.x0}
            x1={MEM_RAIL.x1}
            y={MEM_RAIL.y}
            label="Memory limit"
            valueText={`${mem} MB${killed ? ", the service is killed" : ""}`}
            value={mem}
            min={MEM_MIN}
            max={MEM_MAX}
            fromFraction={memFromFraction}
            onKey={(v, k) => ladderStep(MEM_LADDER, v, k)}
            onChange={setMem}
            above={24}
            below={40}
            side={26}
          >
            <SliderRail
              x0={MEM_RAIL.x0}
              x1={MEM_RAIL.x1}
              y={MEM_RAIL.y}
              fraction={memFraction(mem)}
              marks={[{ at: memFraction(128), label: "128" }, { at: memFraction(256), label: "256" }, { at: memFraction(MEM_NEED_MB), tone: "bad" }]}
              ends={[`${MEM_MIN} MB`, `${MEM_MAX} MB`]}
              caption={`Memory limit: ${mem} MB`}
            />
          </TightRailSlider>

          {/* CPU: a request crosses the lane; a lower limit makes it take longer. */}
          <text x={LANE.x0} y={LANE.y - 28} className={cn(NEUTRAL.text, "text-[12.5px] font-semibold")}>{`A request needs ${CPU_WORK_MS} ms of CPU`}</text>
          <InfoChip x={W - 14 - infoChipWidth("Request: 800 ms")} y={LANE.y - 46} width={infoChipWidth("Request: 800 ms")} text={requestText} tone={killed ? "bad" : cpu < 1 ? "warn" : "good"} />
          <line x1={LANE.x0} x2={LANE.x1} y1={LANE.y} y2={LANE.y} strokeWidth={3} strokeLinecap="round" className="stroke-muted" />
          {killed ? null : <circle cx={dotX} cy={LANE.y} r={7.5} strokeWidth={2} className={cn(TONES.accent.solidFill, "stroke-card")} />}

          <TightRailSlider
            svgRef={svg}
            x0={CPU_RAIL.x0}
            x1={CPU_RAIL.x1}
            y={CPU_RAIL.y}
            label="CPU limit"
            valueText={`${formatCpu(cpu)}, a request takes ${ms} ms`}
            value={cpu}
            min={CPU_LADDER[0]}
            max={CPU_LADDER[CPU_LADDER.length - 1]}
            fromFraction={cpuFromFraction}
            onKey={(v, k) => ladderStep(CPU_LADDER, v, k)}
            onChange={setCpu}
            above={24}
            below={40}
            side={26}
          >
            <SliderRail
              x0={CPU_RAIL.x0}
              x1={CPU_RAIL.x1}
              y={CPU_RAIL.y}
              fraction={cpuFraction(cpu)}
              marks={[{ at: cpuFraction(0.5), label: "0.5" }, { at: cpuFraction(1), label: "1" }]}
              ends={["0.25", "2"]}
              caption={`CPU limit: ${formatCpu(cpu)}`}
            />
          </TightRailSlider>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
