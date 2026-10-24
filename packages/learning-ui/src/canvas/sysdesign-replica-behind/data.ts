import type { CustomCanvasSpec } from "../registry";
import { ReplicaBehindCanvas } from "./ReplicaBehindCanvas";

export const sysdesignReplicaBehind: CustomCanvasSpec = {
  kind: "custom",
  title: "Replicas copy the leader's log, later",
  purpose: "The leader's log fills one write at a time and each replica fills the same boxes after its lag.",
  limits: "Writes arrive at a steady one every 100 ms and the lag stays fixed; in real systems both jump around, and lag grows when the replica is busy or the network is slow. Replica 1 is always a quarter as far behind as replica 2. Time is slowed down.",
  component: ReplicaBehindCanvas,
};
