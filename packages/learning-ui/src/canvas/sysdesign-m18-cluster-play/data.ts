import type { CustomCanvasSpec } from "../registry";
import { ClusterPlayCanvas } from "./ClusterPlayCanvas";

// 18.4 beat 5, "Play: kill, fail, scale". Model: ./model.ts.
export const sysdesignM18ClusterPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Kill a pod, fail a probe, scale a Deployment",
  purpose: "Tap a pod to kill it and watch the Deployment start a replacement. Tap a pod's pill to fail its readiness check and watch the Service stop sending it requests. Drag the load and switch on the autoscaler to see how many pods it asks for.",
  limits: "Every pod serves 100 requests a second at 100% CPU, and the Service shares load equally. Time is sped up: a pod warms up for 3 seconds, the autoscaler looks every 3 seconds (a real one: 15) and scales down after 8 seconds (a real one: 5 minutes). The time the Service takes to notice a change, rolling updates, memory limits and the cost of the control plane itself are left out.",
  component: ClusterPlayCanvas,
};
