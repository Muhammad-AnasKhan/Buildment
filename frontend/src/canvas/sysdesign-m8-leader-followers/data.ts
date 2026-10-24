import type { CustomCanvasSpec } from "../registry";
import { LeaderFollowersCanvas } from "./LeaderFollowersCanvas";

// 8.2 beat 4: a leader and two followers. Write appends the next numbered entry
// to the leader's log and copies it to each follower (300 ms and 800 ms in model
// time, slowed down); Read answers the node's own x; Kill leader stops writes.
// Model: ./model.ts.
export const sysdesignM8LeaderFollowers: CustomCanvasSpec = {
  kind: "custom",
  title: "Send writes, read anywhere, kill the leader",
  purpose: "Tap Write and watch two followers copy the leader's log in order, tap any node to read what it answers, then kill the leader: reads still work, writes stop.",
  limits: "Two followers and made-up copy times of 300 ms and 800 ms, slowed down so you can see them. Promoting a follower is left out on purpose (chapter 8.5).",
  component: LeaderFollowersCanvas,
};
