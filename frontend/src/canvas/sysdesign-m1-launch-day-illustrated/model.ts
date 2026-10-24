import type { Tone } from "../primitives/tones";
import {
  CAPACITY_PER_SEC,
  clampStudents,
  flowDots,
  flowDotsPerSecond,
  formatCount,
  formatMs,
  launchDay,
  loadTimeLabel,
  REQUESTS_PER_STUDENT,
  serverLoad,
  SERVICE_MS,
  STUDENT_LADDER,
  STUDENT_SNAPS,
  STUDENTS,
  studentsFromFraction,
  studentsToFraction,
  timeAtBusy,
  twoFigures,
  unitHash,
  type LaunchDay,
  type Load,
} from "../models/server-load";

export {
  CAPACITY_PER_SEC,
  clampStudents,
  flowDots,
  flowDotsPerSecond,
  formatCount,
  formatMs,
  launchDay,
  loadTimeLabel,
  REQUESTS_PER_STUDENT,
  serverLoad,
  SERVICE_MS,
  STUDENT_LADDER,
  STUDENT_SNAPS,
  STUDENTS,
  studentsFromFraction,
  studentsToFraction,
  timeAtBusy,
  twoFigures,
  unitHash,
  type LaunchDay,
  type Load,
};

// Pure geometry and state calculations for the Illustrated launch day canvas.
// Every visual element (queue chute envelopes, falling timeout letters,
// server rack lights/fan/smoke, expressive student avatars, and the M/M/1
// curve board) is computed deterministically here with no React or DOM deps.
// Layout rule: every label sits in clear space, away from lines and shapes,
// so text never runs into the art.

export const VIEW_W = 420;
export const VIEW_H = 348;

export const LANE_Y = 92;
export const SRV_POS = { x: 354, y: 104, w: 114, h: 94 } as const;

/** Waiting mail chute sits directly in front of the server intake slot. */
export const TRAY = {
  x0: 198,
  x1: 292,
  y0: 72,
  y1: 112,
  headX: 281,
  colSpacing: 14,
  cols: 6,
  maxRows: 3,
} as const;

export const TRAY_CAP = TRAY.cols * TRAY.maxRows;

/** Plot coordinates for the time-per-request vs busy curve on the lower right. */
export const CURVE_PLOT = {
  cardX: 194,
  cardY: 166,
  cardW: 214,
  cardH: 100,
  x0: 212,
  x1: 368,
  overloadX1: 396,
  y0: 196,
  y1: 244,
  yMaxMs: 200,
} as const;

/** Campus courtyard bounds for the student crowd and front queue on the left. */
export const CROWD_STAGE = {
  x: 12,
  y: 48,
  w: 172,
  h: 220,
  maxFigures: 56,
  frontSlots: 7,
} as const;

export const RAIL_GEOM = {
  x0: 42,
  x1: 378,
  y: 302,
} as const;

const GROW_DOTS_PER_SEC = 4.5;
const DROP_INTERVAL = 0.45;
const DROP_DURATION = 0.95;

export type QueueSlotDot = {
  id: number;
  x: number;
  y: number;
  opacity: number;
};

export type QueueTrayState = {
  /** Number of waiting request envelopes currently inside the buffer chute. */
  count: number;
  /** True when more requests are waiting beyond the visible chute capacity. */
  more: boolean;
  /** True when the chute is packed to its visual ceiling during overload. */
  full: boolean;
  /** X position where flying paper planes enter the back of the waiting line. */
  tailX: number;
  /** Positioned envelopes inside the chute. */
  dots: QueueSlotDot[];
  /** Short status phrase above the chute (no numbers). */
  caption: string;
};

const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/** Row Y coordinate for a given row index when `totalRows` (1, 2 or 3) are active. */
function trayRowY(row: number, totalRows: number): number {
  if (totalRows <= 1) return LANE_Y;
  if (totalRows === 2) return row === 0 ? LANE_Y - 6.5 : LANE_Y + 6.5;
  return LANE_Y + (row - 1) * 10.5;
}

/**
 * Compute the waiting line of request envelopes inside the chute in front of
 * the server. Below 100% busy, the count matches the M/M/1 average `inside`
 * (up to TRAY_CAP). At or above 100% busy, the chute fills and spills over.
 */
