import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 26.3 beat 1 (One shared queue hammers one site).
export const sysdesignM26OneQueueHammer: SceneSpec = {
  kind: "scene",
  title: "A plain queue sends every fetcher to one site",
  purpose: "With one first-in first-out queue, a site that has many pages in a row fills the head of the line. All fetchers get its URLs and hit it at the same moment.",
  limits: "Three fetchers and one site. A real site may slow down or block the crawler's addresses long before it fails, and the fix is the next beat's per-host queues.",
  scene: {
    width: 420,
    height: 360,
    actors: [
      { id: "queue", label: "One queue", kind: "queue", sub: "3 shop URLs", x: 210, y: 100 },
      { id: "f1", label: "Fetcher 1", kind: "worker", sub: "idle", x: 70, y: 205 },
      { id: "f2", label: "Fetcher 2", kind: "worker", sub: "idle", x: 210, y: 205 },
      { id: "f3", label: "Fetcher 3", kind: "worker", sub: "idle", x: 350, y: 205 },
      { id: "site", label: "Website", kind: "server", sub: "shop.example", x: 210, y: 315 },
    ],
    events: [
      { kind: "fly", at: 0.2, dur: 0.7, from: "queue", to: "f1", label: "shop/1" },
      { kind: "fly", at: 0.2, dur: 0.7, from: "queue", to: "f3", label: "shop/3" },
      { kind: "fly", at: 0.2, dur: 0.7, from: "queue", to: "f2", label: "shop/2" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "f1", to: "site", label: "GET" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "f2", to: "site", label: "GET" },
      { kind: "fly", at: 1.4, dur: 0.8, from: "f3", to: "site", label: "GET" },
      { kind: "say", at: 2.2, actor: "site", text: "3 at once", tone: "warn" },
      { kind: "say", at: 3.2, actor: "site", text: "slow, errors", tone: "bad" },
      { kind: "mark", at: 3.2, actor: "site", tone: "bad" },
      { kind: "verdict", at: 3.5, text: "Hammered site starts to fail", tone: "bad" },
    ],
    loop: 8,
  },
};
