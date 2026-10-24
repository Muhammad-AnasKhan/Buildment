import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 25.4 beat 2: Save the raw webhook, answer 200 at once, and let a worker do the real work later.
export const sysdesignM25WebhookInbox: SceneSpec = {
  kind: "scene",
  title: "Save the webhook, reply 200, work later",
  purpose: "The provider calls Tazkara's webhook endpoint with the event evt_1. The endpoint checks who sent it, saves the raw event in an inbox, and answers 200 OK at once. A worker takes the event from the inbox later and posts it to the ledger.",
  limits: "A made-up event id and flow. The endpoint must reply fast because the provider retries when it gets no success reply in time. The inbox is a table or a queue; the pattern is the same as the inbox side of chapter 14.5.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "prov", label: "Provider", kind: "server", sub: "payment events", x: 70, y: 100 },
      { id: "end", label: "Endpoint", kind: "server", sub: "/webhooks", x: 350, y: 100 },
      { id: "worker", label: "Worker", kind: "worker", sub: "waits", x: 70, y: 235 },
      { id: "inbox", label: "Inbox", kind: "queue", sub: "empty", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "prov", to: "end", label: "evt_1: captured" },
      { kind: "say", at: 1.2, actor: "end", text: "verifies sender", tone: "accent" },
      { kind: "fly", at: 1.8, dur: 0.8, from: "end", to: "inbox", label: "save raw event" },
      { kind: "say", at: 2.6, actor: "inbox", text: "evt_1 saved", tone: "good" },
      { kind: "fly", at: 2.9, dur: 0.9, from: "end", to: "prov", label: "200 OK", tone: "good" },
      { kind: "fly", at: 3.9, dur: 0.9, from: "inbox", to: "worker", label: "take evt_1" },
      { kind: "say", at: 4.8, actor: "worker", text: "posts to ledger", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Save first, reply 200, work later", tone: "good" },
    ],
    loop: 8.5,
  },
};
