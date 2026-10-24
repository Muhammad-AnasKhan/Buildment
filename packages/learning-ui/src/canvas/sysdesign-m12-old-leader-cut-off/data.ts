import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 12.6 beat 2 (Two leaders, one can commit).
export const sysdesignM12OldLeaderCutOff: SceneSpec = {
  kind: "scene",
  title: "A cut-off leader accepts a write it can never commit",
  purpose: "S1 and S2 are cut off from S3, S4 and S5. S1 still thinks it leads and stores y = 9, but 2 of 5 is not a majority. The other side elects S3 for term 2 and commits z = 7.",
  limits: "Five servers split 2 and 3. The client of the old leader does not hear back, which is how it learns something is wrong. The commit of z = 7 needs 3 of 5, which S3, S4 and S5 are.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "c", label: "Client", kind: "phone", sub: "writes", x: 210, y: 100 },
      { id: "s1", label: "S1", kind: "server", sub: "leader, t1", x: 60, y: 100 },
      { id: "s2", label: "S2", kind: "server", sub: "follower", x: 60, y: 190 },
      { id: "s3", label: "S3", kind: "server", sub: "follower", x: 360, y: 100 },
      { id: "s4", label: "S4", kind: "server", sub: "follower", x: 360, y: 190 },
      { id: "s5", label: "S5", kind: "server", sub: "follower", x: 210, y: 190 },
    ],
    events: [
      { kind: "say", at: 0.3, actor: "s1", text: "leader, cut off", tone: "warn" },
      { kind: "say", at: 0.3, actor: "s2", text: "cut off", tone: "warn" },
      { kind: "mark", at: 0.3, actor: "s1", tone: "warn" },
      { kind: "fly", at: 1, dur: 0.9, from: "c", to: "s1", label: "y=9" },
      { kind: "say", at: 1.9, actor: "s1", text: "log: y=9", tone: "accent" },
      { kind: "fly", at: 2.1, dur: 0.9, from: "s1", to: "s2", label: "append y=9" },
      { kind: "say", at: 3, actor: "s2", text: "log: y=9", tone: "accent" },
      { kind: "say", at: 3.2, actor: "s1", text: "2 of 5: wait", tone: "warn" },
      { kind: "say", at: 4, actor: "s3", text: "candidate t2", tone: "accent" },
      { kind: "fly", at: 4.2, dur: 0.9, from: "s3", to: "s4", label: "vote me?" },
      { kind: "fly", at: 4.2, dur: 0.9, from: "s3", to: "s5", label: "vote me?" },
      { kind: "say", at: 5.2, actor: "s3", text: "leader, t2", tone: "good" },
      { kind: "mark", at: 5.2, actor: "s3", tone: "good" },
      { kind: "fly", at: 5.5, dur: 0.9, from: "c", to: "s3", label: "z=7" },
      { kind: "fly", at: 6.4, dur: 0.9, from: "s3", to: "s4", label: "append z=7" },
      { kind: "fly", at: 6.4, dur: 0.9, from: "s3", to: "s5", label: "append z=7" },
      { kind: "say", at: 7.4, actor: "s3", text: "committed z=7", tone: "good" },
      { kind: "verdict", at: 7.8, text: "Two leaders, only one can commit", tone: "warn" },
    ],
    loop: 11,
  },
};
