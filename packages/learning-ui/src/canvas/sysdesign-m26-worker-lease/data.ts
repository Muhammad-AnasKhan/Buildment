import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.2 beat 7 (A crashed fetcher only delays a page).
export const sysdesignM26WorkerLease: SceneSpec = {
  kind: "scene",
  title: "A crashed fetcher loses nothing",
  purpose: "The frontier hands out a URL with a lease. If the fetcher crashes, it never reports back, the lease runs out, and the frontier gives the same URL to another fetcher.",
  limits: "A lease of 30 seconds is a course choice, like the default visibility timeout of a queue (S84). Fetching the same page twice is harmless, so at-least-once is enough. A retry must still respect the wait for that host.",
  scene: {
    width: 420,
    height: 300,
    actors: [
      { id: "frontier", label: "Frontier", kind: "queue", sub: "leases URLs", x: 210, y: 100 },
      { id: "a", label: "Fetcher A", kind: "worker", sub: "idle", x: 70, y: 235 },
      { id: "b", label: "Fetcher B", kind: "worker", sub: "idle", x: 350, y: 235 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.9, from: "frontier", to: "a", label: "URL + lease" },
      { kind: "say", at: 1.1, actor: "a", text: "fetching", tone: "accent" },
      { kind: "say", at: 1.8, actor: "a", text: "crashed", tone: "bad" },
      { kind: "mark", at: 1.8, actor: "a", tone: "bad" },
      { kind: "say", at: 2.2, actor: "frontier", text: "waiting 30 s", tone: "warn" },
      { kind: "say", at: 3.6, actor: "frontier", text: "lease ended", tone: "warn" },
      { kind: "fly", at: 4, dur: 0.9, from: "frontier", to: "b", label: "same URL" },
      { kind: "say", at: 4.9, actor: "b", text: "fetched", tone: "good" },
      { kind: "say", at: 4.9, actor: "frontier", text: "done", tone: "good" },
      { kind: "verdict", at: 5.2, text: "A crash only delays the page", tone: "good" },
    ],
    loop: 9,
  },
};
