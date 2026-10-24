import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 19.1 beat 1 (At 14:02, every request fails). Tawsil is a made-up courier app with everything in one region.
export const sysdesignM19RegionDark: SceneSpec = {
  kind: "scene",
  title: "Tawsil's only region loses power",
  purpose: "A customer orders and gets an answer. Then the one region that holds the app and its database goes dark, and the customer and the courier both get nothing.",
  limits: "A made-up app with one region and no second site. Real outages are rarely this total, but a region-wide fault is exactly the case one region cannot survive.",
  scene: {
    width: 420,
    height: 270,
    actors: [
      { id: "customer", label: "Customer", kind: "phone", sub: "wants to order", x: 62, y: 100 },
      { id: "courier", label: "Courier", kind: "phone", sub: "on a delivery", x: 62, y: 200 },
      { id: "region", label: "Region A", kind: "server", sub: "app + database", x: 210, y: 150 },
      { id: "second", label: "2nd region", kind: "note", sub: "none", x: 358, y: 150 },
    ],
    events: [
      { kind: "fly", at: 0.3, dur: 0.9, from: "customer", to: "region", label: "order" },
      { kind: "fly", at: 1.3, dur: 0.9, from: "region", to: "customer", label: "ok", tone: "good" },
      { kind: "say", at: 2.2, actor: "customer", text: "order placed", tone: "good" },
      { kind: "say", at: 2.8, actor: "region", text: "power cut", tone: "bad" },
      { kind: "mark", at: 2.8, actor: "region", tone: "bad" },
      { kind: "fly", at: 3.2, dur: 0.9, from: "courier", to: "region", label: "delivered" },
      { kind: "say", at: 4.2, actor: "courier", text: "no answer", tone: "bad" },
      { kind: "say", at: 4.2, actor: "customer", text: "no answer", tone: "bad" },
      { kind: "mark", at: 4.6, actor: "second", tone: "warn" },
      { kind: "verdict", at: 4.8, text: "Region down: whole app is down", tone: "bad" },
    ],
    loop: 8.2,
  },
};
