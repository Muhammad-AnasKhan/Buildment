import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 15.1 beat 2: The API times out, tries again, and Layla gets two emails.
export const sysdesignM15EmailTwice: SceneSpec = {
  kind: "scene",
  title: "The API times out, tries again, and Layla gets two emails",
  purpose: "The API waits 2 seconds for the email service, gives up, and sends the request again. The first request was only slow, so the email service sends both.",
  limits: "Zaytoun Market, Layla and the timings are made up. A real email service may or may not remove a repeated request; this one does not.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "layla", label: "Layla", kind: "phone", sub: "inbox: 0", x: 60, y: 110 },
      { id: "api", label: "API", kind: "server", sub: "signup saved", x: 210, y: 110 },
      { id: "mail", label: "Email", kind: "server", sub: "email service", x: 210, y: 225 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.8, from: "api", to: "mail", label: "send welcome" },
      { kind: "wait", at: 1.1, dur: 1.8, actor: "api", label: "wait {n} s", doneLabel: "timed out", total: 2 },
      { kind: "say", at: 1.4, actor: "mail", text: "sending...", tone: "accent" },
      { kind: "say", at: 3.1, actor: "api", text: "no reply: retry", tone: "warn" },
      { kind: "fly", at: 3.3, dur: 0.8, from: "api", to: "mail", label: "send again" },
      { kind: "say", at: 4.3, actor: "mail", text: "sent twice", tone: "bad" },
      { kind: "mark", at: 4.3, actor: "mail", tone: "bad" },
      { kind: "fly", at: 4.5, dur: 0.9, from: "mail", to: "layla", label: "welcome #1", tone: "bad" },
      { kind: "fly", at: 5.5, dur: 0.9, from: "mail", to: "layla", label: "welcome #2", tone: "bad" },
      { kind: "say", at: 6.5, actor: "layla", text: "inbox: 2", tone: "bad" },
      { kind: "verdict", at: 6.7, text: "One signup, two welcome emails", tone: "bad" },
    ],
    loop: 9.7,
  },
};