export function computeQueueTray(
  inside: number,
  growing: boolean,
  elapsed: number,
  seconds: number,
  serviceDots: number,
  still: boolean
): QueueTrayState {
  let count = 0;
  let more = false;
  let full = false;

  if (growing) {
    count = still ? TRAY_CAP : Math.min(TRAY_CAP, 6 + Math.floor(Math.max(0, elapsed) * GROW_DOTS_PER_SEC));
    full = count >= TRAY_CAP;
    more = full;
  } else {
    const n = Number.isFinite(inside) ? Math.max(0, Math.round(inside)) : 0;
    count = Math.min(TRAY_CAP, n);
    more = n > TRAY_CAP;
    full = false;
  }

  const activeRows = count === 0 ? 1 : Math.min(TRAY.maxRows, Math.ceil(count / TRAY.cols));
  const colsUsed = count === 0 ? 0 : Math.min(TRAY.cols, count);
  const shiftFrac = count > 0 && !still ? easeInOut((((seconds * serviceDots) % 1) + 1) % 1) : 0;

  const dots: QueueSlotDot[] = [];
  const totalDrawn = count + (shiftFrac > 0 && count < TRAY_CAP ? 1 : 0);

  for (let i = 0; i < totalDrawn; i++) {
    const col = Math.floor(i / activeRows);
    const row = i % activeRows;
    if (col >= TRAY.cols) continue;
    const stepShift = row === 0 ? shiftFrac * (TRAY.colSpacing * 0.65) : shiftFrac * (TRAY.colSpacing * 0.25);
    const x = TRAY.headX - col * TRAY.colSpacing + stepShift;
    const y = trayRowY(row, activeRows);
    const opacity = i === count ? shiftFrac : i === 0 ? 1 - shiftFrac * 0.45 : 1;
    dots.push({ id: i, x, y, opacity });
  }

  const tailX = colsUsed > 0 ? Math.max(TRAY.x0 + 8, TRAY.headX - colsUsed * TRAY.colSpacing) : SRV_POS.x - SRV_POS.w / 2;
  const caption = growing ? "line overflows" : count === 0 ? "no line" : "waiting line";

  return { count, more, full, tailX, dots, caption };
}

export type TimeoutDrop = {
  id: string;
  x: number;
  y: number;
  angle: number;
  opacity: number;
};

/**
 * Timed-out requests falling out of the open trapdoor at the bottom of the
 * queue chute when the server is past 100% capacity.
 */
export function computeTimeoutDrops(growing: boolean, full: boolean, elapsed: number, still: boolean): TimeoutDrop[] {
  if (!growing || !full) return [];
  if (still) {
    return [
      { id: "still-0", x: TRAY.x0 + 30, y: TRAY.y1 + 16, angle: -14, opacity: 0.92 },
      { id: "still-1", x: TRAY.x0 + 60, y: TRAY.y1 + 24, angle: 18, opacity: 0.75 },
    ];
  }
  const fullAt = (TRAY_CAP - 6) / GROW_DOTS_PER_SEC;
  const t = elapsed - fullAt;
  if (t <= 0) {
    return [{ id: "initial-0", x: TRAY.x0 + 44, y: TRAY.y1 + 14, angle: -10, opacity: 0.88 }];
  }
  const out: TimeoutDrop[] = [];
  const latest = Math.floor(t / DROP_INTERVAL);
  for (const idx of [latest - 2, latest - 1, latest]) {
    if (idx < 0) continue;
    const age = t - idx * DROP_INTERVAL;
    if (age < 0 || age > DROP_DURATION) continue;
    const progress = age / DROP_DURATION;
    const col = Math.floor(unitHash(idx, 7) * TRAY.cols);
    const x = TRAY.headX - col * TRAY.colSpacing;
    const y = TRAY.y1 + 6 + progress * 20;
    const dir = idx % 2 === 0 ? 1 : -1;
    const angle = dir * (8 + progress * 28);
    const opacity = Math.max(0, 1 - progress * 0.88);
    out.push({ id: `drop-${idx}`, x, y, angle, opacity });
  }
  return out;
}

export type SmokePuff = {
  id: number;
  cx: number;
  cy: number;
  r: number;
  opacity: number;
};

