import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// Steady Hearts course, chapter 2.3 "Tie it and trust".
// Khalil's interview is on Thursday at 10:00 and lasts 60 minutes; he wants
// 15 minutes before it to test the call, so he needs 75 minutes of laptop
// power. A full battery lasts about 3 hours (180 minutes) on a video call,
// which he timed. His uncle lends him a power bank, charged from the shop's
// solar panel, that adds about 30 or 60 minutes. Grid power during the call
// cannot be planned this week. If the battery and the power bank together
// fall short, the backup is to take the call from his uncle's shop, which has
// solar power. All numbers are this example's own. See spec.md.

export const CALL_MINUTES = 60;
export const CHECK_MINUTES = 15;
export const NEEDED_MINUTES = CALL_MINUTES + CHECK_MINUTES;
/** Minutes a full laptop battery lasts on a video call, in this example. */
export const FULL_BATTERY_MINUTES = 180;

export type PowerStatus = "battery" | "bank" | "short";

export type PowerPlan = {
  /** Laptop charge at 10:00, 0 to 100. */
  charge: number;
  /** Minutes the power bank adds. */
  bank: number;
  /** Minutes of grid power during the 75-minute window. */
  grid: number;
  /** Minutes the battery lasts at this charge. */
  batteryMinutes: number;
  /** Minutes that must come from Khalil's own power (battery and bank). */
  needed: number;
  /** Battery and power bank together. */
  own: number;
  /** Own power minus what is needed. Negative when the plan falls short. */
  spare: number;
  /** Minutes short, 0 when covered. */
  short: number;
  status: PowerStatus;
};

function count(value: unknown, fallback: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(0, value));
}

export function powerPlan(values: SliderValues): PowerPlan {
  const charge = count(values.charge, 40, 100);
  const bank = count(values.bank, 0, 60);
  const grid = count(values.grid, 0, NEEDED_MINUTES);
  const batteryMinutes = Math.round((charge / 100) * FULL_BATTERY_MINUTES);
  const needed = NEEDED_MINUTES - grid;
  const own = batteryMinutes + bank;
  const spare = own - needed;
  const status: PowerStatus = batteryMinutes >= needed ? "battery" : own >= needed ? "bank" : "short";
  return { charge, bank, grid, batteryMinutes, needed, own, spare, short: Math.max(0, -spare), status };
}

const minutes = (value: number) => `${Math.round(value)} min`;

function statusText(plan: PowerPlan): { value: string; detail: string } {
  if (plan.status === "battery") return { value: "Covered", detail: `by the battery alone, ${minutes(plan.batteryMinutes - plan.needed)} to spare` };
  if (plan.status === "bank") return { value: "Covered", detail: `only with the power bank, ${minutes(plan.spare)} to spare` };
  return { value: `Short by ${minutes(plan.short)}`, detail: "backup: take the call from the uncle's shop" };
}

function computePowerPlan(values: SliderValues): SliderResult {
  const plan = powerPlan(values);
  const status = statusText(plan);
  const neededDetail =
    plan.grid > 0 ? `75 min, minus ${minutes(plan.grid)} of grid power` : "60-min call plus a 15-min check";
  return {
    stats: [
      { label: "Needed from your own power", value: minutes(plan.needed), detail: neededDetail },
      { label: "Battery and power bank", value: minutes(plan.own), detail: `battery ${minutes(plan.batteryMinutes)}, power bank ${minutes(plan.bank)}` },
      { label: "Plan status", value: status.value, detail: status.detail },
    ],
    bars: [
      { label: "Needed", value: plan.needed, display: minutes(plan.needed) },
      { label: "Battery", value: plan.batteryMinutes, display: minutes(plan.batteryMinutes) },
      { label: "Power bank", value: plan.bank, display: minutes(plan.bank) },
      { label: "Battery and bank", value: plan.own, display: minutes(plan.own), tone: plan.status === "short" ? "bad" : "good" },
    ],
    barMax: FULL_BATTERY_MINUTES + 60,
    summary:
      plan.status === "short"
        ? `With the laptop at ${plan.charge}%, Khalil has ${minutes(plan.own)} of his own power but needs ${minutes(plan.needed)}, so he is ${minutes(plan.short)} short and should use the backup: the call from his uncle's shop.`
        : `With the laptop at ${plan.charge}%, Khalil has ${minutes(plan.own)} of his own power and needs ${minutes(plan.needed)}, so the call is covered ${plan.status === "battery" ? "by the battery alone" : "with the power bank"}.`,
  };
}

