import type { CustomCanvasSpec } from "../registry";
import { IsolationLayersCanvas } from "./IsolationLayersCanvas";

// 18.2 beat 2, "Namespaces decide what a process sees". Model: ./model.ts.
export const sysdesignM18IsolationLayers: CustomCanvasSpec = {
  kind: "custom",
  title: "What a container's process can see and use",
  purpose: "Tap four switches to turn the PID, network, mount and host name isolation on or off and see what the process can see. Drag the memory limit and the CPU limit: below 150 MB the process is killed; below one CPU it only gets slower.",
  limits: "One service on one made-up host with 212 processes. A container here is only the four isolations that matter most; real ones also hide users, shared memory and clocks, and filter system calls. The service runs one thread, so a limit above 1 CPU does not speed a request up. The request times (200 ms, 400 ms at half a CPU) are rounded; the course challenge measured 213 ms and 406 ms on a laptop.",
  component: IsolationLayersCanvas,
};
