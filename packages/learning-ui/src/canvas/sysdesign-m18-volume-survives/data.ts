import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 18.3 beat 6 (Data outlives the container).
export const sysdesignM18VolumeSurvives: SceneSpec = {
  kind: "scene",
  title: "Data in a volume survives when the container is replaced",
  purpose: "Container 1 saves notes to a volume and is removed. Container 2 starts empty, mounts the same volume and finds the notes.",
  limits: "A container's own writable layer is deleted with the container. A named volume (or a database service) is stored outside it. On a cluster, a pod that moves to another machine needs storage that moves with it, which this picture does not show.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "c1", label: "Container 1", kind: "server", x: 60, y: 100 },
      { id: "c2", label: "Container 2", kind: "server", x: 60, y: 190 },
      { id: "vol", label: "Volume", kind: "database", sub: "notes.db", x: 360, y: 145 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "c1", text: "saving notes", tone: "accent" },
      { kind: "fly", at: 0.5, dur: 0.9, from: "c1", to: "vol", label: "notes.db" },
      { kind: "say", at: 1.7, actor: "c1", text: "removed", tone: "bad" },
      { kind: "mark", at: 1.7, actor: "c1", tone: "bad" },
      { kind: "say", at: 2.4, actor: "c2", text: "new, empty", tone: "accent" },
      { kind: "fly", at: 2.7, dur: 0.8, from: "c2", to: "vol", label: "mount" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "vol", to: "c2", label: "notes.db", tone: "good" },
      { kind: "say", at: 4.5, actor: "c2", text: "has the notes", tone: "good" },
      { kind: "verdict", at: 4.8, text: "Data in a volume survives", tone: "good" },
    ],
    loop: 7.8,
  },
};
