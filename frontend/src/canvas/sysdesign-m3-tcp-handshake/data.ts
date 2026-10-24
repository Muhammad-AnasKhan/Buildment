import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.2 beat 1: the TCP three-way handshake between EU West and North America
// East (about 80 ms per round trip, napkin-math). The request can only leave
// with the third step, so the first byte comes back after 2 round trips.
export const sysdesignM3TcpHandshake: SceneSpec = {
  kind: "scene",
  title: "TCP asks before it talks",
  purpose: "The client and the server exchange SYN, SYN-ACK and ACK before the request can be sent.",
  limits: "One round trip from EU West to North America East is about 80 ms (napkin-math estimate). Plain HTTP with no TLS is shown; the server's own work and lost packets are left out.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", kind: "phone", label: "Client", sub: "in EU West", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "in NA East", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 160, unit: "ms", caption: "milliseconds, 80 ms per round trip", every: 40 },
    events: [
      { kind: "say", at: 0.2, actor: "client", text: "opening" },
      { kind: "fly", at: 0.2, dur: 0.9, from: "client", to: "server", label: "SYN" },
      { kind: "say", at: 1.1, actor: "server", text: "SYN received" },
      { kind: "fly", at: 1.1, dur: 0.9, from: "server", to: "client", label: "SYN-ACK" },
      { kind: "tag", at: 2.0, row: 0, value: 80, label: "connected 80 ms", tone: "good" },
      { kind: "say", at: 2.0, actor: "client", text: "connected", tone: "good" },
      { kind: "fly", at: 2.0, dur: 0.9, from: "client", to: "server", label: "ACK, GET /" },
      { kind: "say", at: 2.9, actor: "server", text: "got the GET" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "server", to: "client", label: "response", tone: "good" },
      { kind: "tag", at: 3.8, row: 1, value: 160, label: "first byte 160 ms" },
      { kind: "say", at: 3.8, actor: "client", text: "got the page" },
      { kind: "verdict", at: 4.0, text: "1 round trip before the request", tone: "warn" },
    ],
    loop: 7,
  },
};
