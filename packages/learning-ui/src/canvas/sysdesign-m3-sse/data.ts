import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.5 beat 3: server-sent events. One request opens a stream; the server
// pushes events down it. When the connection drops, the browser reconnects
// on its own and sends Last-Event-ID, so the server resumes after event 2.
export const sysdesignM3Sse: SceneSpec = {
  kind: "scene",
  title: "Server-sent events: one request, a stream of news",
  purpose: "The app opens one stream; the server pushes each message down it, and after a dropped connection the app resumes where it stopped.",
  limits: "One user and three messages, made up for the picture. Server-sent events only flow from the server to the app; the app still sends its own messages as ordinary requests.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "server", kind: "server", label: "Chat server", sub: "waiting", x: 60, y: 200 },
      { id: "phone", kind: "phone", label: "Phone", sub: "EventSource", x: 360, y: 90 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "server", label: "GET /events" },
      { kind: "say", at: 0.8, actor: "server", text: "stream open", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.6, from: "server", to: "phone", label: "msg 1" },
      { kind: "fly", at: 1.8, dur: 0.6, from: "server", to: "phone", label: "msg 2" },
      { kind: "say", at: 2.4, actor: "phone", text: "seen 1 and 2", tone: "good" },
      { kind: "say", at: 2.9, actor: "phone", text: "signal lost", tone: "bad" },
      { kind: "say", at: 2.9, actor: "server", text: "stream closed", tone: "warn" },
      { kind: "say", at: 3.5, actor: "phone", text: "reconnecting" },
      { kind: "fly", at: 3.5, dur: 0.7, from: "phone", to: "server", label: "Last-Event-ID: 2" },
      { kind: "say", at: 4.2, actor: "server", text: "resume after 2", tone: "good" },
      { kind: "fly", at: 4.3, dur: 0.6, from: "server", to: "phone", label: "msg 3", tone: "good" },
      { kind: "say", at: 4.9, actor: "phone", text: "seen 3, no gap", tone: "good" },
      { kind: "verdict", at: 5.0, text: "Reconnected, resumed after msg 2", tone: "good" },
    ],
    loop: 8,
  },
};
