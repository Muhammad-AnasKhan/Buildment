import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.2 beat 2: HTTPS over TCP with TLS 1.3. TCP takes 1 round trip, the TLS
// 1.3 full handshake takes 1 more (RFC 8446), and the request is a third.
// At 80 ms per round trip the first byte arrives at 240 ms.
export const sysdesignM3TlsHandshake: SceneSpec = {
  kind: "scene",
  title: "TLS adds a round trip on top of TCP",
  purpose: "After TCP connects, the client and the server agree on keys with TLS 1.3, and only then send the request.",
  limits: "One round trip is about 80 ms (EU West to North America East, napkin-math estimate). A full TLS 1.3 handshake with no resumed session is shown; certificate size, the server's work and lost packets are left out.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", kind: "phone", label: "Client", sub: "in EU West", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "in NA East", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "milliseconds, 80 ms per round trip", every: 80 },
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "server", label: "SYN" },
      { kind: "fly", at: 0.9, dur: 0.7, from: "server", to: "client", label: "SYN-ACK" },
      { kind: "tag", at: 1.6, row: 0, value: 80, label: "TCP 80 ms" },
      { kind: "say", at: 1.6, actor: "client", text: "TCP open" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "client", to: "server", label: "ClientHello" },
      { kind: "say", at: 2.3, actor: "server", text: "picks the keys" },
      { kind: "fly", at: 2.3, dur: 0.7, from: "server", to: "client", label: "ServerHello" },
      { kind: "tag", at: 3.0, row: 1, value: 160, label: "TLS 160 ms" },
      { kind: "say", at: 3.0, actor: "client", text: "secure", tone: "good" },
      { kind: "fly", at: 3.0, dur: 0.7, from: "client", to: "server", label: "Finished, GET" },
      { kind: "fly", at: 3.7, dur: 0.7, from: "server", to: "client", label: "response", tone: "good" },
      { kind: "tag", at: 4.4, row: 0, value: 240, label: "first byte 240 ms", tone: "warn" },
      { kind: "say", at: 4.4, actor: "client", text: "got the page" },
      { kind: "verdict", at: 4.6, text: "HTTPS: 2 round trips before GET", tone: "warn" },
    ],
    loop: 7.5,
  },
};
