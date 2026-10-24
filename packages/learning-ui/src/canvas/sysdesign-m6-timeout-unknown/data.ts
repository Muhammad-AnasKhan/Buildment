import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.4 beat 1: the app times out. The provider did charge, but the app only
// knows "no answer in time", so it cannot tell success from failure.
export const sysdesignM6TimeoutUnknown: SceneSpec = {
  kind: "scene",
  title: "A timeout hides what happened",
  purpose: "The provider charges the card and replies late; the app stops waiting and is left with no way to know whether the payment happened.",
  limits: "This shows one of three cases: the request arrived and worked, and only the reply was late. The app sees the same timeout when the request was lost on the way or failed on the server. The 10-second timeout is a made-up course number.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "phone", label: "Huda", kind: "phone", sub: "taps Pay", x: 60, y: 200 },
      { id: "api", label: "Kitabi API", kind: "server", sub: "payments", x: 210, y: 100 },
      { id: "provider", label: "Provider", kind: "server", sub: "slow today", x: 360, y: 200 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.8, from: "phone", to: "api", label: "Pay $18" },
      { kind: "wait", at: 1.0, dur: 2.2, actor: "phone", label: "waiting {n} s", doneLabel: "no answer", total: 10 },
      { kind: "fly", at: 1.0, dur: 0.8, from: "api", to: "provider", label: "charge" },
      { kind: "say", at: 1.8, actor: "provider", text: "charged $18", tone: "warn" },
      { kind: "fly", at: 2.2, dur: 1.8, from: "provider", to: "api", label: "OK (late)" },
      { kind: "say", at: 3.2, actor: "phone", text: "charged or not?", tone: "bad" },
      { kind: "mark", at: 3.2, actor: "phone", tone: "bad" },
      { kind: "say", at: 4.0, actor: "api", text: "reply too late" },
      { kind: "verdict", at: 4.2, text: "Timeout: the app cannot tell", tone: "bad" },
    ],
    loop: 7.2,
  },
};
