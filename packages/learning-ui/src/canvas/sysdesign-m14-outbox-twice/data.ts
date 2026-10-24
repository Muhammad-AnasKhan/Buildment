import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 14.4 beat 4 (The relay can repeat).
export const sysdesignM14OutboxTwice: SceneSpec = {
  kind: "scene",
  title: "The relay publishes, crashes, and publishes again",
  purpose: "The relay dies after publishing but before marking the row sent. After restart it publishes the same event again.",
  limits: "One event. With a batch, a crash repeats every event of the batch that was already published (challenge 13, part 1).",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "relay", label: "Relay", kind: "worker", sub: "publishing", x: 60, y: 90 },
      { id: "broker", label: "Broker", kind: "queue", sub: "empty", x: 360, y: 90 },
      { id: "cons", label: "Consumer", kind: "worker", sub: "listening", x: 360, y: 260 },
      { id: "db", label: "Outbox", kind: "database", sub: "e-7 unsent", x: 60, y: 260 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "relay", to: "broker", label: "e-7" },
      { kind: "say", at: 1.1, actor: "broker", text: "has e-7", tone: "good" },
      { kind: "say", at: 1.5, actor: "relay", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.5, actor: "relay", tone: "bad" },
      { kind: "say", at: 2.4, actor: "relay", text: "restarted", tone: "accent" },
      { kind: "fly", at: 2.7, dur: 0.7, from: "relay", to: "db", label: "unsent?" },
      { kind: "say", at: 3.4, actor: "db", text: "e-7 unsent", tone: "warn" },
      { kind: "fly", at: 3.7, dur: 0.8, from: "relay", to: "broker", label: "e-7" },
      { kind: "say", at: 4.5, actor: "broker", text: "e-7 twice", tone: "warn" },
      { kind: "fly", at: 4.7, dur: 0.8, from: "broker", to: "cons", label: "e-7 x2" },
      { kind: "say", at: 5.5, actor: "cons", text: "saw e-7 twice", tone: "warn" },
      { kind: "verdict", at: 5.9, text: "At least once: expect copies", tone: "warn" },
    ],
    loop: 8.8,
  },
};
