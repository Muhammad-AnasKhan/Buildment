import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 22.5 beat 3: the same event arrives twice, and a set-if-absent key lets only the first one send.
export const sysdesignM22DedupeKey: SceneSpec = {
  kind: "scene",
  title: "The same event twice sends one push",
  purpose: "The chat service sends event e91 twice because its first call looked slow. The notifier tries to write a key for e91 in the seen-keys store. The first write wins and sends a push. The second finds the key and is dropped.",
  limits: "Keys are kept for a limited time, for example 24 hours. A copy that arrives after the key expired would send again, so the time must be longer than any retry can take.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "chat", label: "Chat", kind: "server", sub: "retries events", x: 70, y: 100 },
      { id: "note", label: "Notifier", kind: "worker", sub: "takes events", x: 350, y: 100 },
      { id: "seen", label: "Seen keys", kind: "cache", sub: "empty", x: 350, y: 235 },
      { id: "push", label: "Push", kind: "server", sub: "alert service", x: 70, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "chat", to: "note", label: "event e91" },
      { kind: "fly", at: 1.2, dur: 0.7, from: "note", to: "seen", label: "add e91?" },
      { kind: "say", at: 1.9, actor: "seen", text: "added e91", tone: "good" },
      { kind: "fly", at: 2.0, dur: 1.0, from: "note", to: "push", label: "send push", tone: "good" },
      { kind: "say", at: 3.0, actor: "push", text: "1 push sent", tone: "good" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "chat", to: "note", label: "e91 again", tone: "warn" },
      { kind: "fly", at: 4.2, dur: 0.7, from: "note", to: "seen", label: "add e91?" },
      { kind: "say", at: 4.9, actor: "seen", text: "already there", tone: "warn" },
      { kind: "say", at: 5.0, actor: "note", text: "drops the copy", tone: "good" },
      { kind: "verdict", at: 5.1, text: "Same event, one push", tone: "good" },
    ],
    loop: 8.2,
  },
};
