import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 7.5 beat 5. With multiversion concurrency control (MVCC), a write adds a new version and a read picks the version that was current for it, so reading never blocks writing and writing never blocks reading.
export const sysdesignM7MvccVersions: SceneSpec = {
  kind: "scene",
  title: "MVCC keeps old versions so readers never wait",
  purpose: "The writer makes version 2 of the row but has not committed. A reader asks and is handed version 1 at once. After the commit, new reads get version 2.",
  limits: "Old versions are kept until no running transaction can still need them, then cleaned up (PostgreSQL's VACUUM). Writers still wait for each other when they change the same row. The names and numbers are made up.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "writer", label: "Writer", kind: "server", sub: "sets left = 0", x: 360, y: 100 },
      { id: "reader", label: "Reader", kind: "user", sub: "reads seats", x: 60, y: 100 },
      { id: "v1", label: "Version 1", kind: "note", sub: "left: 1", x: 110, y: 255 },
      { id: "v2", label: "Version 2", kind: "note", sub: "not yet", x: 310, y: 255 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "writer", to: "v2", label: "write new" },
      { kind: "say", at: 1.1, actor: "v2", text: "left 0, pending", tone: "warn" },
      { kind: "fly", at: 1.5, dur: 0.7, from: "reader", to: "v1", label: "read" },
      { kind: "fly", at: 2.2, dur: 0.7, from: "v1", to: "reader", label: "left: 1", tone: "good" },
      { kind: "say", at: 2.9, actor: "reader", text: "not blocked", tone: "good" },
      { kind: "fly", at: 3.2, dur: 0.7, from: "writer", to: "v2", label: "commit" },
      { kind: "say", at: 3.9, actor: "v2", text: "current", tone: "good" },
      { kind: "say", at: 3.9, actor: "v1", text: "old, kept", tone: "warn" },
      { kind: "fly", at: 4.2, dur: 0.7, from: "reader", to: "v2", label: "read again" },
      { kind: "fly", at: 4.9, dur: 0.7, from: "v2", to: "reader", label: "left: 0", tone: "good" },
      { kind: "verdict", at: 5.6, text: "Readers never wait for writers", tone: "good" },
    ],
    loop: 8.4,
  },
};
