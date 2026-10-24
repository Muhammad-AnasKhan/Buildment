import type { CustomCanvasSpec } from "../registry";
import { LayerCacheCanvas } from "./LayerCacheCanvas";

// 18.3 beat 2, "Change one file, see what rebuilds". Model: ./model.ts.
export const sysdesignM18LayerCache: CustomCanvasSpec = {
  kind: "custom",
  title: "Which Docker layers rebuild when a file changes",
  purpose: "Tap one of three files to change it and switch the Dockerfile order. Every layer above the first changed one is reused; that layer and everything after it is rebuilt. Where a step sits decides how often it runs.",
  limits: "Build times are round numbers close to one run of the course sample service, which has only 13 packages; a real project's install takes far longer. Seconds vary from run to run with the network, so the reused layers are the reliable signal. Base-image updates, build arguments and multi-stage builds are left out.",
  component: LayerCacheCanvas,
};
