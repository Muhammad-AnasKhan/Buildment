import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.2 beat 5: a second request on a connection that is already open and
// secure pays only its own round trip: 80 ms instead of 240 ms for a new
// TCP plus TLS 1.3 connection.
export const sysdesignM3KeepAlive: SceneSpec = {
  kind: "scene",
  title: "A connection kept open skips the setup",
  purpose: "The client sends a second request on the connection it already opened and secured, so no handshake runs.",
  limits: "One round trip is about 80 ms (napkin-math estimate). The connection is assumed still open. If either side has closed it, the next request pays the full setup again.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "client", kind: "phone", label: "Client", sub: "connection open", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "in NA East", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "milliseconds, 80 ms per round trip", every: 80 },
    events: [
      { kind: "tag", at: 0.2, row: 1, value: 240, label: "new conn 240 ms" },
      { kind: "say", at: 0.3, actor: "client", text: "second request" },
      { kind: "fly", at: 0.3, dur: 0.8, from: "client", to: "server", label: "GET /cart" },
      { kind: "say", at: 1.1, actor: "server", text: "same connection" },
      { kind: "fly", at: 1.1, dur: 0.8, from: "server", to: "client", label: "cart", tone: "good" },
      { kind: "tag", at: 1.9, row: 0, value: 80, label: "reused 80 ms", tone: "good" },
      { kind: "say", at: 1.9, actor: "client", text: "no handshake", tone: "good" },
      { kind: "retone", at: 2.1, label: "new conn 240 ms", tone: "bad" },
      { kind: "verdict", at: 2.3, text: "Reused connection: 1 round trip", tone: "good" },
    ],
    loop: 5.5,
  },
};
