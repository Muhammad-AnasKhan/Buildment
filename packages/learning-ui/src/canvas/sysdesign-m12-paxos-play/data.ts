import type { CustomCanvasSpec } from "../registry";
import { PaxosPlayCanvas } from "./PaxosPlayCanvas";

// 12.7 ("Paxos and multi-leader setups"), beat 2 "Two proposers, three acceptors".
// Model: models/paxos-play.ts.
export const sysdesignM12PaxosPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Two proposers, three acceptors",
  purpose: "Send Prepare and Accept messages from two proposers to chosen acceptors and watch a chosen value force every later proposal to the same value.",
  limits:
    "One decision, three acceptors and two proposers, with proposal numbers fixed in advance (P1 uses 1, 3 and 5; P2 uses 2, 4 and 6). Messages never get lost or delayed by themselves: you choose which acceptors hear each one. Real Paxos repeats this for every log slot, retries after random waits and often elects one distinguished proposer.",
  component: PaxosPlayCanvas,
};
