import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// 6.5 beat 4: a keepalive is a small packet sent on purpose before a NAT row's
// idle timer runs out. Each one resets the timer. In this model the idle
// timeout starts at 300 s and the keepalive interval at 120 s, both made up for
// teaching; the learner can move both. The 350 s default of one cloud NAT
// gateway [S51] and the UDP guidance, a timer of at least two minutes and five
// recommended [S18], give real reference points. The row survives when the
// interval is below the timeout; at an interval equal to or above the timeout
// the row is deleted between keepalives (the same boundary as 6.6: gone at
// exactly the timeout). Each keepalive that finds no row makes a new one, so
// with a slow interval the server can reach the phone only for the timeout's
// share of every interval. One hour of quiet is assumed. This slider stands in
// for the planned [timeline] model. The renderer is the slider in
// renderers/slider/.

/** The hour the model looks at, in seconds. */
const HOUR_SECONDS = 3600;

export type KeepaliveInputs = {
  /** Seconds between keepalives. */
  interval: number;
  /** The router's idle timeout in seconds. */
  timeout: number;
};

export type KeepaliveResult = {
  /** True when the interval is below the timeout, so the row never expires. */
  safe: boolean;
  /** Keepalives sent in one hour. */
  perHour: number;
  /** Share of the hour in which the server can reach the phone, 0 to 100. */
  reachablePercent: number;
};

export function keepalive({ interval, timeout }: KeepaliveInputs): KeepaliveResult {
  const safe = interval < timeout;
  return {
    safe,
    perHour: Math.floor(HOUR_SECONDS / interval),
    reachablePercent: safe ? 100 : Math.round((timeout / interval) * 100),
  };
}

function inputsFrom(values: SliderValues): KeepaliveInputs {
  const interval = values.interval;
  const timeout = values.timeout;
  return {
    interval: typeof interval === "number" && Number.isFinite(interval) && interval > 0 ? interval : 120,
    timeout: typeof timeout === "number" && Number.isFinite(timeout) && timeout > 0 ? timeout : 300,
  };
}

export function computeKeepalive(values: SliderValues): SliderResult {
  const inputs = inputsFrom(values);
  const r = keepalive(inputs);
  return {
    stats: [
      r.safe
        ? { label: "The row", value: "never expires", detail: `a keepalive every ${inputs.interval} s beats the ${inputs.timeout} s timer` }
        : { label: "The row", value: "expires", detail: `${inputs.timeout} s of silence comes before the next keepalive` },
      { label: "Server can reach the phone", value: `${r.reachablePercent}%`, detail: r.safe ? "all of the hour" : "of each interval" },
      { label: "Keepalives in one hour", value: String(r.perHour), detail: "small packets, but they cost data" },
    ],
    bars: [
      { label: "Keepalive every", value: inputs.interval, display: `${inputs.interval} s`, tone: r.safe ? "good" : "bad" },
      { label: "Idle timeout (model)", value: inputs.timeout, display: `${inputs.timeout} s` },
    ],
    barMax: 600,
    summary: r.safe
      ? `A keepalive every ${inputs.interval} seconds comes before the ${inputs.timeout} second timeout, so the row never expires and the server can always reach the phone. That is ${r.perHour} keepalives in an hour.`
      : `A keepalive every ${inputs.interval} seconds is not below the ${inputs.timeout} second timeout, so the row expires between keepalives. The server can reach the phone only about ${r.reachablePercent} percent of the time.`,
  };
}

export function describeKeepaliveChange(before: SliderValues, after: SliderValues): string {
  const a = inputsFrom(before);
  const b = inputsFrom(after);
  const x = keepalive(a);
  const y = keepalive(b);
  const changed: string[] = [];
  if (a.interval !== b.interval) changed.push(`the keepalive interval went from ${a.interval} s to ${b.interval} s`);
  if (a.timeout !== b.timeout) changed.push(`the timeout went from ${a.timeout} s to ${b.timeout} s`);
  if (changed.length === 0) return "Nothing changed.";
  const said = changed.join(" and ");
  const head = `${said.charAt(0).toUpperCase()}${said.slice(1)}.`;
  if (x.safe && !y.safe) return `${head} The interval is now not below the timeout, so the row expires between keepalives.`;
  if (!x.safe && y.safe) return `${head} The interval is now below the timeout, so the row never expires.`;
  if (y.safe) return `${head} The row still never expires. It costs ${y.perHour} keepalives an hour.`;
  return `${head} The row still expires between keepalives, and the server can reach the phone about ${y.reachablePercent} percent of the time.`;
}

export const netM6NatKeepalive = {
  kind: "slider",
  title: "Keepalives reset the timer",
  purpose: "Set the keepalive interval and the idle timeout and see whether the NAT row survives the hour.",
  intro:
    "The model's idle timeout is 300 s and the app sends a keepalive every 120 s. Predict whether the row survives, then raise the interval until it does not. Then set the timeout to 350 s, the figure one cloud NAT gateway uses, and find a safe interval.",
  inputs: [
    { id: "interval", label: "Keepalive every", min: 10, max: 600, step: 10, default: 120, unit: "s" },
    { id: "timeout", label: "Idle timeout", min: 120, max: 600, step: 10, default: 300, unit: "s" },
  ],
  compute: computeKeepalive,
  describeChange: describeKeepaliveChange,
  barsTitle: "Keepalive interval against the timeout",
  tryThis: [
    "Raise the keepalive interval from 120 s to 300 s with the timeout at 300 s. The interval is no longer below the timeout, so the row expires between keepalives.",
    "Set the timeout to 350 s. A keepalive every 300 s is safe, and one every 350 s is not.",
  ],
  limits:
    "A model with one row, an idle timeout you can move and an hour of quiet, made up for teaching. A real router's timer is different: a UDP timer must not be under two minutes and five minutes or more is recommended [S18], and one cloud NAT gateway uses 350 seconds and advises keepalives below that [S51]. The model assumes that a keepalive which finds no row makes a new one, which is why the server can reach the phone for part of each interval. A new row may get a different outside port on a real router.",
} satisfies SliderSpec;
