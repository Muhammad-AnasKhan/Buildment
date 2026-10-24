import { buildLagScene } from "../models/replica-lag-scene";
import type { SceneSpec } from "../renderers/scene/SceneCanvas";

export const sysdesignCommentFlicker: SceneSpec = {
  kind: "scene",
  title: "Amna's comment appears, vanishes, and comes back",
  purpose: "Her three refreshes land on replicas that are different amounts behind, so the comment flickers.",
  limits: "Replica 1 is 150 ms behind and replica 2 is 600 ms behind, like PostgreSQL replicas under heavy writes; Aurora replicas usually lag less than 100 ms. Reads take turns between replicas instead of being random, and time is slowed down.",
  scene: buildLagScene("any"),
};
