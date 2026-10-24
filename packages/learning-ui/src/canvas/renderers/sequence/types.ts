import type { Tone } from "../../primitives/tones";

export type SequenceActor = {
  name: string;
  /** Short second line under the name, for example a role or address. */
  sub?: string;
};

export type SequenceStep = {
  /** Index into actors. from === to draws a loop: work inside that actor. */
  from: number;
  to: number;
  /** Drawn on the arrow. Keep it under about 18 characters so it fits a phone. */
  label: string;
  /** Heading of the note under the diagram. */
  title: string;
  note: string;
  /** Mono chips under the note: fields, headers, status codes. */
  chips?: string[];
  /** Colour of this step. Defaults to the accent; use good, warn or bad only when the step means it. */
  tone?: Tone;
  /** Short outcome badge next to the title, for example "200 OK" or "409 Conflict". */
  outcome?: string;
};

export type SequenceSpec = {
  kind: "sequence";
  title: string;
  /** One sentence shown under the title. */
  purpose: string;
  /** One sentence describing the whole flow, for screen readers. */
  summary: string;
  /** Two to four lanes, left to right. */
  actors: SequenceActor[];
  steps: SequenceStep[];
  tryThis?: string[];
  limits: string;
};