/** "What changed": which input moved, and what it did to the plan. */
export function describePowerPlanChange(before: SliderValues, after: SliderValues): string {
  const a = powerPlan(before);
  const b = powerPlan(after);
  const moved = [a.charge !== b.charge, a.bank !== b.bank, a.grid !== b.grid].filter(Boolean).length;
  if (moved === 0) return "Nothing changed: the same power, the same plan.";
  const now = statusText(b);
  const result = b.status === "short" ? `The plan is now ${now.value.toLowerCase()}, so the backup is needed.` : `The plan is now covered ${now.detail}.`;
  if (moved > 1) return `Several things changed. Own power went from ${minutes(a.own)} to ${minutes(b.own)}, against ${minutes(b.needed)} needed. ${result}`;
  if (a.charge !== b.charge) {
    return `Changing the charge from ${a.charge}% to ${b.charge}% changed the battery from ${minutes(a.batteryMinutes)} to ${minutes(b.batteryMinutes)}. ${result}`;
  }
  if (a.bank !== b.bank) {
    return `Changing the power bank from ${minutes(a.bank)} to ${minutes(b.bank)} changed own power from ${minutes(a.own)} to ${minutes(b.own)}. ${result}`;
  }
  return `Changing grid power in the call from ${minutes(a.grid)} to ${minutes(b.grid)} changed what is needed from ${minutes(a.needed)} to ${minutes(b.needed)}. ${result} But this week nobody knows the grid schedule, so a plan that needs grid power has no backup.`;
}

export const interviewPowerPlan: SliderSpec = {
  kind: "slider",
  title: "Will the power cover Khalil's interview?",
  purpose: "Count the minutes of power Khalil needs and has, and see when the backup plan is needed.",
  intro:
    "Khalil's interview is on Thursday at 10:00 and lasts 60 minutes. He wants 15 minutes before it to test the call, so he needs 75 minutes of laptop power. A full battery lasts about 3 hours (180 minutes) on a video call. His uncle can lend him a power bank, charged from the shop's solar panel. Nobody knows whether the grid will be on. Before you move anything, predict: at 40% charge, does the battery cover the 75 minutes?",
  inputs: [
    { id: "charge", label: "Laptop charge at 10:00", min: 0, max: 100, step: 10, default: 40, unit: "%" },
    { id: "bank", label: "Power bank", min: 0, max: 60, step: 30, default: 0, unit: "min" },
    { id: "grid", label: "Grid power during the call", min: 0, max: 75, step: 15, default: 0, unit: "min" },
  ],
  compute: computePowerPlan,
  describeChange: describePowerPlanChange,
  barsTitle: "Minutes of power for the call",
  tryThis: [
    "Check your prediction first: at 40%, the battery gives 72 minutes, so it is 3 minutes short of the 75 needed.",
    "Add the power bank at 30 minutes. The call is covered with 27 minutes to spare.",
    "Set the charge to 50% with no power bank. The battery alone covers it, with 15 minutes to spare.",
    "Set the grid to 75 minutes. The plan looks safe, but nobody knows the grid schedule this week. Set it back to 0 and plan without it.",
  ],
  limits:
    "The numbers are this example's own. Real batteries do not drain evenly: an older battery or a bright screen uses power faster, so a careful plan keeps some minutes to spare. The model counts laptop power only; the phone that shares the internet also needs charge and data, and the chapter's plan covers those separately.",
};