export type ServerStrainState = {
  /** 0 to 1 fill fraction for the server's side mercury thermometer. */
  fillRatio: number;
  /** True when busy >= 0.7 (warm amber warning zone or higher). */
  strained: boolean;
  /** True when busy >= 1 (red overload zone with smoke and alarm). */
  overloaded: boolean;
  /** 0 to 1 pulse intensity for the overload siren and red glow. */
  pulse: number;
  /** 0 to 1 progress of the cooling fan rotation inside the server rack. */
  workerProgress: number;
  /** Horizontal jitter offset when the rack vibrates under heavy load. */
  shakeX: number;
  /** Blinking LED states on the rack blades. */
  leds: boolean[];
  /** Rising smoke puffs above the server vents when strained or overloaded. */
  smokePuffs: SmokePuff[];
};

export function computeServerStrain(busy: number, seconds: number, still: boolean): ServerStrainState {
  const b = Number.isFinite(busy) ? Math.max(0, busy) : 0;
  const fillRatio = Math.max(0.06, Math.min(1, b));
  const strained = b >= 0.7;
  const overloaded = b >= 1;
  const pulse = overloaded ? (still ? 0.85 : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(seconds * 7))) : strained ? 0.45 : 0;
  const workerRate = Math.min(1.2, Math.max(0.08, b)) * 2.6;
  const workerProgress = b <= 0 ? 0 : still ? 0.35 : ((seconds * workerRate) % 1 + 1) % 1;
  const shakeX = !still && overloaded ? Math.sin(seconds * 38) * 1.1 : !still && b >= 0.85 ? Math.sin(seconds * 24) * 0.45 : 0;

  const tick = still ? 1 : Math.floor(seconds * (overloaded ? 9 : strained ? 5 : 2.5));
  const leds = [0, 1, 2, 3].map((i) => (still ? i % 2 === 0 : (tick + i) % 2 === 0));

  const smokePuffs: SmokePuff[] = [];
  if (b >= 0.8) {
    // Anchored over the right half of the rack so the puffs stay clear of the
    // waiting line caption and the verdict ribbon's words.
    const anchors = [SRV_POS.x - 16, SRV_POS.x - 2, SRV_POS.x + 12, SRV_POS.x + 24];
    const count = overloaded ? 4 : 2;
    for (let i = 0; i < count; i++) {
      const phase = still ? 0.28 + i * 0.22 : ((seconds * (overloaded ? 1.35 : 0.85) + i * 0.27) % 1 + 1) % 1;
      const sway = Math.sin(phase * Math.PI * 2 + i) * 4.5;
      const cx = anchors[i] + sway;
      const cy = SRV_POS.y - SRV_POS.h / 2 - 4 - phase * (overloaded ? 14 : 10);
      const r = (overloaded ? 5 : 3.6) + phase * (overloaded ? 5 : 3);
      const intensity = overloaded ? 0.92 : (b - 0.8) / 0.2 * 0.65;
      const opacity = Math.max(0, intensity * (1 - phase * 0.85));
      smokePuffs.push({ id: i, cx, cy, r, opacity });
    }
  }

  return { fillRatio, strained, overloaded, pulse, workerProgress, shakeX, leds, smokePuffs };
}

export type StudentMood = "calm" | "waiting" | "timeout" | "left";

export type FrontStudentAvatar = {
  id: number;
  cx: number;
  cy: number;
  skinIdx: number;
  hairIdx: number;
  shirtIdx: number;
  mood: StudentMood;
  bobY: number;
};

export type BackCrowdDot = {
  id: number;
  cx: number;
  cy: number;
  skinIdx: number;
  hairIdx: number;
  shirtIdx: number;
  mood: StudentMood;
};

export type CrowdPanelState = {
  caption: string;
  captionTone: Tone | "neutral";
  frontAvatars: FrontStudentAvatar[];
  backCrowd: BackCrowdDot[];
};

/**
 * Compute the illustrated student crowd on the left campus courtyard:
 * - `frontAvatars`: up to 7 large expressive student characters standing in the
 *   visible queue line with varied hair, skin tones, and facial expressions.
 * - `backCrowd`: up to 49 background students filling the amphitheater tiers
 *   behind them as `students` scales up to 100,000.
 */
