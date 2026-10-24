import type { CustomCanvasSpec } from "../registry";
import { RaftLogPlayCanvas } from "./RaftLogPlayCanvas";

// 12.6 ("Raft part 2: log replication and commit"), beat 5 "Send, cut, heal: watch logs repair".
// Model: models/raft-cluster.ts (shared with sysdesign-m12-raft-election-play).
export const sysdesignM12RaftLogPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Send, cut, heal: watch Raft logs repair",
  purpose: "Send entries to a Raft leader, cut it off with one friend, send more to both sides, then heal and watch the other side's entries overwrite the ones that were never committed.",
  limits:
    "Five servers, a fixed 10 ms message delay, a heartbeat every 50 ms and fixed election timers, so the same buttons always give the same picture. Time is slowed about 80 times so the messages can be seen. The new leader adds an empty entry when it takes office, and it sends every entry a follower is missing in one message. A log holds at most eight entries. Disks, snapshots and client retries are left out.",
  component: RaftLogPlayCanvas,
};
