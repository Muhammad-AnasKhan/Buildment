import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 5: QUIC connection migration. The phone leaves Wi-Fi and moves to
// mobile data, so its address changes. A QUIC connection is named by a
// connection ID, not by addresses, so it carries on (RFC 9000).
export const sysdesignM3QuicMigration: SceneSpec = {
  kind: "scene",
  title: "QUIC keeps the connection across networks",
  purpose: "The phone switches from Wi-Fi to mobile data in the middle of a download, and the server recognises the same QUIC connection by its ID.",
  limits: "The connection ID 7f3a is made up. A TCP connection is tied to the old address, so it would have to be opened and secured again.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "phone", kind: "phone", label: "Phone", sub: "on Wi-Fi", x: 60, y: 165 },
      { id: "wifi", kind: "router", label: "Wi-Fi", sub: "home network", x: 210, y: 85 },
      { id: "mobile", kind: "router", label: "Mobile data", sub: "cell network", x: 210, y: 245 },
      { id: "server", kind: "server", label: "Server", sub: "conn ID 7f3a", x: 360, y: 165 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.6, from: "phone", to: "wifi", label: "conn 7f3a" },
      { kind: "fly", at: 0.8, dur: 0.6, from: "wifi", to: "server", label: "conn 7f3a" },
      { kind: "fly", at: 1.4, dur: 0.6, from: "server", to: "wifi", label: "data" },
      { kind: "fly", at: 2.0, dur: 0.6, from: "wifi", to: "phone", label: "data" },
      { kind: "say", at: 2.7, actor: "wifi", text: "out of range", tone: "bad" },
      { kind: "mark", at: 2.7, actor: "wifi", tone: "bad" },
      { kind: "say", at: 2.7, actor: "phone", text: "new address", tone: "warn" },
      { kind: "fly", at: 3.1, dur: 0.6, from: "phone", to: "mobile", label: "conn 7f3a" },
      { kind: "fly", at: 3.7, dur: 0.6, from: "mobile", to: "server", label: "conn 7f3a" },
      { kind: "say", at: 4.3, actor: "server", text: "same conn", tone: "good" },
      { kind: "fly", at: 4.3, dur: 0.6, from: "server", to: "mobile", label: "data" },
      { kind: "fly", at: 4.9, dur: 0.6, from: "mobile", to: "phone", label: "data", tone: "good" },
      { kind: "say", at: 5.5, actor: "phone", text: "no handshake", tone: "good" },
      { kind: "verdict", at: 5.6, text: "New network, same QUIC connection", tone: "good" },
    ],
    loop: 8.5,
  },
};
