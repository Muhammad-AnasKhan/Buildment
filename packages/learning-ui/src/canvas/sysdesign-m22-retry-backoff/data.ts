import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.5 beat 4: the SMS provider says 503, and the worker waits longer after each failure.
export const sysdesignM22RetryBackoff: SceneSpec = {
  kind: "scene",
  title: "A busy provider: wait longer after each failure",
  purpose: "The SMS worker sends a login code, and the provider answers 503, which means busy. The worker waits 1 second and tries again, then waits 2 seconds. The third try works. Each wait gets a little random so workers do not retry together.",
  limits: "The waits shown are 1 and 2 seconds. A real policy has a top wait, a limit on tries, and a random part on every wait, for example waiting a random time between zero and the cap (chapter 15.5).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "queue", label: "SMS queue", kind: "queue", sub: "has the code", x: 70, y: 100 },
      { id: "worker", label: "SMS worker", kind: "worker", sub: "takes a job", x: 70, y: 235 },
      { id: "prov", label: "SMS provider", kind: "server", sub: "sends texts", x: 350, y: 100 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "queue", to: "worker", label: "send code" },
      { kind: "fly", at: 0.9, dur: 0.9, from: "worker", to: "prov", label: "try 1" },
      { kind: "say", at: 1.8, actor: "prov", text: "503: busy", tone: "bad" },
      { kind: "wait", at: 2.0, dur: 0.8, actor: "worker", label: "wait {n} s", doneLabel: "waited 1 s", total: 1 },
      { kind: "fly", at: 3.0, dur: 0.9, from: "worker", to: "prov", label: "try 2" },
      { kind: "say", at: 3.9, actor: "prov", text: "503: busy", tone: "bad" },
      { kind: "wait", at: 4.0, dur: 1.2, actor: "worker", label: "wait {n} s", doneLabel: "waited 2 s", total: 2 },
      { kind: "fly", at: 5.4, dur: 0.9, from: "worker", to: "prov", label: "try 3" },
      { kind: "say", at: 6.3, actor: "prov", text: "text sent", tone: "good" },
      { kind: "say", at: 6.4, actor: "worker", text: "job done", tone: "good" },
      { kind: "verdict", at: 6.5, text: "Wait longer each time, then send", tone: "good" },
    ],
    loop: 9.5,
  },
};
