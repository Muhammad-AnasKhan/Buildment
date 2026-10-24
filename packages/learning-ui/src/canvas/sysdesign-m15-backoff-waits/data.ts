import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.5 beat 3: Backoff doubles the wait: 1, 2, 4 seconds.
export const sysdesignM15BackoffWaits: SceneSpec = {
  kind: "scene",
  title: "Backoff doubles the wait: 1, 2, 4 seconds",
  purpose: "The mail service is down. The worker tries at second 0, waits 1 second, tries at 1, waits 2 seconds, tries at 3, waits 4 seconds, and tries at 7, when the service is back.",
  limits: "A pure doubling wait with no random part. The next beats show why real systems add jitter. The 1 second start is a course number.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "worker", label: "Worker", kind: "worker", sub: "retrying", x: 60, y: 100 },
      { id: "mail", label: "Mail API", kind: "server", sub: "down", x: 360, y: 100 },
    ],
    strip: { y: 255, from: 0, to: 8, unit: "s", caption: "seconds since the first try", every: 2 },
    events: [
      { kind: "fly", at: 0.3, dur: 0.7, from: "worker", to: "mail", label: "try 1" },
      { kind: "tag", at: 0.4, row: 0, value: 0, label: "try 1", tone: "bad" },
      { kind: "say", at: 1.1, actor: "worker", text: "waits 1 s", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "worker", to: "mail", label: "try 2" },
      { kind: "tag", at: 1.7, row: 1, value: 1, label: "try 2", tone: "bad" },
      { kind: "say", at: 2.4, actor: "worker", text: "waits 2 s", tone: "warn" },
      { kind: "fly", at: 2.9, dur: 0.7, from: "worker", to: "mail", label: "try 3" },
      { kind: "tag", at: 3, row: 0, value: 3, label: "try 3", tone: "bad" },
      { kind: "say", at: 3.7, actor: "worker", text: "waits 4 s", tone: "warn" },
      { kind: "say", at: 4.4, actor: "mail", text: "back up", tone: "good" },
      { kind: "fly", at: 4.8, dur: 0.7, from: "worker", to: "mail", label: "try 4", tone: "good" },
      { kind: "tag", at: 4.9, row: 1, value: 7, label: "try 4", tone: "good" },
      { kind: "say", at: 5.6, actor: "worker", text: "sent", tone: "good" },
      { kind: "verdict", at: 5.9, text: "Waits double: 1, 2, 4 seconds", tone: "good" },
    ],
    loop: 8.9,
  },
};
