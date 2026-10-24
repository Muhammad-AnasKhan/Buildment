import type { SceneSpec } from "../renderers/scene/SceneCanvas";

// 9.5 beat 5: a client with an old copy of the partition map asks node 1 for a
// key that moved to node 5. Node 1 says where it went; the client retries
// there and keeps the new map.
export const sysdesignM9StaleMap: SceneSpec = {
  kind: "scene",
  title: "A stale map costs one extra hop",
  purpose: "The client still has map version 7, so it asks node 1 for a key that moved to node 5. Node 1 replies with the new owner, the client updates its map and asks again.",
  limits: "One client and one moved key. In real systems the old node either redirects the client, as here, or forwards the request itself. Either way the first answer cannot come from the old node's copy, which may be out of date once the move has started.",
  scene: {
    width: 420,
    height: 260,
    actors: [
      { id: "client", label: "Client", kind: "phone", sub: "map version 7", x: 60, y: 110 },
      { id: "n1", label: "Node 1", kind: "database", sub: "old owner", x: 210, y: 110 },
      { id: "n5", label: "Node 5", kind: "database", sub: "owner now", x: 360, y: 110 },
    ],
    events: [
      { kind: "fly", at: 0.4, dur: 0.7, from: "client", to: "n1", label: "get k" },
      { kind: "say", at: 1.1, actor: "n1", text: "not mine now", tone: "warn" },
      { kind: "fly", at: 1.6, dur: 0.7, from: "n1", to: "client", label: "moved: node 5", tone: "warn" },
      { kind: "say", at: 2.3, actor: "client", text: "map version 8", tone: "good" },
      { kind: "fly", at: 2.8, dur: 0.7, from: "client", to: "n5", label: "get k" },
      { kind: "fly", at: 3.5, dur: 0.7, from: "n5", to: "client", label: "value", tone: "good" },
      { kind: "say", at: 4.2, actor: "n5", text: "served it", tone: "good" },
      { kind: "verdict", at: 4.4, text: "One extra hop, then the map is fresh", tone: "good" },
    ],
    loop: 7.6,
  },
};
