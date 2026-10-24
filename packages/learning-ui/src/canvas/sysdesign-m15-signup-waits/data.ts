import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.1 beat 1: A signup waits while the app sends an email.
export const sysdesignM15SignupWaits: SceneSpec = {
  kind: "scene",
  title: "A signup waits while the app sends an email",
  purpose: "Layla taps Create account. The API saves her account in 40 ms, then calls the email service and waits 3 seconds for it before it answers her.",
  limits: "Zaytoun Market, Layla and the timings are made up for this course. 3 seconds is a slow day for an email service; a normal call is much faster, but any slow call shows the same thing.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "Create account", x: 60, y: 110 },
      { id: "api", label: "API", kind: "server", sub: "saves account", x: 210, y: 110 },
      { id: "mail", label: "Email", kind: "server", sub: "email service", x: 210, y: 220 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "layla", to: "api", label: "sign up" },
      { kind: "say", at: 1.2, actor: "api", text: "saved: 40 ms", tone: "good" },
      { kind: "fly", at: 1.5, dur: 0.8, from: "api", to: "mail", label: "send welcome" },
      { kind: "say", at: 2.4, actor: "mail", text: "slow today", tone: "warn" },
      { kind: "wait", at: 2.4, dur: 2.4, actor: "api", label: "wait {n} s", doneLabel: "got reply", total: 3 },
      { kind: "fly", at: 5, dur: 0.8, from: "mail", to: "api", label: "sent", tone: "good" },
      { kind: "fly", at: 5.9, dur: 0.8, from: "api", to: "layla", label: "done" },
      { kind: "say", at: 6.8, actor: "layla", text: "waited 3 s", tone: "bad" },
      { kind: "verdict", at: 7, text: "Layla waited 3 s for an email", tone: "bad" },
    ],
    loop: 10,
  },
};
