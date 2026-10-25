import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 17.2 beat 5 (Pass the id on every call).
export const sysdesignM17PropagateId: SceneSpec = {
  kind: "scene",
  title: "The api passes its trace id to the menu service but forgets the payments service",
  purpose: "The api starts trace 4bf9 and sends it in the traceparent header to menu, so menu joins the trace. It calls payments without the header, so payments starts a new trace and the order is split in two.",
  limits: "Two calls and one forgotten header. The ids are shortened to four characters; a real trace id has 32 hex characters. Real code usually sets the header in a client library, which is why forgetting it is rare but easy to miss.",
  scene: {
    width: 420,
    height: 330,
    actors: [
      { id: "api", label: "Api", kind: "server", sub: "starts trace", x: 60, y: 100 },
      { id: "menu", label: "Menu", kind: "server", sub: "waiting", x: 360, y: 100 },
      { id: "pay", label: "Payments", kind: "server", sub: "waiting", x: 210, y: 250 },
    ],
    events: [
      { kind: "say", at: 0.2, actor: "api", text: "trace 4bf9", tone: "accent" },
      { kind: "fly", at: 0.6, dur: 1.4, from: "api", to: "menu", label: "traceparent", tone: "accent" },
      { kind: "say", at: 2, actor: "menu", text: "trace 4bf9", tone: "good" },
      { kind: "fly", at: 2.4, dur: 1.4, from: "api", to: "pay", label: "no header", tone: "bad" },
      { kind: "say", at: 3.8, actor: "pay", text: "new trace 7c1e", tone: "bad" },
      { kind: "mark", at: 3.8, actor: "pay", tone: "bad" },
      { kind: "verdict", at: 4.5, text: "Payments forgot: the trace splits", tone: "bad" },
    ],
    loop: 7.5,
  },
};
