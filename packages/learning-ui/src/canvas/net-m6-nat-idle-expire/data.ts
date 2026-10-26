import type { SliderResult, SliderSpec, SliderValues } from "../renderers/slider/types";

// 6.5 beat 3: a NAT row has an idle timer. In this model the idle timeout is
// 300 s (5 minutes), a number made up for teaching and labelled as such; real
// timers differ: a UDP timer must not be under two minutes and five minutes or
// more is recommended [S18], and one cloud NAT gateway uses 350 seconds [S51].
// A row lives while the quiet time (seconds with no packet through it) is below
// the timeout, and it is deleted at exactly the timeout, the same boundary as
// the code exercise in 6.6. A message from the server needs a live row: with no
// row the router cannot deliver it, so it is stopped at the router. The
// learner drags the quiet time from 0 seconds to one hour. This slider stands
// in for the planned [timeline] model. The renderer is the slider in
// renderers/slider/.

/** The model's idle timeout in seconds. Made up for teaching. */
const IDLE_TIMEOUT_SECONDS = 300;

export type IdleState = {
  /** Seconds with no packet through the row. */
  quiet: number;
  /** True while the row still exists. */
  alive: boolean;
  /** Seconds left on the timer, 0 once the row is gone. */
  secondsLeft: number;
};

/** The row is alive while the quiet time is under the timeout; at exactly the timeout it is gone. */
export function idleState(quiet: number, timeout: number = IDLE_TIMEOUT_SECONDS): IdleState {
  const alive = quiet < timeout;
  return { quiet, alive, secondsLeft: alive ? timeout - quiet : 0 };
}

/** 0 s, 45 s, 5 min, 4 min 30 s, 1 h. */
export function formatQuiet(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0) parts.push(`${s} s`);
  return parts.join(" ");
}

function quietFrom(values: SliderValues): number {
  const q = values.quiet;
  return typeof q === "number" && Number.isFinite(q) ? q : 3600;
}

export function computeIdle(values: SliderValues): SliderResult {
  const state = idleState(quietFrom(values));
  const quiet = formatQuiet(state.quiet);
  return {
    stats: [
      { label: "Quiet time", value: quiet, detail: "no packet through the row" },
      state.alive
        ? { label: "The row", value: "still there", detail: `${state.secondsLeft} s left on the timer` }
        : { label: "The row", value: "deleted", detail: `${IDLE_TIMEOUT_SECONDS} s with no packet` },
      state.alive
        ? { label: "A message from the server", value: "gets through", detail: "the row sends it to the phone" }
        : { label: "A message from the server", value: "is stopped", detail: "no row, nowhere to send it" },
    ],
    bars: [
      { label: "Quiet time", value: state.quiet, display: quiet, tone: state.alive ? "good" : "bad" },
      { label: "Idle timeout (model)", value: IDLE_TIMEOUT_SECONDS, display: `${formatQuiet(IDLE_TIMEOUT_SECONDS)} (${IDLE_TIMEOUT_SECONDS} s)` },
    ],
    barMax: 3600,
    summary: state.alive
      ? `After ${quiet} of silence the row has ${state.secondsLeft} seconds left, so a message from the server still reaches the phone.`
      : `After ${quiet} of silence the row is gone, because the model's idle timeout is ${IDLE_TIMEOUT_SECONDS} seconds. A message from the server is stopped at the router.`,
  };
}

export function describeIdleChange(before: SliderValues, after: SliderValues): string {
  const a = idleState(quietFrom(before));
  const b = idleState(quietFrom(after));
  if (a.quiet === b.quiet) return "Nothing changed.";
  const move = `The quiet time went from ${formatQuiet(a.quiet)} to ${formatQuiet(b.quiet)}.`;
  if (a.alive && !b.alive) return `${move} It reached the ${IDLE_TIMEOUT_SECONDS} second timeout, so the row was deleted and a message would now be stopped.`;
  if (!a.alive && b.alive) return `${move} It is back under the timeout, so the row is still there and a message gets through.`;
  if (b.alive) return `${move} The row is still there, with ${b.secondsLeft} seconds left.`;
  return `${move} The row was already gone, so a message is still stopped.`;
}

export const netM6NatIdleExpire = {
  kind: "slider",
  title: "Quiet for an hour: the row is gone",
  purpose: "Drag the quiet time and see when the router deletes the NAT row, and what happens to a message from the server.",
  intro:
    "A chat app has been quiet for an hour, and the router's idle timeout in this model is 5 minutes (300 s). Predict what happens to a message from the server, then drag the quiet time down to find where the row survives.",
  inputs: [{ id: "quiet", label: "Quiet time", min: 0, max: 3600, step: 30, default: 3600, unit: "s" }],
  compute: computeIdle,
  describeChange: describeIdleChange,
  barsTitle: "Quiet time against the timeout",
  tryThis: [
    "Drag the quiet time down to 270 s. The row has 30 s left, so the message gets through.",
    "Drag it to 300 s. The row is deleted exactly at the timeout, so the message is stopped.",
  ],
  limits:
    "A model with one row and an idle timeout of 300 s, made up for teaching. A real router's timer is different: a UDP timer must not be under two minutes and five minutes or more is recommended [S18], and one cloud NAT gateway uses 350 seconds [S51]. Whether a router drops the message or answers with a reset also depends on the router.",
} satisfies SliderSpec;