export function computeCrowdState(count: number, busy: number, seconds: number, still: boolean): CrowdPanelState {
  const total = Math.max(1, Math.min(CROWD_STAGE.maxFigures, Math.round(count)));
  const b = Number.isFinite(busy) ? Math.max(0, busy) : 0;

  const caption =
    b < 0.7
      ? "Calm: pages load fast"
      : b < 1
        ? "Impatient: pages slow"
        : "Frustrated: giving up";
  const captionTone: Tone | "neutral" = b < 0.7 ? "neutral" : b < 1 ? "warn" : "bad";

  const frontCount = Math.min(CROWD_STAGE.frontSlots, total);
  const backCount = Math.max(0, total - frontCount);

  const moodForIndex = (idx: number, isFront: boolean): StudentMood => {
    const roll = unitHash(idx, 19);
    if (b >= 1) {
      if (isFront && idx >= frontCount - 2 && frontCount >= 4) {
        return "left";
      }
      const severity = Math.min(0.92, 0.58 + Math.log10(Math.max(1, b)) * 0.25);
      if (roll < severity * 0.62) return "timeout";
      if (roll < severity) return "left";
      return "waiting";
    }
    if (b >= 0.7) {
      const waitShare = Math.min(0.88, (b - 0.65) * 2.5);
      if (roll < waitShare || (isFront && idx < 3)) return "waiting";
    }
    return "calm";
  };

  const frontAvatars: FrontStudentAvatar[] = [];
  const headX = 164;
  const spacingX = 22.5;
  const baseY = 216;

  for (let i = 0; i < frontCount; i++) {
    const cx = headX - i * spacingX;
    const archY = Math.sin((i / Math.max(1, CROWD_STAGE.frontSlots - 1)) * Math.PI) * 4;
    const mood = moodForIndex(i, true);
    const bobPhase = still ? 0 : Math.sin(seconds * (mood === "waiting" ? 6 : 3) + i * 1.1);
    const bobY = still ? 0 : bobPhase * (mood === "waiting" ? 1.4 : 0.7);

    frontAvatars.push({
      id: i,
      cx,
      cy: baseY + archY,
      skinIdx: i % 6,
      hairIdx: (i * 5 + 1) % 6,
      shirtIdx: (i * 3 + 2) % 6,
      mood,
      bobY,
    });
  }

  const backCrowd: BackCrowdDot[] = [];
  const cols = 10;
  const xStart = 24;
  const yStart = 166;
  const dx = 15.6;
  const dy = 14.5;

  for (let i = 0; i < backCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const stagger = row % 2 === 1 ? 6 : 0;
    const cx = xStart + col * dx + stagger;
    const cy = yStart - row * dy;
    const globalIdx = i + CROWD_STAGE.frontSlots;
    backCrowd.push({
      id: globalIdx,
      cx,
      cy,
      skinIdx: (globalIdx * 3) % 6,
      hairIdx: (globalIdx * 5) % 6,
      shirtIdx: (globalIdx * 7) % 6,
      mood: moodForIndex(globalIdx, false),
    });
  }

  return { caption, captionTone, frontAvatars, backCrowd };
}

export type CurveVisualState = {
  /** SVG path for the M/M/1 curve from 0% to 100% busy. */
  linePath: string;
  /** SVG closed path shading the area under the curve up to the current busy share. */
  areaPath: string;
  /** Riding dot X coordinate in viewBox units. */
  dotX: number;
  /** Riding dot Y coordinate in viewBox units. */
  dotY: number;
  /** True when the wait exceeds the plot ceiling (above 200 ms or past 100% busy). */
  pinnedTop: boolean;
  /** Label coordinates and anchor for the time-per-request readout. */
  labelX: number;
  labelY: number;
  labelAnchor: "start" | "end";
  /** Short cord the clipboard hangs from, from under the waiting chute to the clip. */
  cordPath: string;
  cordStartX: number;
  cordStartY: number;
};

/** Rough width of the live readout at 12.5px bold, for choosing its side. */
const READOUT_CHAR_W = 7.4;

const plotXForBusy = (b: number) =>
  CURVE_PLOT.x0 + Math.max(0, Math.min(1, b)) * (CURVE_PLOT.x1 - CURVE_PLOT.x0);

const plotYForMs = (ms: number) =>
  CURVE_PLOT.y1 - (Math.max(0, Math.min(CURVE_PLOT.yMaxMs, ms)) / CURVE_PLOT.yMaxMs) * (CURVE_PLOT.y1 - CURVE_PLOT.y0);

/**
 * Sample the M/M/1 curve `timeAtBusy(b)` and compute the riding dot position,
 * where its readout goes, and the cord the clipboard hangs from.
 */
