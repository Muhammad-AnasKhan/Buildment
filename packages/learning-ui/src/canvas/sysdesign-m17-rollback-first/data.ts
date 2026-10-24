import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.6 beat 4 (Roll back first, find the cause later).
export const sysdesignM17RollbackFirst: SceneSpec = {
  kind: "scene",
  title: "A bad deploy raises errors, and rolling back ends the incident in 3 minutes",
  purpose: "Version 42 goes live at minute 20 and errors rise to 6%. The on-call engineer is paged at minute 27 and rolls back at minute 33. Errors are gone at minute 36. The bug is hunted afterwards, with no users hurt.",
  limits: "One deploy and one rollback, with course numbers for the times. A rollback is not always possible, for example when a database change cannot be undone, and then the team has to fix forward.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "deploy", label: "Deploy tool", kind: "worker", sub: "v41 live", x: 60, y: 100 },
      { id: "dina", label: "Dina on call", kind: "user", sub: "asleep", x: 210, y: 190 },
      { id: "orders", label: "Orders", kind: "server", sub: "errors 0%", x: 360, y: 100 },
    ],
    strip: { y: 300, from: 0, to: 45, unit: "min", caption: "evening, in minutes", every: 5 },
    events: [
      { kind: "say", at: 0.3, actor: "deploy", text: "v42 live", tone: "accent" },
      { kind: "tag", at: 0.5, row: 0, value: 20, label: "20 deploy", tone: "accent" },
      { kind: "say", at: 1.1, actor: "orders", text: "errors 6%", tone: "bad" },
      { kind: "say", at: 1.8, actor: "dina", text: "paged", tone: "warn" },
      { kind: "tag", at: 1.8, row: 1, value: 27, label: "27 page", tone: "warn" },
      { kind: "fly", at: 2.6, dur: 1.3, from: "dina", to: "deploy", label: "roll back", tone: "accent" },
      { kind: "say", at: 3.9, actor: "deploy", text: "v41 live", tone: "good" },
      { kind: "tag", at: 3.9, row: 0, value: 33, label: "33 rollback", tone: "accent" },
      { kind: "say", at: 4.5, actor: "orders", text: "errors 0%", tone: "good" },
      { kind: "line", at: 4.5, value: 36, label: "fixed 36" },
      { kind: "verdict", at: 5.1, text: "Rollback ended it in 3 minutes", tone: "good" },
    ],
    loop: 8.5,
  },
};
