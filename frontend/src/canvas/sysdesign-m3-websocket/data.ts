import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.5 beat 4: a WebSocket. One HTTP request asks to upgrade; after the 101
// answer the same TCP connection carries messages both ways (RFC 6455).
export const sysdesignM3Websocket: SceneSpec = {
  kind: "scene",
  title: "WebSocket: one connection, both directions",
  purpose: "The app upgrades one HTTP request to a WebSocket; after that, both sides send messages whenever they like on the same connection.",
  limits: "One user and three messages, made up for the picture. Every open WebSocket is a connection the server must keep, even when nobody is typing.",
  scene: {
    width: 420,
    height: 290,
    actors: [
      { id: "server", kind: "server", label: "Chat server", sub: "waiting", x: 60, y: 200 },
      { id: "phone", kind: "phone", label: "Phone", sub: "Lina's chat", x: 360, y: 90 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "server", label: "GET, Upgrade" },
      { kind: "say", at: 0.8, actor: "server", text: "101 switching" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "server", to: "phone", label: "101" },
      { kind: "say", at: 1.4, actor: "phone", text: "socket open", tone: "good" },
      { kind: "say", at: 1.4, actor: "server", text: "socket open", tone: "good" },
      { kind: "fly", at: 1.8, dur: 0.6, from: "phone", to: "server", label: "typing" },
      { kind: "fly", at: 2.6, dur: 0.6, from: "server", to: "phone", label: "Omar: hi" },
      { kind: "fly", at: 3.4, dur: 0.6, from: "phone", to: "server", label: "Lina: hello" },
      { kind: "fly", at: 3.6, dur: 0.6, from: "server", to: "phone", label: "Omar typing" },
      { kind: "say", at: 4.2, actor: "phone", text: "both ways", tone: "good" },
      { kind: "verdict", at: 4.4, text: "One connection, both directions", tone: "good" },
    ],
    loop: 7,
  },
};
