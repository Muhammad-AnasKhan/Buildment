"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BeatButton, BeatFrame } from "../primitives/beat-frame";
import { RailStrip } from "../primitives/rail-strip";
import { SvgChip, chipWidth } from "../primitives/svg-chip";
import { NODE_W, SvgNode } from "../primitives/svg-node";
import { DotGrid, VerdictBanner } from "../primitives/svg-parts";
import { NEUTRAL, TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  KEY_MODES,
  PROVIDER,
  PROVIDER_LADDER,
  TIMEOUT_MS,
  chargesBy,
  clampProvider,
  keyStoreAt,
  phoneAt,
  retryVerdict,
  runRetries,
  waitingAt,
  type KeyMode,
  type RetryRun,
  type Try,
} from "../models/retry-key";

const W = 420;
const H = 346;
const CARD_Y = 126;
const PHONE_X = 62;
const API_X = 210;
const PROV_X = 358;
/** Where a dot leaves the phone card and where it enters the provider card. */
const LANE = { from: PHONE_X + NODE_W / 2, api: API_X - NODE_W / 2, to: PROV_X - NODE_W / 2 };
const G = { x0: 56, x1: 410, y0: 202, pitch: 24 };
const SPAN_MS = 1500;
const SCALE = (G.x1 - G.x0) / SPAN_MS;
/** Model milliseconds the picture plays in one second. */
const MS_PER_S = 400;
/** How long one hop of a dot takes, in model milliseconds. */
const LEG = 70;
const HOLD_S = 2.2;
const COIN_X = [314, 338, 362, 386] as const;

const X = (ms: number) => Math.round((G.x0 + ms * SCALE) * 100) / 100;
const r2 = (v: number) => Math.round(v * 100) / 100;
const reveal = (t: number, from: number, to: number) => (to <= from ? (t >= from ? 1 : 0) : Math.max(0, Math.min(1, (t - from) / (to - from))));

type Flight = { x: number; tone: Tone | "neutral" };

/** The dots in flight at model time t: requests out, replies back. */
function flights(run: RetryRun, t: number): Flight[] {
  if (!Number.isFinite(t)) return [];
  const out: Flight[] = [];
  const at = (u: number, from: number, to: number) => r2(from + (to - from) * u);
  for (const tr of run.tries) {
    const u = (t - tr.start) / (2 * LEG);
    if (tr.reachesProvider) {
      if (u >= 0 && u <= 1) out.push({ x: at(u, LANE.from, LANE.to), tone: "accent" });
      const c = tr.chargeAt ?? 0;
      const back = (t - c) / (2 * LEG);
      if (back >= 0 && back <= 1) {
        // A reply the app is still waiting for travels all the way home; a late one stops at the API.
        if (tr.outcome === "answered") out.push({ x: at(back, LANE.to, LANE.from), tone: "good" });
        else if (back <= 0.5) out.push({ x: at(back * 2, LANE.to, LANE.api), tone: "neutral" });
      }
    } else if (u >= 0 && u <= 1) {
      // Saved reply or 409: out to the API and straight back.
      const reach = u < 0.5 ? u * 2 : 2 - u * 2;
      out.push({ x: at(reach, LANE.from, LANE.api), tone: tr.outcome === "saved" ? "good" : "warn" });
    }
  }
  return out;
}

function waitBarTone(tr: Try): Tone {
  return tr.outcome === "answered" || tr.outcome === "saved" ? "good" : "warn";
}

