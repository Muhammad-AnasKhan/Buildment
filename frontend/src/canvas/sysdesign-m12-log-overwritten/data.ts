import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.6 beat 3 (Healing overwrites the old entry).
export const sysdesignM12LogOverwritten: SceneSpec = {
  kind: "scene",
  title: "When the cut heals, the old leader's uncommitted entry is erased",
  purpose: "S1 and S2 hold y = 9 from term 1. S3 leads term 2 with z = 7 on a majority. After the link returns, S3's append does not match S1 and S2's logs, so they drop y = 9 and copy z = 7.",
  limits: "A single entry on each side. The leader backs up one entry at a time until the logs match, then copies forward. Entries committed before the split were on a majority and stay.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "link", label: "Network", kind: "router", sub: "cut", x: 210, y: 100 },
      { id: "s1", label: "S1", kind: "server", sub: "y=9 (term 1)", x: 60, y: 100 },
      { id: "s2", label: "S2", kind: "server", sub: "y=9 (term 1)", x: 60, y: 190 },
      { id: "s3", label: "S3", kind: "server", sub: "z=7 (term 2)", x: 360, y: 100 },
      { id: "s4", label: "S4", kind: "server", sub: "z=7 (term 2)", x: 360, y: 190 },
      { id: "s5", label: "S5", kind: "server", sub: "z=7 (term 2)", x: 210, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.4, actor: "link", text: "healed", tone: "good" },
      { kind: "fly", at: 0.8, dur: 1, from: "s3", to: "s1", label: "append, t2", tone: "accent" },
      { kind: "fly", at: 0.8, dur: 1, from: "s3", to: "s2", label: "append, t2", tone: "accent" },
      { kind: "say", at: 1.9, actor: "s1", text: "sees term 2", tone: "accent" },
      { kind: "say", at: 1.9, actor: "s2", text: "sees term 2", tone: "accent" },
      { kind: "say", at: 2.8, actor: "s1", text: "no match", tone: "warn" },
      { kind: "say", at: 2.8, actor: "s2", text: "no match", tone: "warn" },
      { kind: "say", at: 3.6, actor: "s1", text: "drop y=9", tone: "bad" },
      { kind: "say", at: 3.6, actor: "s2", text: "drop y=9", tone: "bad" },
      { kind: "fly", at: 4.2, dur: 1, from: "s3", to: "s1", label: "send z=7", tone: "good" },
      { kind: "fly", at: 4.2, dur: 1, from: "s3", to: "s2", label: "send z=7", tone: "good" },
      { kind: "say", at: 5.3, actor: "s1", text: "z=7 (term 2)", tone: "good" },
      { kind: "say", at: 5.3, actor: "s2", text: "z=7 (term 2)", tone: "good" },
      { kind: "verdict", at: 5.7, text: "y=9 was never committed: erased", tone: "good" },
    ],
    loop: 9,
  },
};
