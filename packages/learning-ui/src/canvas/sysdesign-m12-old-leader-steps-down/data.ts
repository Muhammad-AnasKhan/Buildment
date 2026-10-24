import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.5 beat 4 (A larger term wins).
export const sysdesignM12OldLeaderStepsDown: SceneSpec = {
  kind: "scene",
  title: "An old leader sees a larger term and steps down at once",
  purpose: "S1 was cut off while still leader of term 1. The rest elected S3 in term 2. When the link returns, S3's heartbeat carries term 2, and S1 becomes a follower.",
  limits: "Only three servers are drawn. The rule is the same for any message: a server that sees a larger term adopts it and becomes a follower, and it rejects any message with a smaller term.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "s1", label: "S1", kind: "server", sub: "leader, t1", x: 60, y: 100 },
      { id: "s2", label: "S2", kind: "server", sub: "follower, t2", x: 210, y: 190 },
      { id: "s3", label: "S3", kind: "server", sub: "leader, t2", x: 360, y: 100 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "s1", text: "cut off", tone: "warn" },
      { kind: "mark", at: 0.3, actor: "s1", tone: "warn" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "s3", to: "s2", label: "beat, term 2" },
      { kind: "say", at: 1.8, actor: "s1", text: "still leader", tone: "warn" },
      { kind: "say", at: 3, actor: "s1", text: "link is back", tone: "accent" },
      { kind: "fly", at: 3.3, dur: 1, from: "s3", to: "s1", label: "beat, term 2", tone: "accent" },
      { kind: "say", at: 4.4, actor: "s1", text: "sees term 2", tone: "accent" },
      { kind: "say", at: 5, actor: "s1", text: "follower, t2", tone: "good" },
      { kind: "mark", at: 5, actor: "s1", tone: "good" },
      { kind: "verdict", at: 5.5, text: "Old leader sees term 2 and steps down", tone: "good" },
    ],
    loop: 8.8,
  },
};
