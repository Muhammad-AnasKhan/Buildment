"use client";

import { useId, useRef, useState } from "react";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { cn } from "../../lib/utils";
import { BeatFrame } from "../primitives/beat-frame";
import { PictureSlider } from "../primitives/picture-slider";
import { TONES, type Tone } from "../primitives/tones";
import { useBeatClock } from "../primitives/use-beat-clock";
import {
  computeCrowdState,
  computeCurveVisual,
  computeQueueTray,
  computeServerStrain,
  computeTimeoutDrops,
  CROWD_STAGE,
  CURVE_PLOT,
  flowDots,
  flowDotsPerSecond,
  formatCount,
  LANE_Y,
  launchDay,
  loadTimeLabel,
  RAIL_GEOM,
  SRV_POS,
  STUDENT_LADDER,
  STUDENTS,
  studentsFromFraction,
  studentsToFraction,
  TRAY,
  VIEW_H,
  VIEW_W,
  type BackCrowdDot,
  type CrowdPanelState,
  type CurveVisualState,
  type FrontStudentAvatar,
  type QueueTrayState,
  type ServerStrainState,
  type TimeoutDrop,
} from "./model";

const busyText = (busy: number) => `${formatCount(busy * 100)}% busy`;

// ---------- Palette: Tailwind classes only, warm by day, twilight by night ----------
// Objects that are "things" (skin, hair, shirts, envelopes, the metal rack)
// keep one colour in both themes. Ground, paper, ink and outlines switch, so
// the scene reads as intentional on a light or a dark page.

/** Skin tones for the student figures, the same in both themes. */
const SKIN = ["fill-orange-100", "fill-orange-200", "fill-orange-300", "fill-amber-700", "fill-rose-200", "fill-amber-800"] as const;
/** Hair colours. Index 3 is a blue cap and does not use this list. */
const HAIR = ["fill-stone-900", "fill-amber-950", "fill-amber-600", "fill-slate-800", "fill-orange-900", "fill-stone-700"] as const;
/** Hoodie colours. */
const SHIRT = ["fill-indigo-500", "fill-pink-500", "fill-teal-500", "fill-orange-500", "fill-violet-500", "fill-sky-500"] as const;

const C = {
  ink: "fill-stone-800 dark:fill-stone-100",
  muted: "fill-stone-600 dark:fill-stone-300",
  mutedStroke: "stroke-stone-500 dark:stroke-stone-400",
  /** Outline for drawn objects. */
  outline: "stroke-stone-800 dark:stroke-slate-950",
  /** Eyes and mouths sit on skin, so they stay dark in both themes. */
  face: "fill-stone-900",
  faceStroke: "stroke-stone-900",
  shadow: "fill-stone-900 dark:fill-black",
  paper: "fill-white dark:fill-slate-800",
  paperStroke: "stroke-white dark:stroke-slate-800",
  paperLip: "fill-stone-300 dark:fill-slate-950",
  cloud: "fill-white dark:fill-indigo-900",
  ground: "fill-orange-100 dark:fill-slate-900",
  groundLine: "stroke-orange-300 dark:stroke-slate-700",
  hill: "fill-lime-100 dark:fill-emerald-950",
  hillEdge: "stroke-lime-400 dark:stroke-emerald-800",
  walk: "fill-amber-50 dark:fill-slate-800",
  walkEdge: "stroke-amber-300 dark:stroke-slate-600",
  brass: "fill-amber-500",
  brassStroke: "stroke-amber-600 dark:stroke-amber-500",
  chuteBed: "fill-amber-50 dark:fill-slate-800",
  rackFront: "fill-slate-500 dark:fill-slate-600",
  rackSide: "fill-slate-600 dark:fill-slate-700",
  rackBay: "fill-slate-800 dark:fill-slate-900",
  rackTrim: "fill-slate-300 dark:fill-slate-400",
  rackTrimStroke: "stroke-slate-300 dark:stroke-slate-400",
  curve: "stroke-blue-600 dark:stroke-blue-400",
  /** Halo in the paper colour behind a label on the clipboard. */
  paperHalo: "stroke-white dark:stroke-slate-800 [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]",
  /** Halo in the ground colour behind a label on the floor. */
  groundHalo: "stroke-orange-100 dark:stroke-slate-900 [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]",
};

/** Bright tone colours for illustrated parts, on top of the shared TONES. */
const TONE_ART: Record<Tone, { solid: string; solidStroke: string; lip: string; screen: string }> = {
  good: { solid: "fill-emerald-500", solidStroke: "stroke-emerald-500", lip: "fill-emerald-700", screen: "fill-emerald-100" },
  warn: { solid: "fill-amber-500", solidStroke: "stroke-amber-500", lip: "fill-amber-700", screen: "fill-amber-100" },
  bad: { solid: "fill-red-500", solidStroke: "stroke-red-500", lip: "fill-red-700", screen: "fill-red-100" },
  accent: { solid: "fill-blue-500", solidStroke: "stroke-blue-500", lip: "fill-blue-700", screen: "fill-blue-100" },
};

/**
 * Beat 1 of 1.1 (Illustrated edition): a playful Brilliant/Duolingo-inspired
 * scene where expressive student avatars send paper planes and request
 * envelopes to a single 3D server rack that warms up, fills its waiting chute,
 * and puffs smoke when overloaded.
 */
