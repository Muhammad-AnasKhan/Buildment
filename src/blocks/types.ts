import type { ComponentType } from "react";
import type { z } from "zod";
import type { BlockType, ResponseStatus } from "@/generated/prisma/client";

// Shared shape every block type must implement — see docs/03-blocks-registry.mdx
// "The registry pattern". Adding a block type means implementing this contract
// once, in its own src/blocks/<type>/ folder, and adding one line to registry.ts.

export type GradeResult = {
  score: number | null;
  maxScore: number | null;
  isCorrect: boolean | null;
  status: ResponseStatus;
};

export type BlockRegistryEntry<Config = unknown, Payload = unknown> = {
  type: BlockType;
  schema: z.ZodType<Config>;
  /** Pure function: never touches the database or the network. */
  grade: (config: Config, payload: Payload) => GradeResult;
  /**
   * Server component rendered inside the compiled MDX in place of the block's
   * JSX tag. Receives only the block id — it fetches and sanitizes its own
   * config server-side, so `Block.config` never has to travel through MDX
   * source/props (see docs/09-security.mdx).
   */
  Component: ComponentType<{ id: string }>;
  /** What this block type contributes to reports — stubbed until M6. */
  report: (config: Config) => Record<string, unknown>;
};
