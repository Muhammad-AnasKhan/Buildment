import { roundUp } from "../sim";
import type { Scene, SceneEvent } from "../renderers/scene/types";
import { simulateTrueTime, type TrueTimeOutcome } from "./truetime";

// The Alice, Bob and photo story as a scene, built from the TrueTime model so
// every number in the picture is the model's. Server A's clock runs fast and
// B's runs slow (the worst case); Alice posts 2 ms after she sees "done".

/** Seconds of animation per millisecond of commit wait: slow enough to watch. */
export const WAIT_SECONDS_PER_MS = 0.12;

const ACTORS = [
  { id: "alice", label: "Alice", kind: "phone" as const, sub: "online", x: 60, y: 104 },
  { id: "a", label: "Server A", kind: "server" as const, sub: "clock fast", x: 210, y: 84 },
  { id: "b", label: "Server B", kind: "server" as const, sub: "clock slow", x: 210, y: 172 },
  { id: "bob", label: "Bob", kind: "user" as const, sub: "reads feed", x: 348, y: 128 },
];

export function trueTimeOutcomeFor(epsilonMs: number, commitWait: boolean): TrueTimeOutcome {
  return simulateTrueTime({ epsilonMs, gapMs: 2, errors: "a-fast", commitWait });
}

export function buildTrueTimeScene(epsilonMs: number, commitWait: boolean): Scene {
  const o = trueTimeOutcomeFor(epsilonMs, commitWait);
  const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
  const waitSeconds = o.waitMs * WAIT_SECONDS_PER_MS;
  const stamped = 1.2;
  const doneAt = stamped + waitSeconds;
  const seesDone = doneAt + 1.0;
  const stamped2 = seesDone + 1.2;
  const readAt = stamped2 + 0.5;
  const verdictAt = readAt + 1.0;
  const broken = !o.orderCorrect;

  const events: SceneEvent[] = [
    { kind: "fly", at: 0, dur: 1.2, from: "alice", to: "a", label: "unfriend Bob" },
    { kind: "tag", at: stamped, row: 0, value: o.s1, label: `s1 ${fmt(o.s1)}` },
    { kind: "say", at: stamped, actor: "a", text: "stamped s1" },
    { kind: "fly", at: doneAt, dur: 1.0, from: "a", to: "alice", label: "done", tone: "warn" },
    { kind: "say", at: seesDone, actor: "alice", text: "sees done", tone: "warn" },
    { kind: "fly", at: seesDone, dur: 1.2, from: "alice", to: "b", label: "post photo" },
    { kind: "tag", at: stamped2, row: 1, value: o.s2, label: `s2 ${fmt(o.s2)}` },
    { kind: "say", at: stamped2, actor: "b", text: "stamped s2" },
    // Bob reads his feed from a snapshot between the two timestamps.
    { kind: "fly", at: readAt, dur: 1.0, from: "bob", to: "b", label: "read feed" },
  ];
  if (commitWait) {
    events.push({ kind: "wait", at: stamped, dur: waitSeconds, actor: "a", label: "waiting {n} ms", doneLabel: `waited ${fmt(o.waitMs)} ms`, total: o.waitMs });
  }
  if (broken) {
    // A snapshot between the two timestamps holds the photo but not the unfriend.
    events.push(
      { kind: "line", at: verdictAt, value: (o.s1 + o.s2) / 2, label: "Bob reads here" },
      { kind: "retone", at: verdictAt, label: `s2 ${fmt(o.s2)}`, tone: "bad" },
      { kind: "mark", at: verdictAt, actor: "bob", tone: "bad" },
      { kind: "say", at: verdictAt, actor: "bob", text: "sees the photo!", tone: "bad" },
      { kind: "verdict", at: verdictAt, text: "Photo stamped before the unfriend", tone: "bad" }
    );
  } else {
    events.push(
      { kind: "retone", at: verdictAt, label: `s2 ${fmt(o.s2)}`, tone: "good" },
      { kind: "mark", at: verdictAt, actor: "bob", tone: "good" },
      { kind: "say", at: verdictAt, actor: "bob", text: "photo hidden", tone: "good" },
      { kind: "verdict", at: verdictAt, text: "Order is safe: s1 < s2", tone: "good" }
    );
  }

  return {
    width: 420,
    height: 340,
    actors: ACTORS,
    strip: { y: 306, from: 10, to: roundUp(Math.max(o.s1, o.s2) + 4, 10), unit: "ms", caption: "timestamps", every: 10 },
    events,
    loop: verdictAt + 3.2,
  };
}
