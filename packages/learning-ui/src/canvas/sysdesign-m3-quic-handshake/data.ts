import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.2 beat 3: QUIC combines the transport and the TLS 1.3 handshakes into one
// (RFC 9000), so a new connection is ready after 1 round trip and the first
// byte arrives at 160 ms instead of 240 ms with TCP plus TLS 1.3.
export const sysdesignM3QuicHandshake: SceneSpec = {
  kind: "scene",
  title: "QUIC does both handshakes at once",
  purpose: "QUIC runs over UDP and carries the TLS 1.3 handshake inside its own, so the connection is secure after one round trip.",
  limits: "One round trip is about 80 ms (EU West to North America East, napkin-math estimate). A first visit with no saved session is shown. The 160 ms is derived from the combined handshake in the QUIC standard, not measured.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", kind: "phone", label: "Client", sub: "in EU West", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "QUIC over UDP", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "milliseconds, 80 ms per round trip", every: 80 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "server", label: "Initial: hello" },
      { kind: "say", at: 0.9, actor: "server", text: "keys ready" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "server", to: "client", label: "hello, done" },
      { kind: "tag", at: 1.6, row: 0, value: 80, label: "QUIC ready 80 ms", tone: "good" },
      { kind: "say", at: 1.6, actor: "client", text: "secure", tone: "good" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "client", to: "server", label: "done, GET" },
      { kind: "fly", at: 2.3, dur: 0.7, from: "server", to: "client", label: "response", tone: "good" },
      { kind: "tag", at: 3.0, row: 1, value: 160, label: "first byte 160 ms", tone: "good" },
      { kind: "say", at: 3.0, actor: "client", text: "got the page" },
      { kind: "tag", at: 3.3, row: 0, value: 240, label: "TCP+TLS 240 ms" },
      { kind: "verdict", at: 3.5, text: "QUIC: 1 round trip, then GET", tone: "good" },
    ],
    loop: 6.5,
  },
};
