import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.4 beat 3: salting. Noor's key becomes four sub-keys, seller:noor-crafts#0
// to #3, each with a quarter of the 1,800 writes a second (450). With the
// course hash on four shards the sub-keys land on shards 2, 4, 4 and 1, so the
// loads are 750, 750, 300 and 1,200 (300 background on each, plus 450 for each
// sub-key that landed there). Two sub-keys met on shard 4.
export const sysdesignM9SaltedKey: SceneSpec = {
  kind: "scene",
  title: "Salting splits one key into four",
  purpose: "Noor's orders are written under four sub-keys, noor#0 to noor#3. Hashing sends them to shards 2, 4, 4 and 1, so shard 4 still gets two of them.",
  limits: "Same made-up numbers as the previous picture: 1,200 writes a second in the background and 1,800 for Noor, which the four sub-keys share at 450 each. Where each sub-key lands comes from the course hash, so the near miss on shard 4 is real, not drawn for effect. Reading Noor's total now takes four reads.",
  scene: {
    width: 420,
    height: 280,
    actors: [
      { id: "app", label: "Suq app", kind: "server", sub: "adds #0 to #3", x: 60, y: 150 },
      { id: "s1", label: "Shard 1", kind: "database", sub: "300 writes/s", x: 210, y: 100 },
      { id: "s2", label: "Shard 2", kind: "database", sub: "300 writes/s", x: 360, y: 100 },
      { id: "s3", label: "Shard 3", kind: "database", sub: "300 writes/s", x: 210, y: 200 },
      { id: "s4", label: "Shard 4", kind: "database", sub: "300 writes/s", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "app", to: "s2", label: "noor#0" },
      { kind: "fly", at: 0.6, dur: 0.7, from: "app", to: "s4", label: "noor#1" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "app", to: "s4", label: "noor#2" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "app", to: "s1", label: "noor#3" },
      { kind: "say", at: 2.0, actor: "s1", text: "750 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s2", text: "750 writes/s", tone: "good" },
      { kind: "say", at: 2.0, actor: "s3", text: "300 writes/s", tone: "good" },
      { kind: "say", at: 2.4, actor: "s4", text: "1,200 writes/s", tone: "bad" },
      { kind: "mark", at: 2.4, actor: "s4", tone: "bad" },
      { kind: "verdict", at: 2.8, text: "Better, but shard 4 is still over", tone: "warn" },
    ],
    loop: 6.2,
  },
};
