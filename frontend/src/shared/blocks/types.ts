// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { z } from "zod";
import type { BlockType, ResponseStatus } from "../domain/enums";

// The runtime-agnostic half of a block type: what both the API (grading, progress,
// reports) and the UI (rendering, editing) need to agree on. The frontend extends
// this with the React component — see frontend/src/blocks/types.ts and
// docs/03-blocks-registry.mdx.

export type GradeResult = {
  score: number | null;
  maxScore: number | null;
  isCorrect: boolean | null;
  status: ResponseStatus;
};

export type BlockReport = {
  type: string;
  title: string;
  summary: string;
  details: unknown[];
} & Record<string, unknown>;

export type BlockDefinition<Config = unknown, Payload = unknown> = {
  type: BlockType;
  /** Schema revision for persisted config. Increment only with a migration. */
  version: number;
  /** Presentation blocks never contribute a response; assessments do. */
  behavior: "presentation" | "assessment";
  /** Whether a required instance can prevent chapter completion. */
  progress: "none" | "completion" | "review";
  schema: z.ZodType<Config>;
  /** Pure function: never touches the database or the network. */
  grade: (config: Config, payload: Payload) => GradeResult;
  /** What this block type contributes to reports. */
  report: (config: Config) => Record<string, unknown>;
};

export const NO_GRADE: GradeResult = { score: null, maxScore: null, isCorrect: null, status: "DRAFT" };
