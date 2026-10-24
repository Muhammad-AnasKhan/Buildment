import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.6 beat 2 (A global write waits for the nearest other copy). Leader in EU West, copies in NA East and NA West; two of three must have it.
export const sysdesignM19GlobalCommit: SceneSpec = {
  kind: "scene",
  title: "A write waits for the nearest other region",
  purpose: "The leader is in EU West, with copies in North America East and North America West. It says ok when two of the three have the write: itself and whichever copy answers first.",
  limits: "Three copies and a majority of two, as in module 12. The 80 ms is the round trip between EU West and North America East from the course's latency table. The North America West answer is shown as slower, and its number is not needed.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "user", label: "Customer", kind: "phone", sub: "in EU West", x: 62, y: 100 },
      { id: "leader", label: "EU West", kind: "database", sub: "leader", x: 62, y: 205 },
      { id: "east", label: "NA East", kind: "database", sub: "copy", x: 358, y: 100 },
      { id: "west", label: "NA West", kind: "database", sub: "copy", x: 358, y: 215 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "user", to: "leader", label: "save order" },
      { kind: "wait", at: 1, dur: 2.4, actor: "leader", label: "waiting {n} ms", doneLabel: "ok after 80 ms", total: 80 },
      { kind: "fly", at: 1, dur: 1.2, from: "leader", to: "east", label: "write" },
      { kind: "fly", at: 1, dur: 1.9, from: "leader", to: "west", label: "write" },
      { kind: "say", at: 2.2, actor: "east", text: "has it", tone: "good" },
      { kind: "fly", at: 2.2, dur: 1.2, from: "east", to: "leader", label: "ack", tone: "good" },
      { kind: "say", at: 3.4, actor: "leader", text: "2 of 3 have it", tone: "good" },
      { kind: "fly", at: 3.5, dur: 0.8, from: "leader", to: "user", label: "ok", tone: "good" },
      { kind: "say", at: 2.9, actor: "west", text: "has it", tone: "good" },
      { kind: "verdict", at: 4.4, text: "OK after the nearest copy answers", tone: "accent" },
    ],
    loop: 7.4,
  },
};
