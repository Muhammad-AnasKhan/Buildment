import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.3 beat 5: a line can look open after the phone is gone; only a missing pong shows it.
export const sysdesignM22HalfOpen: SceneSpec = {
  kind: "scene",
  title: "A dead line can look open",
  purpose: "Sami's phone loses signal in a lift without saying goodbye. The gateway still thinks the line is open, so it writes the message to it. Only a ping with no pong shows the line is dead.",
  limits: "The ten second wait is a course number. A real gateway picks its own ping interval and wait. The point is that the gateway cannot know until a reply is missing.",
  scene: {
    width: 420,
    height: 340,
    actors: [
      { id: "gw", label: "Gateway 2", kind: "router", sub: "line looks open", x: 70, y: 100 },
      { id: "sami", label: "Sami", kind: "phone", sub: "in a lift", x: 70, y: 245 },
      { id: "chat", label: "Chat", kind: "server", sub: "sends msg 42", x: 350, y: 245 },
    ],
    events: [
      { kind: "mark", at: 0.2, actor: "sami", tone: "bad" },
      { kind: "say", at: 0.3, actor: "sami", text: "signal lost", tone: "bad" },
      { kind: "fly", at: 0.6, dur: 0.9, from: "chat", to: "gw", label: "msg 42" },
      { kind: "say", at: 1.5, actor: "gw", text: "wrote to line", tone: "warn" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "gw", to: "sami", label: "ping" },
      { kind: "wait", at: 2.6, dur: 2.0, actor: "gw", label: "no pong {n} s", doneLabel: "timed out", total: 10 },
      { kind: "say", at: 4.7, actor: "gw", text: "line is dead", tone: "bad" },
      { kind: "fly", at: 5.0, dur: 0.9, from: "gw", to: "chat", label: "msg 42 lost", tone: "bad" },
      { kind: "say", at: 5.9, actor: "chat", text: "keep, send push", tone: "warn" },
      { kind: "verdict", at: 6.0, text: "No pong means the line is dead", tone: "warn" },
    ],
    loop: 9.2,
  },
};