export function LaunchDayIllustratedCanvas({
  title,
  limits,
}: {
  title: string;
  purpose: string;
  limits: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const titleId = useId();
  const descId = useId();
  const uid = useId().replace(/:/g, "");

  const clock = useBeatClock(containerRef);
  const [students, setStudents] = useState<number>(STUDENTS.default);

  const m = launchDay(students);
  const growing = !m.steady;
  const [growth, setGrowth] = useState({ growing, since: clock.seconds });
  if (growth.growing !== growing) {
    setGrowth({ growing, since: clock.seconds });
  }
  const elapsed = growing ? Math.max(0, clock.seconds - growth.since) : 0;

  const arrivalDots = flowDotsPerSecond(m.busy);
  const serviceDots = flowDotsPerSecond(Math.min(1, m.busy));

  const timeLabel = loadTimeLabel(m);
  const queue = computeQueueTray(m.inside, growing, elapsed, clock.seconds, serviceDots, clock.reduced);
  const drops = computeTimeoutDrops(growing, queue.full, elapsed, clock.reduced);
  const strain = computeServerStrain(m.busy, clock.seconds, clock.reduced);
  const crowd = computeCrowdState(m.crowd, m.busy, clock.seconds, clock.reduced);
  const curve = computeCurveVisual(m.busy, timeLabel.length);
  const inFlight = flowDots(clock.seconds, arrivalDots);

  const summary = m.steady
    ? `${formatCount(m.students)} students send ${formatCount(m.arrivals)} requests a second to one server that can finish 100. It is ${busyText(m.busy)}, and each request takes ${timeLabel} on average. ${m.verdict}.`
    : `${formatCount(m.students)} students send ${formatCount(m.arrivals)} requests a second to one server that can finish 100. The waiting line has no steady length${m.growthPerSec > 0 ? `: it grows by ${formatCount(m.growthPerSec)} requests every second` : ""}, and pages time out.`;

  const flightStartX = 160;
  const flightEndX = Math.max(flightStartX + 28, queue.tailX - 4);
  const srvLeft = SRV_POS.x - SRV_POS.w / 2;
  const lineActive = queue.count > 0 || growing;

  return (
    <BeatFrame
      label={title}
      limits={limits}
      hint={
        <>
          Drag across the picture to change the number of <b>students online</b>.
        </>
      }
    >
      <div ref={containerRef}>
        <PictureSlider
          svgRef={svgRef}
          x0={RAIL_GEOM.x0}
          x1={RAIL_GEOM.x1}
          label="Students online"
          valueText={`${formatCount(m.students)} students: ${busyText(m.busy)}, ${timeLabel}. ${m.verdict}`}
          value={m.students}
          ladder={STUDENT_LADDER}
          fromFraction={studentsFromFraction}
          onChange={setStudents}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            role="img"
            aria-labelledby={`${titleId} ${descId}`}
            className="block h-auto w-full select-none rounded-xl"
          >
            <title id={titleId}>{title}</title>
            <desc id={descId}>{summary}</desc>

            <defs>
              {/* Gradient stops take their colour from a text-* class through currentColor. */}
              <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" className="text-amber-50 dark:text-slate-950" />
                <stop offset="100%" stopColor="currentColor" className="text-orange-50 dark:text-indigo-950" />
              </linearGradient>
              <radialGradient id={`${uid}-warm-glow`} cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity={strain.overloaded ? 0.52 : 0.36}
                  className={strain.overloaded ? "text-red-500" : "text-amber-500"}
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                  className={strain.overloaded ? "text-red-500" : "text-amber-500"}
                />
              </radialGradient>
            </defs>

            {/* 1. Warm illustrated sky, clouds, ground plane, and campus lawn */}
            <SceneBackdrop skyGradId={`${uid}-sky`} />

            {/* 2. Dashed flight guide, and the cord the clipboard hangs from */}
            <g aria-hidden>
              <path
                d={`M${flightStartX} ${LANE_Y} Q${(flightStartX + srvLeft) / 2} ${LANE_Y - 12} ${srvLeft} ${LANE_Y}`}
                fill="none"
                className={C.mutedStroke}
                strokeOpacity={0.4}
                strokeWidth={1.75}
                strokeDasharray="4 5"
                strokeLinecap="round"
              />
              <path
                d={curve.cordPath}
                fill="none"
                className={lineActive ? TONES[m.tone].stroke : C.mutedStroke}
                strokeOpacity={lineActive ? 0.85 : 0.5}
                strokeWidth={2}
                strokeDasharray="3.5 4"
                strokeLinecap="round"
              />
              <circle
                cx={curve.cordStartX}
                cy={curve.cordStartY}
                r={3}
                className={lineActive ? TONE_ART[m.tone].solid : C.muted}
                opacity={lineActive ? 0.95 : 0.6}
              />
            </g>

            {/* 3. Waiting chute (mail corral) directly in front of the server gate */}
            <WaitingChute queue={queue} growing={growing} tone={m.tone} />

            {/* 4. Paper planes and request envelopes flying from students to the chute */}
            <FlyingRequests inFlight={inFlight} startX={flightStartX} endX={flightEndX} />

            {/* 5. Timed-out envelopes tumbling out of the chute when overloaded */}
            <FallingTimeouts drops={drops} />

            {/* 6. Left stage: student crowd on the terraced lawn, front queue, Live Number 1 */}
            <IllustratedStudentCrowd crowd={crowd} studentsText={`${formatCount(m.students)} online`} />

            {/* 7. Right actor: server rack with LEDs, fan, thermometer, smoke, and Live Number 2 */}
            <IllustratedServerRack glowId={`${uid}-warm-glow`} status={busyText(m.busy)} tone={m.tone} strain={strain} />

            {/* 8. Lower right: clipboard chart with the M/M/1 knee curve and Live Number 3 */}
            <IllustratedCurveBoard curve={curve} label={timeLabel} tone={m.tone} overloaded={growing} />

            {/* 9. Bottom: tactile slider rail (no extra numbers) */}
            <IllustratedSliderRail
              x0={RAIL_GEOM.x0}
              x1={RAIL_GEOM.x1}
              y={RAIL_GEOM.y}
              fraction={studentsToFraction(m.students)}
              tone={m.tone}
              marks={[
                { at: studentsToFraction(100) },
                { at: studentsToFraction(1000) },
                { at: studentsToFraction(2000), label: "full", tone: "bad" },
                { at: studentsToFraction(10_000) },
              ]}
            />

            {/* 10. Top floating verdict badge (at most 38 characters) */}
            <IllustratedVerdictBanner width={VIEW_W} text={m.verdict} tone={m.tone} />
          </svg>
        </PictureSlider>
      </div>
    </BeatFrame>
  );
}

/**
 * Warm storybook background: sky gradient, soft clouds, grounded studio floor,
 * and a terraced green campus hill on the left with a sandy queue path.
 */
function SceneBackdrop({ skyGradId }: { skyGradId: string }) {
  // The floor's horizon sits high enough that the slider's mark label below
  // it never touches the line.
  const horizon = `M0 266 Q210 261 ${VIEW_W} 266`;
  return (
    <g aria-hidden>
      {/* Sky */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} rx={12} fill={`url(#${skyGradId})`} />

      {/* Soft decorative clouds in the upper sky */}
      <g className={C.cloud} opacity={0.75}>
        <path d="M162 58 C162 52 169 49 174 53 C178 47 188 48 191 54 C196 54 199 58 198 62 L160 62 C158 60 159 58 162 58 Z" />
        <path d="M262 49 C262 44 268 42 272 45 C276 40 284 41 286 46 C290 46 293 49 292 53 L260 53 C258 51 259 49 262 49 Z" />
      </g>

      {/* Grounded warm floor deck at the bottom */}
      <path d={`${horizon} L${VIEW_W} ${VIEW_H} L0 ${VIEW_H} Z`} className={C.ground} />
      <path d={horizon} fill="none" className={C.groundLine} strokeWidth={2} />

      {/* Left campus courtyard and tiered lawn for the student crowd */}
      <rect
        x={CROWD_STAGE.x}
        y={86}
        width={CROWD_STAGE.w}
        height={182}
        rx={20}
        className={cn(C.hill, C.hillEdge)}
        strokeWidth={2}
      />
      {/* Amphitheater terrace stripes */}
      <path
        d={`M${CROWD_STAGE.x + 8} 132 Q${CROWD_STAGE.x + CROWD_STAGE.w / 2} 126 ${CROWD_STAGE.x + CROWD_STAGE.w - 8} 132`}
        fill="none"
        className={C.hillEdge}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <path
        d={`M${CROWD_STAGE.x + 8} 162 Q${CROWD_STAGE.x + CROWD_STAGE.w / 2} 156 ${CROWD_STAGE.x + CROWD_STAGE.w - 8} 162`}
        fill="none"
        className={C.hillEdge}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />

      {/* Sandy queue walkway where the front-row student avatars line up */}
      <rect
        x={CROWD_STAGE.x + 6}
        y={184}
        width={CROWD_STAGE.w - 12}
        height={58}
        rx={14}
        className={cn(C.walk, C.walkEdge)}
        strokeWidth={1.5}
      />

      {/* Little velvet-rope stanchion at the right end of the student queue */}
      <g transform="translate(177, 206)">
        <ellipse cx={0} cy={26} rx={5.5} ry={2.2} className={C.shadow} opacity={0.22} />
        <rect x={-1.5} y={4} width={3} height={22} rx={1.5} className={cn("fill-amber-600", C.outline)} strokeWidth={1.2} />
        <circle cx={0} cy={3.5} r={3.2} className={cn("fill-amber-400", C.outline)} strokeWidth={1.2} />
      </g>
    </g>
  );
}

/**
 * Paper airplanes and sealed envelopes flying along a gentle arc from the
 * student crowd toward the tail of the server's waiting chute.
 */
function FlyingRequests({
  inFlight,
  startX,
  endX,
}: {
  inFlight: { id: number; progress: number }[];
  startX: number;
  endX: number;
}) {
  return (
    <g aria-hidden>
      {inFlight.map((d) => {
        const x = startX + (endX - startX) * d.progress;
        const arcLift = Math.sin(d.progress * Math.PI) * 9;
        const y = LANE_Y - arcLift;
        const pitchDeg = (0.5 - d.progress) * 22;
        const isPlane = d.id % 2 === 0;

        return (
          <g key={d.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${pitchDeg.toFixed(1)})`}>
            {/* Motion contrail */}
            <line
              x1={-13}
              x2={-6}
              y1={1}
              y2={1}
              className="stroke-blue-500 dark:stroke-blue-400"
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.45}
            />
            {isPlane ? (
              /* Illustrated folded paper airplane */
              <g>
                <polygon
                  points="-6,-4 8,0 -6,5 -3,0"
                  className="fill-white stroke-blue-900"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
                <polygon points="-6,5 8,0 -3,0" className="fill-blue-300" />
              </g>
            ) : (
              /* Illustrated sealed request envelope */
              <g>
                <rect x={-6} y={-4.5} width={12} height={9} rx={2} className="fill-amber-100 stroke-amber-800" strokeWidth={1.35} />
                <path d="M-5.5 -4 L0 1 L5.5 -4" fill="none" className="stroke-amber-700" strokeWidth={1.2} strokeLinejoin="round" />
                <circle cx={0} cy={0.5} r={1.4} className="fill-red-500" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Illustrated waiting mail chute directly in front of the server rack.
 * Requests pack inside as mini envelopes; past 100% busy, the bottom trapdoor
 * springs open so timed-out requests drop through.
 */
function WaitingChute({ queue, growing, tone }: { queue: QueueTrayState; growing: boolean; tone: Tone }) {
  const t = TONES[tone];
  const active = queue.count > 0 || growing;
  const w = TRAY.x1 - TRAY.x0;
  const h = TRAY.y1 - TRAY.y0;
  const trapOpen = growing && queue.full;
  const railClass = active ? t.stroke : C.brassStroke;

  return (
    <g aria-hidden>
      {/* Soft shadow under the chute */}
      <rect x={TRAY.x0} y={TRAY.y0 + 3} width={w} height={h} rx={10} className={C.shadow} opacity={0.1} />

      {/* Inner chute bed */}
      <rect x={TRAY.x0} y={TRAY.y0} width={w} height={h} rx={10} className={active ? t.softFill : C.chuteBed} />

      {/* Top brass rail and right gate wall */}
      <path
        d={`M${TRAY.x0} ${TRAY.y0} L${TRAY.x1} ${TRAY.y0} L${TRAY.x1} ${TRAY.y1}`}
        fill="none"
        className={railClass}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom rail or hinged open trapdoor */}
      {trapOpen ? (
        <>
          <line x1={TRAY.x0} x2={TRAY.x0 + 20} y1={TRAY.y1} y2={TRAY.y1 + 9} className={TONES.bad.stroke} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={TRAY.x1} x2={TRAY.x1 - 20} y1={TRAY.y1} y2={TRAY.y1 + 9} className={TONES.bad.stroke} strokeWidth={2.5} strokeLinecap="round" />
        </>
      ) : (
        <line x1={TRAY.x0} x2={TRAY.x1} y1={TRAY.y1} y2={TRAY.y1} className={railClass} strokeWidth={2.5} strokeLinecap="round" />
      )}

      {/* Entrance post caps */}
      <circle cx={TRAY.x0} cy={TRAY.y0} r={3} className={cn(C.brass, C.outline)} strokeWidth={1.2} />
      <circle cx={TRAY.x0} cy={TRAY.y1} r={3} className={cn(C.brass, C.outline)} strokeWidth={1.2} />

      {/* Caption above the waiting chute */}
      <text
        x={(TRAY.x0 + TRAY.x1) / 2}
        y={TRAY.y0 - 7}
        textAnchor="middle"
        className={cn("text-[11.5px]", active ? cn(t.text, "font-bold") : cn(C.muted, "font-medium"))}
      >
        {queue.caption}
      </text>

      {/* Stacked mini request envelopes waiting inside the chute */}
      {queue.dots.map((d) => (
        <g key={d.id} opacity={d.opacity} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`}>
          <rect x={-5} y={-3.8} width={10} height={7.6} rx={1.8} className={cn("fill-white", t.stroke)} strokeWidth={1.4} />
          <path d="M-4.2 -3 L0 0.8 L4.2 -3" fill="none" className={t.stroke} strokeWidth={1.15} strokeLinejoin="round" />
        </g>
      ))}

      {/* Overflow dots behind the chute when more requests wait outside */}
      {queue.more
        ? [0, 1, 2].map((i) => (
            <circle
              key={`more-${i}`}
              cx={TRAY.x0 - 5 - i * 5.5}
              cy={LANE_Y}
              r={2.1}
              opacity={0.88 - i * 0.25}
              className={TONE_ART[tone].solid}
            />
          ))
        : null}
    </g>
  );
}

/**
 * Timed-out request envelopes stamped with a red X tumbling out of the open
 * chute trapdoor when the server is overloaded. The words sit below the fall,
 * clear of the lawn and the clipboard.
 */
function FallingTimeouts({ drops }: { drops: TimeoutDrop[] }) {
  if (drops.length === 0) return null;
  return (
    <g aria-hidden>
      {drops.map((d) => (
        <g key={d.id} opacity={d.opacity} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) rotate(${d.angle.toFixed(1)})`}>
          <rect x={-5.5} y={-4} width={11} height={8} rx={1.8} className="fill-red-100 stroke-red-600" strokeWidth={1.35} />
          <line x1={-3} x2={3} y1={-2.5} y2={2.5} className="stroke-red-600" strokeWidth={1.8} strokeLinecap="round" />
          <line x1={-3} x2={3} y1={2.5} y2={-2.5} className="stroke-red-600" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ))}
      <text x={CROWD_STAGE.x + CROWD_STAGE.w + 6} y={CURVE_PLOT.cardY - 6} className={cn(TONES.bad.text, "text-[11.5px] font-bold")}>
        timed out
      </text>
    </g>
  );
}

/**
 * Left campus stage:
 * - Signpost badge at top left showing Live Number 1 (`1,000 online`)
 * - Amphitheater crowd of student busts scaling logarithmically up to 100,000
 * - Front queue of expressive student avatars (calm, impatient with a clock
 *   bubble, or frustrated and turning around to walk away).
 */
function IllustratedStudentCrowd({ crowd, studentsText }: { crowd: CrowdPanelState; studentsText: string }) {
  const pillTone = crowd.captionTone === "neutral" ? null : TONES[crowd.captionTone];

  return (
    <g>
      {/* Top-left enamel signpost with Live Number 1 */}
      <g transform="translate(14, 46)">
        <rect x={0} y={3} width={144} height={34} rx={12} className={C.paperLip} />
        <rect x={0} y={0} width={144} height={34} rx={12} className={cn(C.paper, C.outline)} strokeWidth={1.8} />
        {/* Friendly student avatar emblem inside the signpost */}
        <circle cx={19} cy={17} r={11} className={cn("fill-violet-100 dark:fill-violet-300", C.outline)} strokeWidth={1.4} />
        <circle cx={19} cy={14.5} r={4} className={cn("fill-orange-300", C.outline)} strokeWidth={1.2} />
        <path d="M13 24 C13 19.5 25 19.5 25 24" className={cn("fill-violet-600", C.outline)} strokeWidth={1.2} />

        <text x={36} y={14} className={cn(C.muted, "text-[11.5px] font-semibold")}>
          Students
        </text>
        <text x={36} y={27.5} className={cn(C.ink, "text-[12.5px] font-bold tabular-nums")}>
          {studentsText}
        </text>
      </g>

      {/* Background amphitheater crowd (up to 49 figures behind the front row) */}
      <g aria-hidden>
        {crowd.backCrowd.map((b) => (
          <BackStudentBust key={b.id} dot={b} />
        ))}
      </g>

      {/* Foreground expressive student avatars standing in the queue line */}
      <g aria-hidden>
        {crowd.frontAvatars.map((avatar, idx) => (
          <ExpressiveStudentAvatar key={avatar.id} avatar={avatar} showBubble={idx === 0 || (idx === 1 && avatar.mood !== "calm")} />
        ))}
      </g>

      {/* Bottom crowd mood pill on the lawn */}
      <g aria-hidden transform={`translate(${CROWD_STAGE.x + 8}, 244)`}>
        <rect
          x={0}
          y={0}
          width={CROWD_STAGE.w - 16}
          height={20}
          rx={10}
          className={pillTone ? cn(pillTone.softFill, pillTone.stroke) : cn(C.paper, C.hillEdge)}
          strokeWidth={1.4}
        />
        <text
          x={(CROWD_STAGE.w - 16) / 2}
          y={14}
          textAnchor="middle"
          className={cn(pillTone ? pillTone.text : C.ink, "text-[11.5px] font-bold")}
        >
          {crowd.caption}
        </text>
      </g>
    </g>
  );
}

/** Mini head-and-shoulders student figure for the amphitheater tiers. */
function BackStudentBust({ dot }: { dot: BackCrowdDot }) {
  const shirt = dot.mood === "timeout" ? "fill-red-500" : dot.mood === "waiting" ? "fill-amber-500" : SHIRT[dot.shirtIdx];
  const opacity = dot.mood === "left" ? 0.42 : 0.94;

  return (
    <g transform={`translate(${dot.cx.toFixed(1)} ${dot.cy.toFixed(1)})`} opacity={opacity}>
      <path d="M-5.2 6 C-5.2 1.2 5.2 1.2 5.2 6 Z" className={cn(shirt, C.outline)} strokeWidth={1.1} strokeLinejoin="round" />
      <circle cx={0} cy={-2} r={3.6} className={cn(SKIN[dot.skinIdx], C.outline)} strokeWidth={1.1} />
      <path d="M-3.6 -2.5 C-3.2 -6.2 3.2 -6.2 3.6 -2.5 Z" className={HAIR[dot.hairIdx]} />
    </g>
  );
}

/**
 * Detailed front-row student avatar with varied skin tone, hairstyle, sweater,
 * facial expression (calm, impatient, timing out), and walking-away pose.
 */
function ExpressiveStudentAvatar({ avatar, showBubble }: { avatar: FrontStudentAvatar; showBubble: boolean }) {
  const hair = cn(HAIR[avatar.hairIdx], C.outline);
  const walkingAway = avatar.mood === "left";
  const dir = walkingAway ? -1 : 1;

  return (
    <g transform={`translate(${avatar.cx.toFixed(1)} ${(avatar.cy + avatar.bobY).toFixed(1)})`}>
      {/* Soft ground shadow */}
      <ellipse cx={0} cy={16 - avatar.bobY} rx={8.5} ry={3} className={C.shadow} opacity={0.18} />

      {/* Dust puffs behind heels when giving up and walking away */}
      {walkingAway ? (
        <g className="fill-white stroke-stone-400 dark:fill-slate-600 dark:stroke-slate-400" strokeWidth={1}>
          <circle cx={9} cy={13} r={2.8} opacity={0.85} />
          <circle cx={13.5} cy={11.5} r={2} opacity={0.65} />
        </g>
      ) : null}

      <g transform={`scale(${dir}, 1)`}>
        {/* Walking legs when leaving */}
        {walkingAway ? (
          <g className={C.outline} strokeWidth={2.2} strokeLinecap="round">
            <line x1={-2.5} y1={10} x2={-5.5} y2={15.5} />
            <line x1={2.5} y1={10} x2={5.5} y2={14.5} />
          </g>
        ) : null}

        {/* Shoulders / hoodie */}
        <path d="M-8.5 13 C-8.5 4.5 8.5 4.5 8.5 13 Z" className={cn(SHIRT[avatar.shirtIdx], C.outline)} strokeWidth={1.55} strokeLinejoin="round" />
        {/* Collar V-neck detail */}
        <path d="M-2.5 6.2 L0 9.2 L2.5 6.2" fill="none" className="stroke-white/90" strokeWidth={1.2} strokeLinecap="round" />

        {/* Head */}
        <circle cx={0} cy={-1} r={6.8} className={cn(SKIN[avatar.skinIdx], C.outline)} strokeWidth={1.55} />

        {/* Rosy cheek */}
        <circle cx={3.2} cy={0.5} r={1.3} className="fill-rose-500" opacity={0.35} />

        {/* Varied hairstyles */}
        {avatar.hairIdx === 0 ? (
          /* Afro puffs */
          <g className={hair} strokeWidth={1.2}>
            <circle cx={-5.2} cy={-6.2} r={3.2} />
            <circle cx={4.8} cy={-6.2} r={3.2} />
            <path d="M-6.5 -2.2 C-6 -8.2 6 -8.2 6.5 -2.2 C4 -5 -4 -5 -6.5 -2.2 Z" />
          </g>
        ) : avatar.hairIdx === 1 ? (
          /* High top bun */
          <g className={hair} strokeWidth={1.2}>
            <circle cx={-1} cy={-9.2} r={3} />
            <path d="M-6.6 -1.8 C-6.2 -8 6.2 -8 6.6 -1.8 C3.5 -4.8 -3.5 -4.8 -6.6 -1.8 Z" />
          </g>
        ) : avatar.hairIdx === 2 ? (
          /* Side-swept bangs */
          <path d="M-6.8 -1.5 C-6.8 -8.4 6.8 -8.4 6.8 -2 C3 -2.5 -1 -5.2 -6.8 -1.5 Z" className={hair} strokeWidth={1.2} />
        ) : avatar.hairIdx === 3 ? (
          /* Baseball cap facing forward */
          <g>
            <path d="M-6.8 -2.2 C-6.5 -8.5 6.5 -8.5 6.8 -2.2 Z" className={cn("fill-blue-600", C.outline)} strokeWidth={1.2} />
            <path d="M0 -3 L9.5 -2 C9.5 -4 5 -4.5 0 -3 Z" className={cn("fill-blue-700", C.outline)} strokeWidth={1.1} />
          </g>
        ) : avatar.hairIdx === 4 ? (
          /* Curly bob */
          <path d="M-7.2 1 C-8 -7.8 7.5 -8.2 7 0.5 C5 -4.5 -4.5 -4.5 -7.2 1 Z" className={hair} strokeWidth={1.2} />
        ) : (
          /* Spiky crop */
          <path
            d="M-6.6 -2 L-5 -7.5 L-2 -5.8 L0.5 -8.2 L3 -5.8 L6 -7.2 L6.6 -2 C3 -4.5 -3 -4.5 -6.6 -2 Z"
            className={hair}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
        )}

        {/* Facial expression shifted slightly toward the facing direction */}
        <g transform="translate(1.2, 0)">
          {avatar.mood === "calm" ? (
            <>
              {/* Happy eyes and smile */}
              <circle cx={-1.8} cy={-1.2} r={0.95} className={C.face} />
              <circle cx={2.4} cy={-1.2} r={0.95} className={C.face} />
              <path d="M-1.2 1.6 Q0.4 3.2 2.2 1.6" fill="none" className={C.faceStroke} strokeWidth={1.3} strokeLinecap="round" />
            </>
          ) : avatar.mood === "waiting" ? (
            <>
              {/* Impatient furrowed brows, flat mouth, and sweat drop */}
              <line x1={-3} y1={-2.8} x2={-0.8} y2={-2} className={C.faceStroke} strokeWidth={1.25} strokeLinecap="round" />
              <line x1={3.4} y1={-2.8} x2={1.2} y2={-2} className={C.faceStroke} strokeWidth={1.25} strokeLinecap="round" />
              <circle cx={-1.8} cy={-0.8} r={0.9} className={C.face} />
              <circle cx={2.2} cy={-0.8} r={0.9} className={C.face} />
              <line x1={-1.2} y1={2.2} x2={2} y2={2} className={C.faceStroke} strokeWidth={1.3} strokeLinecap="round" />
              <path d="M-5.2 -3.2 C-6.2 -1 -4.2 -1 -5.2 -3.2 Z" className="fill-sky-400" />
            </>
          ) : (
            <>
              {/* Frustrated, timed-out eyes and open mouth */}
              <path d="M-2.8 -2 L-0.8 0 M-2.8 0 L-0.8 -2" className={C.faceStroke} strokeWidth={1.25} strokeLinecap="round" />
              <path d="M1.2 -2 L3.2 0 M1.2 0 L3.2 -2" className={C.faceStroke} strokeWidth={1.25} strokeLinecap="round" />
              <ellipse cx={0.4} cy={2.4} rx={1.6} ry={1.2} className={C.face} />
            </>
          )}
        </g>
      </g>

      {/* Overhead status bubble on key avatars so state is clear at a glance */}
      {showBubble && avatar.mood === "waiting" ? (
        <g transform="translate(0, -16)">
          <circle cx={0} cy={0} r={5.8} className="fill-amber-100 stroke-amber-600" strokeWidth={1.35} />
          <line x1={0} y1={0} x2={0} y2={-3} className="stroke-amber-800" strokeWidth={1.3} strokeLinecap="round" />
          <line x1={0} y1={0} x2={2.4} y2={0} className="stroke-amber-800" strokeWidth={1.3} strokeLinecap="round" />
        </g>
      ) : null}
      {showBubble && (avatar.mood === "timeout" || avatar.mood === "left") ? (
        <g transform="translate(0, -16)">
          <circle cx={0} cy={0} r={5.8} className="fill-red-100 stroke-red-600" strokeWidth={1.35} />
          <line x1={-2.2} y1={-2.2} x2={2.2} y2={2.2} className="stroke-red-600" strokeWidth={1.6} strokeLinecap="round" />
          <line x1={-2.2} y1={2.2} x2={2.2} y2={-2.2} className="stroke-red-600" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
}

/**
 * Illustrated server rack ("Server: App, DB, PDFs") with:
 * - A warm amber or pulsing red glow behind the chassis
 * - Rising cartoon smoke and a flashing siren when overloaded
 * - Three bays (cooling fan with the title and LEDs, the App/DB/PDF bay, and
 *   a screen showing Live Number 2: `50% busy`), each wide enough for its words
 * - A side thermometer filling with utilisation.
 */
function IllustratedServerRack({
  glowId,
  status,
  tone,
  strain,
}: {
  glowId: string;
  status: string;
  tone: Tone;
  strain: ServerStrainState;
}) {
  const left = SRV_POS.x - SRV_POS.w / 2;
  const top = SRV_POS.y - SRV_POS.h / 2;
  const w = SRV_POS.w;
  const h = SRV_POS.h;
  const art = TONE_ART[tone];

  // Bays run from left + 6 to 17 short of the right edge; the thermometer
  // lives in that right strip.
  const bayX = left + 6;
  const bayW = w - 23;
  const bayMid = bayX + bayW / 2;

  const spinDeg = Math.round(strain.workerProgress * 360);
  const fanX = bayX + 11;
  const fanY = top + 20;

  const thermX = left + w - 8.5;
  const thermTop = top + 12;
  const thermH = h - 26;
  const fillH = Math.max(4, Math.round(thermH * strain.fillRatio));
  const fillY = thermTop + thermH - fillH;

  return (
    <g>
      {/* Warm or red radial glow behind the rack when strained or overloaded */}
      {strain.strained ? (
        <ellipse
          cx={SRV_POS.x}
          cy={SRV_POS.y}
          rx={w * 0.56}
          ry={h * 0.62}
          fill={`url(#${glowId})`}
          opacity={strain.overloaded ? 0.65 + 0.35 * strain.pulse : 0.75}
          aria-hidden
        />
      ) : null}

      {/* Rising cartoon smoke above the top vents when strained or overloaded */}
      <g aria-hidden>
        {strain.smokePuffs.map((p) => (
          <g key={p.id} opacity={p.opacity} transform={`translate(${p.cx.toFixed(1)} ${p.cy.toFixed(1)})`}>
            <circle
              cx={0}
              cy={0}
              r={p.r}
              className={strain.overloaded ? "fill-slate-500 stroke-slate-700" : "fill-amber-200 stroke-amber-600"}
              strokeWidth={1.3}
            />
            <circle cx={-p.r * 0.55} cy={p.r * 0.2} r={p.r * 0.7} className={strain.overloaded ? "fill-slate-400" : "fill-amber-100"} />
            <circle cx={p.r * 0.55} cy={p.r * 0.25} r={p.r * 0.65} className={strain.overloaded ? "fill-slate-600" : "fill-amber-200"} />
          </g>
        ))}
      </g>

      <g transform={`translate(${strain.shakeX.toFixed(2)}, 0)`}>
        {/* Ground shadow and rubber feet */}
        <ellipse cx={SRV_POS.x} cy={top + h + 5} rx={w * 0.46} ry={4.5} className={C.shadow} opacity={0.2} aria-hidden />
        <rect x={left + 12} y={top + h - 2} width={14} height={6} rx={3} className="fill-stone-800 dark:fill-black" aria-hidden />
        <rect x={left + w - 26} y={top + h - 2} width={14} height={6} rx={3} className="fill-stone-800 dark:fill-black" aria-hidden />

        {/* Roof siren beacon when overloaded */}
        {strain.overloaded ? (
          <g aria-hidden transform={`translate(${SRV_POS.x}, ${top - 2})`}>
            <rect x={-10} y={-3} width={20} height={4} rx={2} className="fill-stone-800 dark:fill-stone-300" />
            <path d="M-7 -3 C-7 -12 7 -12 7 -3 Z" className={cn("fill-red-500", C.outline)} strokeWidth={1.5} opacity={0.6 + 0.4 * strain.pulse} />
            {/* Flashing alarm rays */}
            <g className="stroke-red-500" strokeWidth={2} strokeLinecap="round" opacity={strain.pulse}>
              <line x1={-12} y1={-9} x2={-17} y2={-13} />
              <line x1={0} y1={-13} x2={0} y2={-19} />
              <line x1={12} y1={-9} x2={17} y2={-13} />
            </g>
          </g>
        ) : null}

        {/* Chassis base shadow lip */}
        <rect x={left} y={top + 4} width={w} height={h} rx={14} className={cn(C.rackSide, C.outline)} strokeWidth={2} />

        {/* Chassis main metal body */}
        <rect
          x={left}
          y={top}
          width={w}
          height={h}
          rx={14}
          className={cn(C.rackFront, strain.overloaded ? "stroke-red-500" : strain.strained ? "stroke-amber-500" : C.outline)}
          strokeWidth={2.2}
        />

        {/* Top metal highlight bezel */}
        <path
          d={`M${left + 12} ${top + 4} L${left + w - 24} ${top + 4}`}
          className={C.rackTrimStroke}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.65}
          aria-hidden
        />

        {/* Bay 1: cooling fan, the title, and blinking LEDs at the far right */}
        <rect x={bayX} y={top + 8} width={bayW} height={24} rx={6} className={cn(C.rackBay, C.outline)} strokeWidth={1.4} aria-hidden />
        <g transform={`translate(${fanX} ${fanY}) rotate(${spinDeg})`} aria-hidden>
          <circle cx={0} cy={0} r={8} className="fill-slate-900 stroke-slate-600" strokeWidth={1.2} />
          <path d="M-6 0 L6 0 M0 -6 L0 6" className={art.solidStroke} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={0} cy={0} r={2.2} className={C.rackTrim} />
        </g>

        <text x={fanX + 13} y={top + 24.5} className="fill-slate-50 text-[12.5px] font-bold">
          Server
        </text>

        <g aria-hidden>
          {strain.leds.slice(0, 2).map((on, idx) => (
            <circle
              key={idx}
              cx={bayX + bayW - 13 + idx * 6.5}
              cy={top + 20}
              r={2.4}
              className={cn(on ? art.solid : "fill-slate-700", "stroke-slate-900")}
              strokeWidth={0.8}
            />
          ))}
        </g>

        {/* Bay 2: one machine holds everything (App, DB, PDFs) */}
        <rect x={bayX} y={top + 36} width={bayW} height={22} rx={6} className={cn(C.rackBay, C.outline)} strokeWidth={1.4} aria-hidden />
        <text x={bayMid} y={top + 51} textAnchor="middle" className="fill-slate-200 text-[11.5px] font-semibold">
          App, DB, PDFs
        </text>

        {/* Bay 3: status screen with Live Number 2 (`50% busy`) */}
        <rect x={bayX} y={top + 63} width={bayW} height={23} rx={7} className={cn(art.screen, TONES[tone].stroke)} strokeWidth={1.6} />
        <text x={bayMid} y={top + 78.5} textAnchor="middle" className="fill-slate-900 text-[12px] font-bold tabular-nums">
          {status}
        </text>

        {/* Side thermometer gauge */}
        <g aria-hidden>
          <rect x={thermX - 3} y={thermTop} width={6} height={thermH} rx={3} className={cn(C.rackBay, C.outline)} strokeWidth={1.2} />
          <rect x={thermX - 1.75} y={fillY} width={3.5} height={fillH} rx={1.75} className={art.solid} />
          <circle cx={thermX} cy={thermTop + thermH + 2} r={4.5} className={cn(art.solid, C.outline)} strokeWidth={1.3} />
        </g>
      </g>
    </g>
  );
}

/**
 * Lower-right clipboard chart showing the M/M/1 response-time knee curve, the
 * capacity wall, and Live Number 3 (`20 ms` or `line grows 400/s`). Word axis
 * labels (`idle`, `busy`, `limit`) keep extra numbers out of the picture. The
 * readout always sits in clear space above and left of the riding dot.
 */
function IllustratedCurveBoard({
  curve,
  label,
  tone,
  overloaded,
}: {
  curve: CurveVisualState;
  label: string;
  tone: Tone;
  overloaded: boolean;
}) {
  const t = TONES[tone];
  const art = TONE_ART[tone];
  const boardCenter = CURVE_PLOT.cardX + CURVE_PLOT.cardW / 2;
  const axisY = CURVE_PLOT.cardY + 93;

  return (
    <g>
      {/* Clipboard bottom lip and board surface */}
      <rect x={CURVE_PLOT.cardX} y={CURVE_PLOT.cardY + 3.5} width={CURVE_PLOT.cardW} height={CURVE_PLOT.cardH} rx={16} className={C.paperLip} />
      <rect
        x={CURVE_PLOT.cardX}
        y={CURVE_PLOT.cardY}
        width={CURVE_PLOT.cardW}
        height={CURVE_PLOT.cardH}
        rx={16}
        className={cn(C.paper, C.outline)}
        strokeWidth={1.8}
      />

      {/* Brass clipboard clip at the top */}
      <rect
        x={boardCenter - 22}
        y={CURVE_PLOT.cardY - 4}
        width={44}
        height={8}
        rx={4}
        className={cn(C.brass, C.outline)}
        strokeWidth={1.3}
        aria-hidden
      />

      <text x={CURVE_PLOT.cardX + 14} y={CURVE_PLOT.cardY + 20} className={cn(C.muted, "text-[12px] font-bold")}>
        Time per request
      </text>

      {/* Shaded overload band past the capacity wall */}
      <rect
        x={CURVE_PLOT.x1}
        y={CURVE_PLOT.y0 - 4}
        width={CURVE_PLOT.overloadX1 - CURVE_PLOT.x1}
        height={CURVE_PLOT.y1 - CURVE_PLOT.y0 + 4}
        rx={4}
        className={TONES.bad.softFill}
        opacity={overloaded ? 0.95 : 0.5}
      />

      {/* Soft shaded area under the curve up to the current load */}
      {curve.areaPath ? <path d={curve.areaPath} className={t.softFill} opacity={0.85} /> : null}

      {/* Baseline and capacity wall */}
      <line
        x1={CURVE_PLOT.x0}
        x2={CURVE_PLOT.overloadX1}
        y1={CURVE_PLOT.y1}
        y2={CURVE_PLOT.y1}
        className={C.mutedStroke}
        strokeOpacity={0.6}
        strokeWidth={1.6}
      />
      <line
        x1={CURVE_PLOT.x1}
        x2={CURVE_PLOT.x1}
        y1={CURVE_PLOT.y0 - 4}
        y2={CURVE_PLOT.y1}
        className={overloaded ? TONES.bad.stroke : C.mutedStroke}
        strokeOpacity={overloaded ? 0.9 : 0.6}
        strokeWidth={1.6}
        strokeDasharray="3 3.5"
      />

      {/* M/M/1 response-time knee curve */}
      <path d={curve.linePath} fill="none" className={C.curve} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />

      {/* Word axis labels (no extra numbers) */}
      <text x={CURVE_PLOT.x0} y={axisY} className={cn(C.muted, "text-[11.5px] font-medium")}>
        idle
      </text>
      <text x={(CURVE_PLOT.x0 + CURVE_PLOT.x1) / 2} y={axisY} textAnchor="middle" className={cn(C.muted, "text-[11.5px] font-semibold")}>
        busy
      </text>
      <text
        x={CURVE_PLOT.x1}
        y={axisY}
        textAnchor="end"
        className={cn(overloaded ? TONES.bad.text : C.muted, "text-[11.5px] font-semibold")}
      >
        limit
      </text>

      {/* Upward arrow when the time per request is off the top of the plot */}
      {curve.pinnedTop ? (
        <path
          d={`M${curve.dotX - 4.5} ${curve.dotY - 8.5} L${curve.dotX} ${curve.dotY - 14.5} L${curve.dotX + 4.5} ${curve.dotY - 8.5} Z`}
          className={art.solid}
        />
      ) : null}

      {/* Riding orb and Live Number 3 readout */}
      <circle cx={curve.dotX} cy={curve.dotY} r={6.5} className={cn(art.solid, C.paperStroke)} strokeWidth={2.2} />
      <text
        x={curve.labelX}
        y={curve.labelY}
        textAnchor={curve.labelAnchor}
        className={cn(t.text, C.paperHalo, "text-[12.5px] font-bold tabular-nums")}
      >
        {label}
      </text>
    </g>
  );
}

/**
 * Tactile illustrated slider track at the bottom of the stage, with word
 * labels (`few`, `students online`, `crowd`, and `full` at the capacity tick)
 * so only the 3 live numbers appear on screen. The mark label sits above the
 * handle's halo and below the floor's horizon, so neither ever crosses it.
 */
function IllustratedSliderRail({
  x0,
  x1,
  y,
  fraction,
  tone,
  marks,
}: {
  x0: number;
  x1: number;
  y: number;
  fraction: number;
  tone: Tone;
  marks: { at: number; label?: string; tone?: "warn" | "bad" }[];
}) {
  const f = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
  const hx = x0 + f * (x1 - x0);
  const X = (pos: number) => x0 + pos * (x1 - x0);
  const art = TONE_ART[tone];

  return (
    <g aria-hidden>
      {/* Recessed track groove */}
      <rect x={x0 - 4} y={y - 5} width={x1 - x0 + 8} height={10} rx={5} className={cn(C.paper, C.outline)} strokeWidth={1.6} />
      {/* Active progress fill bar */}
      <rect x={x0 - 2} y={y - 3.5} width={Math.max(6, hx - x0 + 2)} height={7} rx={3.5} className={art.solid} />

      {/* Snap tick marks */}
      {marks.map((m) => (
        <line
          key={`${m.at}-tick`}
          x1={X(m.at)}
          x2={X(m.at)}
          y1={y - 10}
          y2={y + 10}
          className={m.tone ? TONES[m.tone].stroke : C.mutedStroke}
          strokeWidth={m.tone ? 2.2 : 1.5}
          strokeLinecap="round"
        />
      ))}

      {/* End labels and the centre caption */}
      <text x={x0} y={y + 31} textAnchor="start" className={cn(C.muted, "text-[11.5px] font-semibold")}>
        few
      </text>
      <text x={(x0 + x1) / 2} y={y + 31} textAnchor="middle" className={cn(C.ink, "text-[12.5px] font-bold")}>
        students online
      </text>
      <text x={x1} y={y + 31} textAnchor="end" className={cn(C.muted, "text-[11.5px] font-semibold")}>
        crowd
      </text>

      {/* Chunky draggable handle with a soft finger-sized halo */}
      <circle cx={hx} cy={y} r={16} className={art.solid} opacity={0.2} />
      <circle cx={hx} cy={y + 2.5} r={12} className={C.shadow} opacity={0.28} />
      <circle cx={hx} cy={y} r={12} className={cn(C.paper, C.outline)} strokeWidth={2.2} />
      <circle cx={hx} cy={y} r={8.5} className={art.solid} />
      <line x1={hx - 2.5} x2={hx - 2.5} y1={y - 3.8} y2={y + 3.8} className="stroke-white" strokeWidth={1.6} strokeLinecap="round" />
      <line x1={hx + 2.5} x2={hx + 2.5} y1={y - 3.8} y2={y + 3.8} className="stroke-white" strokeWidth={1.6} strokeLinecap="round" />

      {/* Mark labels, drawn last, above the halo */}
      {marks.map((m) =>
        m.label ? (
          <text
            key={`${m.at}-label`}
            x={X(m.at)}
            y={y - 21}
            textAnchor="middle"
            className={cn(m.tone ? TONES[m.tone].text : C.muted, C.groundHalo, "text-[11.5px] font-bold")}
          >
            {m.label}
          </text>
        ) : null
      )}
    </g>
  );
}

const VERDICT_ICONS = {
  good: CircleCheck,
  warn: TriangleAlert,
  bad: CircleX,
  accent: CircleCheck,
} as const;

/**
 * Tactile top verdict ribbon with a bottom lip, status icon badge, and bold
 * verdict wording (under 38 characters).
 */
function IllustratedVerdictBanner({ width, text, tone }: { width: number; text: string; tone: Tone }) {
  const w = Math.min(width - 16, text.length * 8.2 + 52);
  const left = (width - w) / 2;
  const y = 7;
  const art = TONE_ART[tone];
  const IconCmp = VERDICT_ICONS[tone];

  return (
    <g>
      {/* Bottom lip */}
      <rect x={left} y={y + 3} width={w} height={30} rx={15} className={art.lip} />
      {/* Main banner pill */}
      <rect x={left} y={y} width={w} height={30} rx={15} className={cn(C.paper, TONES[tone].stroke)} strokeWidth={2} />
      {/* Left status icon badge */}
      <circle cx={left + 17} cy={y + 15} r={10} className={art.solid} />
      <IconCmp x={left + 10} y={y + 8} width={14} height={14} strokeWidth={2.5} className="text-white" aria-hidden />
      <text x={left + 33} y={y + 20} className={cn(C.ink, "text-[13.5px] font-bold")}>
        {text}
      </text>
    </g>
  );
}
