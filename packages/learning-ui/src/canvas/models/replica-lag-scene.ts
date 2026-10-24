import type { Scene, SceneEvent } from "../renderers/scene/types";
import { LAG_DEFAULTS, simulateLag, type LagRead, type Routing } from "./replica-lag";

// Amna's comment story as a scene, built from the replica lag model so the
// order of events matches it: replica 1 catches up at 150 ms, replica 2 at
// 600 ms, and Amna refreshes at 200, 350 and 500 ms. Model time is slowed so
// a learner can follow each message.

const T = (ms: number) => 0.6 + ms * 0.008;
const FLY = 0.6;

export function buildLagScene(routing: Routing): Scene {
  const o = simulateLag({ ...LAG_DEFAULTS, routing });
  const actors = [
    { id: "amna", label: "Amna", kind: "phone" as const, sub: "posting", x: 60, y: 164 },
    { id: "leader", label: "Leader", kind: "database" as const, sub: "takes writes", x: 214, y: 82 },
    { id: "r1", label: "Replica 1", kind: "database" as const, sub: `${o.fastLagMs} ms behind`, x: 358, y: 150 },
    { id: "r2", label: "Replica 2", kind: "database" as const, sub: `${o.slowLagMs} ms behind`, x: 358, y: 244 },
  ];

  const events: SceneEvent[] = [
    { kind: "fly", at: 0, dur: FLY, from: "amna", to: "leader", label: "post comment" },
    { kind: "say", at: FLY, actor: "leader", text: "comment saved", tone: "good" },
    // Copies leave the leader together; replica 2's copy crawls because it lags.
    { kind: "fly", at: FLY, dur: T(o.fastLagMs) - FLY, from: "leader", to: "r1", label: "copy" },
    { kind: "fly", at: FLY, dur: T(o.slowLagMs) - FLY, from: "leader", to: "r2", label: "copy" },
    { kind: "say", at: T(o.fastLagMs), actor: "r1", text: "has comment", tone: "good" },
    { kind: "say", at: T(o.slowLagMs), actor: "r2", text: "has comment", tone: "good" },
  ];

  const tokenLabel = routing === "token" ? " (pos 1)" : "";
  let missedBefore = false;
  o.reads.forEach((read: LagRead, i) => {
    const n = i + 1;
    const start = T(read.at) - FLY;
    events.push({ kind: "fly", at: start, dur: FLY, from: "amna", to: read.target, label: `refresh ${n}${tokenLabel}` });
    if (!read.saw) events.push({ kind: "say", at: T(read.at), actor: read.target, text: "no comment yet", tone: "bad" });
    events.push({ kind: "fly", at: T(read.at), dur: FLY, from: read.target, to: "amna", label: read.saw ? "shows it" : "missing", tone: read.saw ? "good" : "bad" });
    const text = read.saw ? (missedBefore ? "it's back" : "sees comment") : read.brokeMonotonic ? "comment gone!" : "can't see it";
    if (!read.saw) missedBefore = true;
    events.push({ kind: "say", at: T(read.at) + FLY, actor: "amna", text, tone: read.saw ? "good" : "bad" });
  });

  const end = Math.max(T(o.slowLagMs), T(o.reads[o.reads.length - 1].at) + FLY) + 0.3;
  if (routing === "leader") {
    events.push({ kind: "say", at: end, actor: "leader", text: `served ${o.leaderReads} of 3`, tone: "warn" });
    events.push({ kind: "mark", at: end, actor: "leader", tone: "warn" });
  }
  events.push({ kind: "verdict", at: end, ...verdictFor(routing, o.missedOwnWrite, o.wentBackInTime, o.leaderReads) });

  return { width: 420, height: 280, actors, events, loop: end + 3.2 };
}

function verdictFor(routing: Routing, missed: number, back: number, leaderReads: number) {
  if (missed > 0 && back > 0) return { text: "Her comment vanished, then came back", tone: "bad" as const };
  if (missed > 0) return { text: `Missed her comment ${missed} of 3 times`, tone: "bad" as const };
  if (routing === "leader") return { text: `Always there; leader served ${leaderReads} of 3`, tone: "warn" as const };
  return { text: "Always there; reads stay on replicas", tone: "good" as const };
}
