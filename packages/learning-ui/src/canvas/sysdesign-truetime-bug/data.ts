import { buildTrueTimeScene } from "../models/truetime-scene";
import type { SceneSpec } from "../renderers/scene/SceneCanvas";

export const sysdesignTruetimeBug: SceneSpec = {
  kind: "scene",
  title: "Alice unfriends Bob, then posts a photo, and Bob sees it",
  purpose: "With a fast clock on server A and a slow one on B, the later photo gets the earlier timestamp.",
  limits: "Server A's clock is 3.6 ms fast and B's is 3.6 ms slow, the worst case inside epsilon 4 ms, and Alice posts 2 ms after she sees done. Time is slowed down so each message can be followed. Real Spanner also takes locks and replicates each write, which this picture leaves out.",
  scene: buildTrueTimeScene(4, false),
};
