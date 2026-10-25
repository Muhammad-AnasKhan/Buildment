import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 6.5 beat 2: a token bucket with capacity 5 and 1 token a second. A burst of
// 7 spends all 5 tokens; 2 are refused; tokens drip back one a second.
export const sysdesignM6TokenBucket: SceneSpec = {
  kind: "scene",
  title: "Token bucket: drip in, spend out",
  purpose: "A full bucket of 5 tokens lets 5 of a 7-request burst through; tokens then come back at 1 a second, and a later request spends one.",
  limits: "Capacity 5 and 1 token a second are made-up settings, and time is sped up. A real limiter adds the tokens up when a request arrives instead of with a timer.",
  scene: {
    width: 420,
    height: 220,
    actors: [
      { id: "client", label: "Client", kind: "worker", sub: "7 at once", x: 60, y: 140 },
      { id: "bucket", label: "Bucket", kind: "queue", sub: "5 of 5 tokens", x: 210, y: 140 },
      { id: "api", label: "Search API", kind: "server", sub: "ready", x: 360, y: 140 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "client", to: "bucket", label: "7 requests" },
      { kind: "say", at: 0.9, actor: "bucket", text: "0 of 5 tokens", tone: "bad" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "bucket", to: "api", label: "5 pass", tone: "good" },
      { kind: "fly", at: 1.0, dur: 0.7, from: "bucket", to: "client", label: "2 refused", tone: "bad" },
      { kind: "say", at: 1.7, actor: "api", text: "served 5", tone: "good" },
      { kind: "say", at: 2.6, actor: "bucket", text: "1 of 5 tokens" },
      { kind: "say", at: 3.5, actor: "bucket", text: "2 of 5 tokens" },
      { kind: "say", at: 3.5, actor: "client", text: "1 more" },
      { kind: "fly", at: 3.7, dur: 0.6, from: "client", to: "bucket", label: "1 request" },
      { kind: "say", at: 4.3, actor: "bucket", text: "1 of 5 tokens" },
      { kind: "fly", at: 4.4, dur: 0.6, from: "bucket", to: "api", label: "pass", tone: "good" },
      { kind: "say", at: 5.0, actor: "api", text: "served 6", tone: "good" },
      { kind: "verdict", at: 5.2, text: "Burst of 5 now, then 1 a second", tone: "accent" },
    ],
    loop: 8.2,
  },
};
