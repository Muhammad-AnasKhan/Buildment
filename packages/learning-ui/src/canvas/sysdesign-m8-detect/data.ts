import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 8.5 beat 1 ("Silence: dead or only slow?"). Failure detection is a guess made from silence.
export const sysdesignM8Detect: SceneSpec = {
  kind: "scene",
  title: "The followers hear nothing, and cannot tell why",
  purpose: "Followers expect a heartbeat from the leader. When it stops, they cannot tell a crashed leader from a slow network.",
  limits: "The 10 seconds is a made-up timeout. Real systems pick values from a few hundred milliseconds (Raft) to tens of seconds, and trade false alarms against waiting longer.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "leader", label: "Leader", kind: "database", sub: "alive", x: 210, y: 100 },
      { id: "f1", label: "Follower 1", kind: "database", sub: "hears beats", x: 60, y: 235 },
      { id: "f2", label: "Follower 2", kind: "database", sub: "hears beats", x: 360, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "leader", to: "f1", label: "beat" },
      { kind: "fly", at: 0.3, dur: 0.7, from: "leader", to: "f2", label: "beat" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "leader", to: "f1", label: "beat" },
      { kind: "fly", at: 1.3, dur: 0.7, from: "leader", to: "f2", label: "beat" },
      { kind: "say", at: 2.3, actor: "leader", text: "silent", tone: "warn" },
      { kind: "mark", at: 2.3, actor: "leader", tone: "warn" },
      { kind: "say", at: 2.5, actor: "f1", text: "no beat...", tone: "warn" },
      { kind: "say", at: 2.5, actor: "f2", text: "no beat...", tone: "warn" },
      { kind: "wait", at: 2.5, dur: 3, actor: "f1", label: "silent {n} s", doneLabel: "silent 10 s", total: 10 },
      { kind: "say", at: 5.5, actor: "f1", text: "leader dead?", tone: "bad" },
      { kind: "say", at: 5.5, actor: "f2", text: "leader dead?", tone: "bad" },
      { kind: "verdict", at: 5.6, text: "Dead, or only slow? Nobody knows", tone: "warn" },
    ],
    loop: 8.8,
  },
};
