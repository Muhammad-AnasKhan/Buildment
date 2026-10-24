import type { CustomCanvasSpec } from "../registry";
import { RaftElectionPlayCanvas } from "./RaftElectionPlayCanvas";

// 12.5 ("Raft part 1: terms and elections"), beat 6 "Kill, split and cut: drive the cluster".
// Model: models/raft-cluster.ts (shared with sysdesign-m12-raft-log-play).
export const sysdesignM12RaftElectionPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Kill, split and cut: drive a Raft cluster",
  purpose: "Kill the leader, force a tie, cut a follower off and bring it back, and watch the terms, the votes and the time with no leader.",
  limits:
    "Five servers, a fixed 10 ms message delay and a heartbeat every 50 ms. Election timers come from short fixed lists between 150 and 300 ms, so the same button always gives the same picture; real timers are random. Time is slowed about 80 times so the messages can be seen. A kill or a cut happens right after a heartbeat, and a server that sees a newer term restarts its timer, which is simpler than a real server. Disks, clients and log repair are left to the next beat.",
  component: RaftElectionPlayCanvas,
};
