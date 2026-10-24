// 19.4 beat 2: down the ladder from backup and restore to active-active,
// downtime and lost writes fall and cost rises; active-active removes the
// failover step and adds write conflicts. All step durations, the write rate
// and the costs are made-up course numbers. The order of the rungs comes from
// the AWS disaster recovery guide.

export type RungId = "backup" | "pilot" | "warm" | "active";
export type StepId = "decide" | "rebuild" | "restore" | "promote" | "start" | "switch";
export type StepTone = "accent" | "warn" | "good" | "neutral";

export const DECIDE_MIN = 10;
export const REBUILD_MIN = 30;
export const RESTORE_MIN = 67;
export const PROMOTE_MIN = 1;
export const START_MIN = 10;
/** Health check 30 s x 3 failures plus a 60 s DNS cache: 150 s. */
export const SWITCH_MIN = 2.5;
export const WRITES_PER_S = 300;
export const COPY_LAG_S = 1;

export type Step = { id: StepId; label: string; minutes: number; tone: StepTone };

const STEP: Record<StepId, Step> = {
  decide: { id: "decide", label: "decide", minutes: DECIDE_MIN, tone: "neutral" },
  rebuild: { id: "rebuild", label: "rebuild", minutes: REBUILD_MIN, tone: "accent" },
  restore: { id: "restore", label: "restore", minutes: RESTORE_MIN, tone: "warn" },
  promote: { id: "promote", label: "promote", minutes: PROMOTE_MIN, tone: "good" },
  start: { id: "start", label: "start app", minutes: START_MIN, tone: "accent" },
  switch: { id: "switch", label: "move users", minutes: SWITCH_MIN, tone: "neutral" },
};

/** What runs in Region B before anything fails. */
export type DataState = "backups" | "live copy";
export type AppState = "none" | "off" | "small" | "full";

export type Rung = {
  id: RungId;
  name: string;
  /** Two short lines for the ladder labels. */
  lines: [string, string];
  steps: Step[];
  /** Cost in regions' worth. */
  cost: number;
  data: DataState;
  app: AppState;
  /** Writes lost: a number, or "an hour" for hourly backups. */
  lost: number | "hour";
  /** Share of users that live in Region A (the rest are already in Region B). */
  shareOnA: number;
};

const ids = (list: StepId[]) => list.map((id) => STEP[id]);

export const RUNGS: readonly Rung[] = [
  { id: "backup", name: "Backup and restore", lines: ["Backup", "and restore"], steps: ids(["decide", "rebuild", "restore", "switch"]), cost: 1.1, data: "backups", app: "none", lost: "hour", shareOnA: 1 },
  { id: "pilot", name: "Pilot light", lines: ["Pilot", "light"], steps: ids(["decide", "promote", "start", "switch"]), cost: 1.2, data: "live copy", app: "off", lost: WRITES_PER_S * COPY_LAG_S, shareOnA: 1 },
  { id: "warm", name: "Warm standby", lines: ["Warm", "standby"], steps: ids(["decide", "promote", "switch"]), cost: 1.5, data: "live copy", app: "small", lost: WRITES_PER_S * COPY_LAG_S, shareOnA: 1 },
  { id: "active", name: "Active-active", lines: ["Active-", "active"], steps: ids(["switch"]), cost: 2.0, data: "live copy", app: "full", lost: (WRITES_PER_S * COPY_LAG_S) / 2, shareOnA: 0.5 },
];

export const DEFAULT_RUNG = 2;
export const COST_MAX = 2;
export const STEP_SCALE_MAX = 110;

export const rungAt = (index: number): Rung => RUNGS[Math.max(0, Math.min(RUNGS.length - 1, Math.round(index)))];

/** Minutes the users on Region A are down. */
export const downMinutes = (rung: Rung) => rung.steps.reduce((sum, s) => sum + s.minutes, 0);

/** "about 110" style whole minutes (half minutes round up). */
export const roundedDown = (rung: Rung) => Math.round(downMinutes(rung));

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(rung: Rung, failed: boolean): Verdict {
  if (!failed) return { text: "Pick a plan, then fail Region A", tone: "accent" };
  const mins = roundedDown(rung);
  switch (rung.id) {
    case "backup":
      return { text: `Down about ${mins} min; up to 1 h lost`, tone: "bad" };
    case "pilot":
      return { text: `Down about ${mins} min; 300 writes lost`, tone: "warn" };
    case "warm":
      return { text: `Down about ${mins} min; 300 writes lost`, tone: "warn" };
    default:
      return { text: `A's users back in ${mins} min; 150 at risk`, tone: "warn" };
  }
}

/** The chip under the cards once Region A has failed. */
export function lostText(rung: Rung): string {
  if (rung.lost === "hour") return "writes lost: up to 1 h";
  return rung.id === "active" ? `writes at risk: ${rung.lost}` : `writes lost: ${rung.lost}`;
}

export const costText = (rung: Rung) => `cost ${rung.cost.toFixed(1)} x one region`;

/** The users (0 to 11) that start in Region A. */
export const USERS = 12;
export const usersOnA = (rung: Rung) => Math.round(USERS * rung.shareOnA);
