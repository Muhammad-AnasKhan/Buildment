import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.5 beat 2 (The first timer to fire wins).
export const sysdesignM12ElectionAfterCrash: SceneSpec = {
  kind: "scene",
  title: "The leader crashes and the follower with the shortest timer wins",
  purpose: "S1 leads term 1 and crashes. Each follower waits a random time. S3's timer fires first, it asks for votes for term 2, and S2, S4 and S5 say yes.",
  limits: "Five servers with timers chosen inside the 150 to 300 ms range the Raft paper suggests. Messages are drawn slowly. Votes also depend on the candidate's log, which the next chapter adds.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "s1", label: "S1", kind: "server", sub: "leader, term 1", x: 60, y: 100 },
      { id: "s2", label: "S2", kind: "server", sub: "follower, t1", x: 210, y: 100 },
      { id: "s3", label: "S3", kind: "server", sub: "follower, t1", x: 360, y: 100 },
      { id: "s4", label: "S4", kind: "server", sub: "follower, t1", x: 135, y: 190 },
      { id: "s5", label: "S5", kind: "server", sub: "follower, t1", x: 285, y: 190 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "s1", to: "s2", label: "beat", tone: "good" },
      { kind: "say", at: 0.9, actor: "s1", text: "crashed", tone: "bad" },
      { kind: "mark", at: 0.9, actor: "s1", tone: "bad" },
      { kind: "say", at: 1.5, actor: "s2", text: "timer 240 ms" },
      { kind: "say", at: 1.5, actor: "s3", text: "timer 190 ms" },
      { kind: "say", at: 1.5, actor: "s4", text: "timer 270 ms" },
      { kind: "say", at: 1.5, actor: "s5", text: "timer 210 ms" },
      { kind: "say", at: 2.6, actor: "s3", text: "candidate t2", tone: "accent" },
      { kind: "mark", at: 2.6, actor: "s3", tone: "accent" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "s3", to: "s2", label: "vote me?" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "s3", to: "s4", label: "vote me?" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "s3", to: "s5", label: "vote me?" },
      { kind: "say", at: 3.9, actor: "s2", text: "voted S3", tone: "good" },
      { kind: "say", at: 3.9, actor: "s4", text: "voted S3", tone: "good" },
      { kind: "say", at: 3.9, actor: "s5", text: "voted S3", tone: "good" },
      { kind: "fly", at: 4, dur: 0.9, from: "s2", to: "s3", label: "yes", tone: "good" },
      { kind: "fly", at: 4, dur: 0.9, from: "s4", to: "s3", label: "yes", tone: "good" },
      { kind: "fly", at: 4, dur: 0.9, from: "s5", to: "s3", label: "yes", tone: "good" },
      { kind: "say", at: 5.1, actor: "s3", text: "leader, t2", tone: "good" },
      { kind: "mark", at: 5.1, actor: "s3", tone: "good" },
      { kind: "verdict", at: 5.5, text: "S3 won term 2 with 4 of 5 votes", tone: "good" },
    ],
    loop: 8.8,
  },
};
