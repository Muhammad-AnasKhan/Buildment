import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.5 beat 1: polling every 5 s. Two of three requests come back empty, and
// the message written at 6 s is only seen at the 10 s poll, 4 s late.
export const sysdesignM3Polling: SceneSpec = {
  kind: "scene",
  title: "Polling: ask again and again",
  purpose: "The chat app asks the server for new messages every 5 seconds, whether or not anything has happened.",
  limits: "One user, a 5 s poll interval and one message, all made up for the picture. Network time is left out because it is tiny next to the seconds of waiting between polls.",
  scene: {
    width: 420,
    height: 360,
    actors: [
      { id: "server", kind: "server", label: "Chat server", sub: "no new messages", x: 60, y: 200 },
      { id: "phone", kind: "phone", label: "Phone", sub: "polls every 5 s", x: 360, y: 90 },
    ],
    strip: { y: 330, from: 0, to: 15, unit: "s", caption: "seconds", every: 5 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.5, from: "phone", to: "server", label: "new? (0 s)" },
      { kind: "fly", at: 0.7, dur: 0.5, from: "server", to: "phone", label: "nothing" },
      { kind: "say", at: 1.2, actor: "phone", text: "1 request" },
      { kind: "fly", at: 1.5, dur: 0.5, from: "phone", to: "server", label: "new? (5 s)" },
      { kind: "fly", at: 2.0, dur: 0.5, from: "server", to: "phone", label: "nothing" },
      { kind: "say", at: 2.5, actor: "phone", text: "2 requests" },
      { kind: "say", at: 2.8, actor: "server", text: "Omar wrote", tone: "warn" },
      { kind: "tag", at: 2.8, row: 0, value: 6, label: "sent 6 s" },
      { kind: "fly", at: 3.4, dur: 0.5, from: "phone", to: "server", label: "new? (10 s)" },
      { kind: "fly", at: 3.9, dur: 0.5, from: "server", to: "phone", label: "1 message", tone: "good" },
      { kind: "say", at: 4.4, actor: "phone", text: "3 requests" },
      { kind: "tag", at: 4.4, row: 1, value: 10, label: "seen 10 s", tone: "warn" },
      { kind: "verdict", at: 4.6, text: "3 requests, 1 message, 4 s late", tone: "warn" },
    ],
    loop: 7.5,
  },
};
