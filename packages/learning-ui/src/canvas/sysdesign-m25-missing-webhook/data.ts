import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.4 beat 4: The webhook never arrives. A checker asks the provider and fills the gap.
export const sysdesignM25MissingWebhook: SceneSpec = {
  kind: "scene",
  title: "No webhook came, so ask the provider",
  purpose: "Payment pay_7 stays pending for 300 seconds because its webhook never arrived. A checker that wakes every 5 minutes asks the provider for the status of pay_7, learns it was captured, and marks it paid.",
  limits: "The 5-minute check and the 300 seconds are course numbers. A real provider lets you fetch a payment by id; the exact call is in its documentation. The check must also be safe to repeat.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "app", label: "Tazkara", kind: "server", sub: "pay_7 pending", x: 70, y: 100 },
      { id: "prov", label: "Provider", kind: "server", sub: "pay_7 captured", x: 350, y: 100 },
      { id: "check", label: "Checker", kind: "worker", sub: "every 5 min", x: 210, y: 235 },
    ],
    events: [
      { kind: "wait", at: 0.3, dur: 2.6, actor: "app", label: "silent {n} s", doneLabel: "silent 300 s", total: 300 },
      { kind: "say", at: 3.2, actor: "check", text: "wakes up", tone: "accent" },
      { kind: "fly", at: 3.5, dur: 0.9, from: "check", to: "prov", label: "status pay_7?" },
      { kind: "fly", at: 4.5, dur: 0.9, from: "prov", to: "check", label: "captured", tone: "good" },
      { kind: "fly", at: 5.5, dur: 0.9, from: "check", to: "app", label: "mark paid", tone: "good" },
      { kind: "say", at: 6.4, actor: "app", text: "pay_7 paid", tone: "good" },
      { kind: "verdict", at: 6.7, text: "No webhook? Ask the provider", tone: "good" },
    ],
    loop: 9.5,
  },
};