export function computeCurveVisual(busy: number, labelChars = 8, steps = 100): CurveVisualState {
  const b = Number.isFinite(busy) ? Math.max(0, busy) : 0;
  const lineParts: string[] = [];
  const areaParts: string[] = [];
  const cappedBusy = Math.min(0.95, b);

  let prev: [number, number] | null = null;
  for (let i = 0; i <= steps; i++) {
    const xVal = i / steps;
    const yVal = timeAtBusy(xVal);
    if (!Number.isFinite(yVal) || yVal > CURVE_PLOT.yMaxMs) {
      if (prev && Number.isFinite(yVal)) {
        const t = (CURVE_PLOT.yMaxMs - prev[1]) / (yVal - prev[1]);
        const xEdge = prev[0] + t * (xVal - prev[0]);
        lineParts.push(`L${plotXForBusy(xEdge).toFixed(1)} ${plotYForMs(CURVE_PLOT.yMaxMs).toFixed(1)}`);
      }
      break;
    }
    const px = plotXForBusy(xVal);
    const py = plotYForMs(yVal);
    lineParts.push(`${lineParts.length ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`);
    if (xVal <= cappedBusy) {
      areaParts.push(`${areaParts.length ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    prev = [xVal, yVal];
  }

  if (cappedBusy > 0) {
    const endMs = Math.min(CURVE_PLOT.yMaxMs, timeAtBusy(cappedBusy));
    const endX = plotXForBusy(cappedBusy);
    const endY = plotYForMs(endMs);
    areaParts.push(`L${endX.toFixed(1)} ${endY.toFixed(1)}`);
    areaParts.push(`L${endX.toFixed(1)} ${CURVE_PLOT.y1.toFixed(1)}`);
    areaParts.push(`L${CURVE_PLOT.x0.toFixed(1)} ${CURVE_PLOT.y1.toFixed(1)} Z`);
  }

  let dotX: number;
  let dotY: number;
  let pinnedTop = false;

  if (b >= 1) {
    const overLog = Math.min(1, Math.log10(Math.max(1, b)) / Math.log10(50));
    dotX = CURVE_PLOT.x1 + 5 + overLog * (CURVE_PLOT.overloadX1 - CURVE_PLOT.x1 - 7);
    dotY = CURVE_PLOT.y0;
    pinnedTop = true;
  } else {
    const rawMs = timeAtBusy(b);
    pinnedTop = !Number.isFinite(rawMs) || rawMs > CURVE_PLOT.yMaxMs;
    dotX = plotXForBusy(b);
    dotY = pinnedTop ? CURVE_PLOT.y0 : plotYForMs(rawMs);
  }

  // The readout never touches the curve, the capacity wall or the red band.
  // The curve only rises to the right, so the clear space is above and to the
  // left of the dot. Past the wall the readout parks top left of the wall,
  // where the curve has not reached yet.
  let labelAnchor: "start" | "end";
  let labelX: number;
  let labelY: number;
  const nearTop = dotY < CURVE_PLOT.y0 + 16;
  if (b >= 1) {
    labelAnchor = "end";
    labelX = CURVE_PLOT.x1 - 18;
    labelY = CURVE_PLOT.y0 + 15;
  } else if (dotX - 10 - labelChars * READOUT_CHAR_W >= CURVE_PLOT.x0 + 2) {
    labelAnchor = "end";
    labelX = nearTop ? Math.min(dotX - 10, CURVE_PLOT.x1 - 22) : dotX - 10;
    labelY = nearTop ? dotY + 17 : dotY - 8;
  } else {
    labelAnchor = "start";
    labelX = dotX + 10;
    labelY = dotY - 12;
  }

  const cordStartX = TRAY.x1 - 4;
  const cordStartY = TRAY.y1 + 2;
  const clipX = CURVE_PLOT.cardX + CURVE_PLOT.cardW / 2 - 8;
  const clipY = CURVE_PLOT.cardY - 4;
  const cordPath = `M${cordStartX} ${cordStartY} C${cordStartX - 4} ${cordStartY + 22}, ${clipX} ${clipY - 24}, ${clipX} ${clipY}`;

  return {
    linePath: lineParts.join(" "),
    areaPath: areaParts.join(" "),
    dotX,
    dotY,
    pinnedTop,
    labelX,
    labelY,
    labelAnchor,
    cordPath,
    cordStartX,
    cordStartY,
  };
}
