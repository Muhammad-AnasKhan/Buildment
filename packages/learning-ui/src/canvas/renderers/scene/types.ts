import type { Tone } from "../../primitives/tones";

// A scene is a short animated story: actors (servers, phones, users) placed
// on a narrow canvas, and timed events that move messages between them,
// change what an actor says, put timestamps on a strip, run a wait, and end
// on a verdict. It is data; sceneFrame() turns it into a picture at time t.
// Times are in seconds of the loop; positions are viewBox units.

/** What an actor is, which picks its icon. */
export type ActorKind = "user" | "phone" | "server" | "database" | "router" | "cache" | "queue" | "cdn" | "clock" | "worker" | "note";

export type SceneActor = {
  id: string;
  label: string;
  /** Picks the icon; defaults to "server". */
  kind?: ActorKind;
  /** The small second line: "clock fast", "has comment". Events can change it. */
  sub?: string;
  x: number;
  y: number;
};

/** A labelled axis along the bottom: timestamps, log positions, milliseconds. */
export type SceneStrip = {
  y: number;
  from: number;
  to: number;
  unit: string;
  caption: string;
  /** Tick spacing in strip units. */
  every: number;
};

export type SceneEvent =
  /** A message dot travels from one actor to another. */
  | { kind: "fly"; at: number; dur: number; from: string; to: string; label: string; tone?: Tone }
  /** An actor's second line changes, optionally coloured. */
  | { kind: "say"; at: number; actor: string; text: string; tone?: Tone }
  /** A ring around an actor, for "this is the one that matters". */
  | { kind: "mark"; at: number; actor: string; tone: Tone }
  /** A tag on the strip (row 0 is the upper row) with a tick down to its value. */
  | { kind: "tag"; at: number; row: 0 | 1; value: number; label: string; tone?: Tone }
  /** A tag already on the strip changes colour (matched by label). */
  | { kind: "retone"; at: number; label: string; tone: Tone }
  /** A dashed line across the strip at a value, with a caption. */
  | { kind: "line"; at: number; value: number; label: string }
  /**
   * A ring next to an actor fills over `dur` seconds while the actor waits.
   * "{n}" in the label counts up from 0 to `total` (for example milliseconds).
   */
  | { kind: "wait"; at: number; dur: number; actor: string; label: string; doneLabel: string; total?: number }
  /** A sentence across the top of the picture: what just happened. */
  | { kind: "verdict"; at: number; text: string; tone: Tone };

export type Scene = {
  /** viewBox width and height. Keep the width near 420 so labels read on a phone. */
  width: number;
  height: number;
  actors: SceneActor[];
  strip?: SceneStrip;
  events: SceneEvent[];
  /** Length of one loop in seconds, including a pause at the end. */
  loop: number;
};
