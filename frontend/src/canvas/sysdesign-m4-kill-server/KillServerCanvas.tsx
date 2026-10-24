"use client";

import { useRef, useState, type ReactNode } from "react";
import { Database, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { SvgButton } from "../primitives/svg-button";
import { SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import { CROWD_DOTS, formatCount, MODES, SERVERS, sessionLoss, STUDENTS, STUDENTS_PER_DOT, STUDENTS_PER_SERVER, type SessionMode } from "../models/session-loss";

const W = 420;
const H = 336;
const TILE = { y: 130, w: 94, h: 118, gap: 8, x0: 10 };
const LB = { x: 210, y: 76 };
const STORE = { x: 135, y: 272, w: 150, h: 48 };
const COLS = 6;
const REQUEST_EVERY = 0.5;
const TRAVEL = 0.6;
const ONWARD = 0.5;
const BUBBLE = 0.9;

const tileX = (i: number) => TILE.x0 + i * (TILE.w + TILE.gap);
const tileCx = (i: number) => tileX(i) + TILE.w / 2;
const storeTop = (i: number) => 210 + (tileCx(i) - 210) * 0.45;

const CAPTION: Record<SessionMode, string> = {
  memory: "Each server keeps its own sessions in memory",
  sticky: "Each student always returns to the same server",
  store: "",
};
const BALANCER_STATUS: Record<SessionMode, string> = { memory: "round robin", sticky: "pins users", store: "any server" };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 4.3: pick where sessions live, then tap a server (or the store) to kill it and count the logouts. */
export function KillServerCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [mode, setMode] = useState<SessionMode>("memory");
  const [down, setDown] = useState<boolean[]>(() => Array(SERVERS).fill(false));
  const [storeDown, setStoreDown] = useState(false);
  const r = sessionLoss({ mode, down, storeDown });
  const live = down.map((d, i) => (d ? -1 : i)).filter((i) => i >= 0);
  const storeMode = mode === "store";
  const toggleServer = (i: number) => setDown((d) => d.map((v, k) => (k === i ? !v : v)));

  // A student's dots are logged out when their sessions are gone: the server died (memory, sticky) or the store did.
  const gone = (i: number) => (storeMode ? storeDown : down[i]);

  // Requests: one every half second to a live server in turn. In memory mode only every Lth one reaches the server that holds the session.
  type Req = { n: number; to: number; age: number; miss: boolean };
  const requests: Req[] = [];
  if (!clock.reduced && live.length > 0) {
    const last = Math.floor(clock.seconds / REQUEST_EVERY);
    const first = Math.floor((clock.seconds - (TRAVEL + ONWARD + BUBBLE)) / REQUEST_EVERY);
    for (let n = Math.max(0, first); n <= last; n++) {
      const age = clock.seconds - n * REQUEST_EVERY;
      requests.push({ n, to: live[n % live.length], age, miss: mode === "memory" && live.length >= 2 && n % live.length !== 0 });
    }
  }
  const stillTarget = live[0];
  const stillBubble = mode === "memory" && live.length >= 2 ? live[1] : -1;

  const summary = `${STUDENTS_PER_SERVER} students on each of ${SERVERS} app servers, ${formatCount(STUDENTS)} in all. Sessions are kept ${
    mode === "memory" ? "in each server's memory" : mode === "sticky" ? "in each server's memory, and the balancer pins each student to one server" : "in a shared store"
  }. ${r.downServers} app ${r.downServers === 1 ? "server is" : "servers are"} down${storeMode && storeDown ? " and the store is down" : ""}. ${formatCount(r.loggedOut)} students are logged out. ${r.verdict}.`;

  const controls = (
    <div role="group" aria-label="Where sessions live" className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <BeatButton key={m.id} pressed={mode === m.id} onClick={() => setMode(m.id)}>
          {m.label}
        </BeatButton>
      ))}
    </div>
  );

  return (
    <BeatFrame label={title} limits={limits} controls={controls} hint={storeMode ? <>Tap a <b>server</b> or the <b>store</b> to kill it. Tap again to bring it back.</> : <>Tap a <b>server</b> to kill it. Tap again to bring it back.</>}>
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} className="block h-auto w-full select-none">
          <DotGrid width={W} height={H} />

          {/* Links: balancer to each server; server to the store in shared-store mode. */}
          {Array.from({ length: SERVERS }, (_, i) => (
            <line key={`lb-${i}`} x1={LB.x} y1={LB.y + 30} x2={tileCx(i)} y2={TILE.y} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={down[i] ? "5 5" : undefined} className={down[i] ? TONES.bad.stroke : NEUTRAL.faintStroke} />
          ))}
          {storeMode
            ? Array.from({ length: SERVERS }, (_, i) => (
                <line key={`st-${i}`} x1={tileCx(i)} y1={TILE.y + TILE.h} x2={storeTop(i)} y2={STORE.y} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={storeDown ? "5 5" : undefined} className={storeDown ? TONES.bad.stroke : NEUTRAL.faintStroke} />
              ))
            : null}

          {/* Requests travelling: balancer to a server, then on to the store. */}
          {clock.reduced && stillTarget !== undefined ? (
            <circle cx={lerp(LB.x, tileCx(stillTarget), 0.5)} cy={lerp(LB.y + 30, TILE.y, 0.5)} r={4.5} className={TONES.accent.solidFill} />
          ) : null}
          {requests.map((q) => {
            const out: ReactNode[] = [];
            if (q.age >= 0 && q.age < TRAVEL) {
              const p = q.age / TRAVEL;
              out.push(<circle key={`a-${q.n}`} cx={lerp(LB.x, tileCx(q.to), p)} cy={lerp(LB.y + 30, TILE.y, p)} r={4.5} className={TONES.accent.solidFill} />);
            } else if (storeMode && q.age >= TRAVEL && q.age < TRAVEL + ONWARD) {
              const p = (q.age - TRAVEL) / ONWARD;
              out.push(<circle key={`b-${q.n}`} cx={lerp(tileCx(q.to), storeTop(q.to), p)} cy={lerp(TILE.y + TILE.h, STORE.y, p)} r={4.5} className={storeDown ? TONES.bad.solidFill : TONES.accent.solidFill} />);
            }
            return out;
          })}

          {/* The balancer and the running count of logged-out students. */}
          <SvgNode x={LB.x} y={LB.y} label="Balancer" kind="router" status={BALANCER_STATUS[mode]} />
          <rect x={6} y={54} width={140} height={44} rx={22} strokeWidth={1.5} className={cn(r.loggedOut > 0 ? TONES.bad.softFill : TONES.good.softFill, r.loggedOut > 0 ? TONES.bad.stroke : TONES.good.stroke, "transition-colors duration-200 motion-reduce:transition-none")} />
          <text x={76} y={81} textAnchor="middle" className={cn(r.loggedOut > 0 ? TONES.bad.text : TONES.good.text, "text-[13.5px] font-bold tabular-nums")}>{`Logged out: ${formatCount(r.loggedOut)}`}</text>
          <rect x={274} y={62} width={140} height={28} rx={14} className="fill-muted" />
          <text x={344} y={80.5} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[11.5px] font-medium")}>{`1 dot = ${STUDENTS_PER_DOT} students`}</text>

          {/* Four servers, each with the crowd of students it serves: one dot is ten students. */}
          {Array.from({ length: SERVERS }, (_, i) => {
            const x = tileX(i);
            const dead = down[i];
            const fall = gone(i);
            const bubble = clock.reduced ? stillBubble === i : requests.some((q) => q.miss && q.to === i && q.age >= TRAVEL && q.age < TRAVEL + BUBBLE);
            return (
              <SvgButton key={`tile-${i}`} x={x} y={TILE.y} width={TILE.w} height={TILE.h} rx={14} label={dead ? `App ${i + 1} is down. Bring it back` : `Kill App ${i + 1}`} pressed={dead} onPress={() => toggleServer(i)}>
                <g className={cn("transition-opacity duration-200 motion-reduce:transition-none", dead ? "opacity-70" : "opacity-100")}>
                  <rect x={x} y={TILE.y + 3} width={TILE.w} height={TILE.h} rx={14} className="fill-foreground/[0.06]" />
                  <rect x={x} y={TILE.y} width={TILE.w} height={TILE.h} rx={14} strokeWidth={dead ? 2 : 1.5} className={cn(NEUTRAL.surface, dead ? TONES.bad.stroke : NEUTRAL.line)} />
                  {dead ? <rect x={x} y={TILE.y} width={TILE.w} height={TILE.h} rx={14} className={TONES.bad.softFill} /> : null}
                  <circle cx={x + 16} cy={TILE.y + 17} r={10.5} className="fill-blue-100 dark:fill-blue-500/20" />
                  <Server x={x + 9} y={TILE.y + 10} width={14} height={14} strokeWidth={2} className="text-blue-700 dark:text-blue-300" aria-hidden />
                  <text x={x + 32} y={TILE.y + 21} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>{`App ${i + 1}`}</text>
                  <rect x={x + 6} y={TILE.y + 30} width={TILE.w - 12} height={20} rx={10} className={dead ? TONES.bad.softFill : "fill-muted"} />
                  <text x={x + TILE.w / 2} y={TILE.y + 44} textAnchor="middle" className={cn(dead ? TONES.bad.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold tabular-nums")}>
                    {dead ? "down" : `${STUDENTS_PER_SERVER} users`}
                  </text>
                  {Array.from({ length: CROWD_DOTS }, (_, j) => {
                    const cx = x + 14.5 + (j % COLS) * 13;
                    const cy = TILE.y + 66 + Math.floor(j / COLS) * 11.5;
                    return (
                      <circle
                        key={j}
                        cx={cx}
                        cy={cy}
                        r={3.4}
                        className={cn(fall ? "fill-red-600 dark:fill-red-400" : "fill-violet-400/90 dark:fill-violet-300/80", "transition-all duration-500 motion-reduce:transition-none")}
                        style={{ transform: fall ? "translateY(30px)" : "translateY(0)", opacity: fall ? 0 : 1, transitionDelay: fall ? `${(j % COLS) * 35 + Math.floor(j / COLS) * 25}ms` : "0ms" }}
                      />
                    );
                  })}
                  {bubble ? (
                    <g>
                      <rect x={x + 6} y={TILE.y + 72} width={TILE.w - 12} height={22} rx={11} strokeWidth={1.5} className={cn(NEUTRAL.surface, TONES.warn.stroke)} />
                      <text x={x + TILE.w / 2} y={TILE.y + 87} textAnchor="middle" className={cn(TONES.warn.text, "text-[11.5px] font-bold")}>who is this?</text>
                    </g>
                  ) : null}
                </g>
              </SvgButton>
            );
          })}

          {/* The shared store, only in shared-store mode; otherwise a line about where sessions live. */}
          {storeMode ? (
            <SvgButton x={STORE.x} y={STORE.y} width={STORE.w} height={STORE.h} rx={14} label={storeDown ? "Session store is down. Bring it back" : "Kill the session store"} pressed={storeDown} onPress={() => setStoreDown((s) => !s)}>
              <rect x={STORE.x} y={STORE.y + 3} width={STORE.w} height={STORE.h} rx={14} className="fill-foreground/[0.06]" />
              <rect x={STORE.x} y={STORE.y} width={STORE.w} height={STORE.h} rx={14} strokeWidth={storeDown ? 2 : 1.5} className={cn(NEUTRAL.surface, storeDown ? TONES.bad.stroke : NEUTRAL.line)} />
              {storeDown ? <rect x={STORE.x} y={STORE.y} width={STORE.w} height={STORE.h} rx={14} className={TONES.bad.softFill} /> : null}
              <circle cx={STORE.x + 17} cy={STORE.y + 16} r={10.5} className="fill-emerald-100 dark:fill-emerald-500/20" />
              <Database x={STORE.x + 10} y={STORE.y + 9} width={14} height={14} strokeWidth={2} className="text-emerald-700 dark:text-emerald-300" aria-hidden />
              <text x={STORE.x + 34} y={STORE.y + 21} className={cn(NEUTRAL.text, "text-[13px] font-semibold")}>Session store</text>
              <rect x={STORE.x + 7} y={STORE.y + 27} width={STORE.w - 14} height={17} rx={8.5} className={storeDown ? TONES.bad.softFill : "fill-muted"} />
              <text x={STORE.x + STORE.w / 2} y={STORE.y + 40} textAnchor="middle" className={cn(storeDown ? TONES.bad.text : NEUTRAL.mutedText, "text-[11.5px] font-semibold")}>{storeDown ? "down" : "all sessions"}</text>
            </SvgButton>
          ) : (
            <text x={210} y={296} textAnchor="middle" className={cn(NEUTRAL.mutedText, "text-[12.5px] font-medium")}>{CAPTION[mode]}</text>
          )}

          <VerdictBanner width={W} text={r.verdict} tone={r.tone} />
        </svg>
      </div>
    </BeatFrame>
  );
}