/** 6.4: drag how slow the provider is and pick how the API treats keys; count the charges. */
export function RetryKeyCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const box = useRef<HTMLDivElement>(null);
  const clock = useBeatClock(box);
  const [providerMs, setProviderMs] = useState<number>(PROVIDER.default);
  const [mode, setMode] = useState<KeyMode>("none");
  // The run replays from the start once the learner stops changing things; until then the finished picture shows.
  const [runStart, setRunStart] = useState(0);
  const titleId = useId();
  const descId = useId();

  const run = runRetries(providerMs, mode);
  const verdict = retryVerdict(run);
  const endMs = run.lastEventAt + 2 * LEG + 150;
  const period = endMs / MS_PER_S + HOLD_S;
  const elapsed = clock.seconds - runStart;
  const t = clock.reduced || elapsed < 0 ? Infinity : (elapsed % period) * MS_PER_S;
  const finished = !Number.isFinite(t) || t >= endMs;

  const change = (fn: () => void) => {
    fn();
    setRunStart(clock.seconds + 1.1);
  };

  const landed = chargesBy(run, t);
  const apiState = keyStoreAt(run, t);
  const phone = phoneAt(run, t);
  const waiting = waitingAt(run, t);
  const firstReach = run.tries.find((tr) => tr.reachesProvider);
  const providerStatus = landed > 0 ? { text: `${landed} ${landed === 1 ? "charge" : "charges"}`, tone: (landed === 1 ? "good" : "bad") as Tone } : { text: firstReach && t >= firstReach.start + LEG ? "charging" : "idle", tone: undefined };
  const dots = flights(run, t);
  const playhead = !finished ? X(t) : null;

  const description = `The app sends up to 4 tries and waits ${TIMEOUT_MS} ms for each. The provider takes ${run.providerMs} ms. Mode: ${KEY_MODES.find((m) => m.id === mode)?.full}. Result: ${run.charges.length} ${run.charges.length === 1 ? "charge" : "charges"}, ${run.confirmedAt === null ? "and the app says failed" : "and the app sees it worked"}.`;

  const chipsWidth = KEY_MODES.map((m) => chipWidth(m.chip));
  const chipsTotal = chipsWidth.reduce((a, b) => a + b, 0) + 8 * (KEY_MODES.length - 1);
  const chipLeft = (i: number) => (W - chipsTotal) / 2 + chipsWidth.slice(0, i).reduce((a, b) => a + b + 8, 0);

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={<>Drag the rail to change how slow the <b>provider</b> is, and tap a key mode.</>}
      controls={<BeatButton onClick={() => setRunStart(clock.seconds)}>Replay</BeatButton>}
    >
      <div ref={box}>
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={`${titleId} ${descId}`} className="block h-auto w-full select-none">
          <title id={titleId}>{title}</title>
          <desc id={descId}>{description}</desc>
          <DotGrid width={W} height={H} />

          {KEY_MODES.map((m, i) => (
            <SvgChip key={m.id} x={r2(chipLeft(i))} y={62} width={chipsWidth[i]} text={m.chip} label={m.full} pressed={mode === m.id} onPress={() => change(() => setMode(m.id))} />
          ))}

          {/* The lanes between the three cards, and the tries that fly along them. */}
          <line x1={LANE.from} x2={LANE.api} y1={CARD_Y} y2={CARD_Y} strokeWidth={2} className={NEUTRAL.faintStroke} />
          <line x1={API_X + NODE_W / 2} x2={LANE.to} y1={CARD_Y} y2={CARD_Y} strokeWidth={2} className={NEUTRAL.faintStroke} />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={CARD_Y} r={5} className={d.tone === "neutral" ? NEUTRAL.faintFill : TONES[d.tone].solidFill} />
          ))}

          <SvgNode x={PHONE_X} y={CARD_Y} label="Huda" kind="phone" status={phone.text} statusTone={phone.tone} mark={phone.tone === "bad" ? "bad" : undefined} />
          <SvgNode x={API_X} y={CARD_Y} label="API" kind="server" status={apiState.text} statusTone={apiState.tone} />
          <SvgNode x={PROV_X} y={CARD_Y} label="Provider" kind="server" status={providerStatus.text} statusTone={providerStatus.tone} mark={landed > 1 ? "bad" : undefined} />

          {/* The 250 ms wait ring for the try the app is waiting on. */}
          {waiting ? (
            <g>
              <circle cx={22} cy={178} r={9} fill="none" strokeWidth={3} className="stroke-muted" />
              <circle cx={22} cy={178} r={9} fill="none" strokeWidth={3} strokeLinecap="round" transform="rotate(-90 22 178)" strokeDasharray={56.55} strokeDashoffset={r2(56.55 * (1 - waiting.fraction))} className={TONES.accent.stroke} />
              <text x={38} y={182} className={cn(NEUTRAL.text, "text-[12px] font-semibold")}>{`try ${waiting.n} of 4`}</text>
            </g>
          ) : null}

          {/* Each charge drops a coin on the provider. */}
          {COIN_X.map((cx, i) => {
            const c = run.charges[i];
            const landedCoin = c !== undefined && t >= c;
            const drop = landedCoin && Number.isFinite(t) ? (1 - reveal(t, c, c + 90)) * -14 : 0;
            return landedCoin ? (
              <circle key={i} cx={cx} cy={r2(178 + drop)} r={8} strokeWidth={2} className={cn(i === 0 ? TONES.good.softFill : TONES.bad.softFill, i === 0 ? TONES.good.stroke : TONES.bad.stroke)} />
            ) : (
              <circle key={i} cx={cx} cy={178} r={8} fill="none" strokeWidth={1.5} strokeDasharray="3 3" className={NEUTRAL.faintStroke} />
            );
          })}

          {/* Time strip: one row per try. Top bar: the app waits. Thin bar: the provider works. Coin: the charge lands. */}
          {run.tries.map((tr, i) => {
            const cy = G.y0 + i * G.pitch;
            const shown = t >= tr.start;
            const tone = waitBarTone(tr);
            const waitEnd = tr.endAt;
            const w = (waitEnd - tr.start) * SCALE * reveal(t, tr.start, waitEnd);
            const done = t >= waitEnd;
            const barTone = done ? tone : "accent";
            const provW = tr.chargeAt === null ? 0 : (tr.chargeAt - tr.start) * SCALE * reveal(t, tr.start, tr.chargeAt);
            const coinOn = tr.chargeAt !== null && t >= tr.chargeAt;
            const chargeIndex = tr.chargeAt === null ? 0 : run.charges.indexOf(tr.chargeAt);
            return (
              <g key={tr.n} style={{ opacity: shown ? 1 : 0.0 }} className="transition-opacity duration-200 motion-reduce:transition-none">
                <text x={10} y={cy + 4} className={cn(NEUTRAL.mutedText, "text-[12px] font-medium")}>{`try ${tr.n}`}</text>
                {tr.outcome === "saved" || tr.outcome === "conflict" ? (
                  <circle cx={X(tr.start)} cy={cy - 3} r={5} className={tr.outcome === "saved" ? TONES.good.solidFill : TONES.warn.solidFill} />
                ) : (
                  <rect x={X(tr.start)} y={cy - 8} width={Math.max(0, r2(w))} height={10} rx={5} strokeWidth={1.5} className={cn(TONES[barTone].softFill, TONES[barTone].stroke)} />
                )}
                {tr.chargeAt !== null ? (
                  <>
                    <rect x={X(tr.start)} y={cy + 4} width={Math.max(0, r2(provW))} height={4} rx={2} className={NEUTRAL.faintFill} />
                    {coinOn ? <circle cx={X(tr.chargeAt)} cy={cy + 6} r={5} className={chargeIndex === 0 ? TONES.good.solidFill : TONES.bad.solidFill} /> : null}
                  </>
                ) : null}
              </g>
            );
          })}
          {playhead !== null ? <line x1={playhead} x2={playhead} y1={G.y0 - 9} y2={G.y0 + 4 * G.pitch - 6} strokeWidth={1.5} strokeDasharray="4 3" className={TONES.accent.stroke} /> : null}

          {[0, 500, 1000, 1500].map((ms) => (
            <g key={ms}>
              <line x1={X(ms)} x2={X(ms)} y1={G.y0 + 4 * G.pitch - 2} y2={G.y0 + 4 * G.pitch + 3} strokeWidth={1.5} className={NEUTRAL.faintStroke} />
              <text x={X(ms)} y={G.y0 + 4 * G.pitch + 17} textAnchor={ms === 0 ? "start" : ms === 1500 ? "end" : "middle"} className={cn(NEUTRAL.mutedText, "text-[11.5px] tabular-nums")}>
                {ms === 0 ? "0" : ms === 1500 ? "1.5 s" : ms === 1000 ? "1 s" : "0.5 s"}
              </text>
            </g>
          ))}

          {/* Legend. */}
          <g>
            <rect x={14} y={H - 20} width={16} height={9} rx={4.5} strokeWidth={1.5} className={cn(TONES.accent.softFill, TONES.accent.stroke)} />
            <text x={36} y={H - 11} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>app waits 250 ms</text>
            <rect x={150} y={H - 17} width={16} height={4} rx={2} className={NEUTRAL.faintFill} />
            <text x={172} y={H - 11} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>provider works</text>
            <circle cx={278} cy={H - 15} r={5} className={TONES.good.solidFill} />
            <text x={288} y={H - 11} className={cn(NEUTRAL.mutedText, "text-[11.5px]")}>a charge lands</text>
          </g>

          <VerdictBanner width={W} text={verdict.text} tone={verdict.tone} />
        </svg>
      </div>
      <RailStrip
        label="How long the provider takes for each try"
        valueText={`${run.providerMs} milliseconds. ${verdict.text}`}
        value={run.providerMs}
        ladder={PROVIDER_LADDER}
        fraction={(run.providerMs - PROVIDER.min) / (PROVIDER.max - PROVIDER.min)}
        fromFraction={(f) => {
          const ms = clampProvider(PROVIDER.min + f * (PROVIDER.max - PROVIDER.min));
          const near = PROVIDER.snaps.find((s) => Math.abs(s - ms) <= 8);
          return near ?? ms;
        }}
        onChange={(v) => change(() => setProviderMs(v))}
        marks={[
          { at: (200 - PROVIDER.min) / (PROVIDER.max - PROVIDER.min) },
          { at: (250 - PROVIDER.min) / (PROVIDER.max - PROVIDER.min), label: "250", tone: "warn" },
          { at: (280 - PROVIDER.min) / (PROVIDER.max - PROVIDER.min) },
          { at: (450 - PROVIDER.min) / (PROVIDER.max - PROVIDER.min) },
        ]}
        ends={["100 ms", "600 ms"]}
        caption={`provider takes ${run.providerMs} ms`}
      />
    </BeatFrame>
  );
}
