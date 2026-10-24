import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 3.4 beat 2: HTTP/2 multiplexes streams on one TCP connection. The three
// requests leave together and the three answers come back together: 80 ms
// for all three instead of 240 ms one after another.
export const sysdesignM3Http2Streams: SceneSpec = {
  kind: "scene",
  title: "HTTP/2: many streams share one connection",
  purpose: "The browser sends all three requests at once as separate streams on one connection, and the answers come back side by side.",
  limits: "80 ms per round trip (napkin-math estimate), tiny files and no lost packets. Large answers still share the connection's bandwidth.",
  scene: {
    width: 420,
    height: 320,
    actors: [
      { id: "browser", kind: "phone", label: "Browser", sub: "3 streams open", x: 60, y: 150 },
      { id: "server", kind: "server", label: "Server", sub: "HTTP/2", x: 360, y: 150 },
    ],
    strip: { y: 290, from: 0, to: 240, unit: "ms", caption: "ms on one open connection", every: 80 },
    events: [
      { kind: "tag", at: 0.1, row: 1, value: 240, label: "HTTP/1.1: 240 ms" },
      { kind: "fly", at: 0.2, dur: 0.7, from: "browser", to: "server", label: "GET a" },
      { kind: "fly", at: 0.45, dur: 0.7, from: "browser", to: "server", label: "GET b" },
      { kind: "fly", at: 0.7, dur: 0.7, from: "browser", to: "server", label: "GET c" },
      { kind: "say", at: 1.4, actor: "server", text: "3 at once" },
      { kind: "fly", at: 1.4, dur: 0.7, from: "server", to: "browser", label: "a", tone: "good" },
      { kind: "fly", at: 1.65, dur: 0.7, from: "server", to: "browser", label: "b", tone: "good" },
      { kind: "fly", at: 1.9, dur: 0.7, from: "server", to: "browser", label: "c", tone: "good" },
      { kind: "tag", at: 2.6, row: 0, value: 80, label: "all 3: 80 ms", tone: "good" },
      { kind: "say", at: 2.6, actor: "browser", text: "all 3 loaded", tone: "good" },
      { kind: "verdict", at: 2.8, text: "3 streams, 1 connection, 80 ms", tone: "good" },
    ],
    loop: 6,
  },
};
