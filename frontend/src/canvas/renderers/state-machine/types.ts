import type { Tone } from "../../primitives/tones";

export type MachineState = {
  id: string;
  name: string;
  /** Short second line, for example what is true in this state. */
  sub?: string;
  /** Grid position. Columns 0 to 2, rows 0 to 2, so a phone can show it whole. */
  col: number;
  row: number;
};

export type MachineEdge = {
  from: string;
  to: string;
  /** Drawn on the edge. Keep it under about 14 characters so it fits a phone. */
  label: string;
  /**
   * "rejected" draws a request the machine refuses: the state does not change.
   * Use it on a loop (from === to) to show what the server says no to.
   */
  kind?: "transition" | "rejected";
};

export type MachineStep = {
  /** The state to light up. */
  state: string;
  /** Index into edges: the transition this step is about, if any. */
  edge?: number;
  title: string;
  note: string;
  chips?: string[];
  tone?: Tone;
  outcome?: string;
};

export type StateMachineSpec = {
  kind: "state-machine";
  title: string;
  purpose: string;
  /** One sentence describing the whole lifecycle, for screen readers. */
  summary: string;
  states: MachineState[];
  edges: MachineEdge[];
  steps: MachineStep[];
  tryThis?: string[];
  limits: string;
};
