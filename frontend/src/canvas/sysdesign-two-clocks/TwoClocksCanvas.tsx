"use client";

import { useEffect, useRef, useState } from "react";
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { twoClocksFrame } from "./model";

const W = 420;
const H = 230;

/** Beat 1 of 10.6: two server clocks tick in slow motion and stamp two writes 1 ms apart. */
export function TwoClocksCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(ref);
  const [replay, setReplay] = useState(0);
  const { restart } = clock;
  useEffect(() => {
    restart();
  }, [replay, restart]);
  const f = twoClocksFrame(clock.seconds);

  return (
    <BeatFrame label={title} limits={limits} controls={<BeatButton onClick={() => setReplay((n) => n + 1)}>Replay</BeatButton>}>
      <div ref={ref} onPointerDown={clock.freeze} onPointerUp={clock.unfreeze} onPointerLeave={clock.unfreeze}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Server A shows ${f.clockA}, server B shows ${f.clockB}.${f.stamped ? " A stamped .000 and B stamped .001." : ""}`} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />
          {(["a", "b"] as const).map((id) => {
            const x = id === "a" ? 110 : 310;
            const left = x - 76;
            return (
              <g key={id}>
                {!f.stamped ? (
                  <g transform={`translate(${x} ${f.dropY})`}>
                    <circle r={9} className={TONES.accent.solidFill} />
                    <circle r={3.5} className="fill-card" />
                    {/* The label fades as the write reaches the card, so it never peeks out from behind it. */}
                    <g opacity={Math.max(0, Math.min(1, (88 - f.dropY) / 24))}>
                      <rect x={-32} y={-34} width={64} height={20} rx={10} className={cn(NEUTRAL.surface, TONES.accent.stroke)} strokeWidth={1.5} />
                      <text y={-20} textAnchor="middle" className={cn(TONES.accent.text, "text-[11.5px] font-semibold")}>{id === "a" ? "write 1" : "write 2"}</text>
                    </g>
                  </g>
                ) : null}
                <rect x={left} y={95} width={152} height={108} rx={16} className="fill-foreground/[0.06]" />
                <rect x={left} y={92} width={152} height={108} rx={16} className={cn(NEUTRAL.surface, NEUTRAL.line)} strokeWidth={1.5} />
                <circle cx={left + 20} cy={112} r={12} className="fill-blue-100 dark:fill-blue-500/20" />
                <Server x={left + 11} y={103} width={18} height={18} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                <text x={left + 40} y={117} className={cn(NEUTRAL.text, "text-[14px] font-semibold")}>{id === "a" ? "Server A" : "Server B"}</text>
                <text x={x} y={152} textAnchor="middle" className={cn(NEUTRAL.text, "font-mono text-[18px] font-bold tabular-nums")}>{id === "a" ? f.clockA : f.clockB}</text>
                <g opacity={f.stamped ? 1 : 0} className="transition-opacity duration-200 motion-reduce:transition-none">
                  <rect x={left + 10} y={166} width={132} height={24} rx={12} className={cn(TONES.accent.softFill, TONES.accent.stroke)} strokeWidth={1.5} />
                  <text x={x} y={183} textAnchor="middle" className={cn(TONES.accent.text, "font-mono text-[13px] font-semibold")}>{id === "a" ? "stamped .000" : "stamped .001"}</text>
                </g>
              </g>
            );
          })}
          {f.stamped ? <VerdictBanner width={W} text="A came first, by 1 ms?" tone="accent" /> : null}
        </svg>
      </div>
    </BeatFrame>
  );
}
