import type { ComponentType } from "react";
import type { BlockDefinition } from "@buildment/shared/blocks/types";

export type { BlockDefinition, GradeResult } from "@buildment/shared/blocks/types";

// A block's schema, grader and report live in @buildment/shared (the API grades
// with them too). The frontend adds the server component rendered in place of the
// block's JSX tag — see docs/03-blocks-registry.mdx "The registry pattern".
export type BlockRegistryEntry<Config = unknown, Payload = unknown> = BlockDefinition<Config, Payload> & {
  /**
   * Receives only the block id — it fetches and sanitizes its own config
   * server-side, so `Block.config` never travels through MDX source/props
   * (see docs/09-security.mdx).
   */
  Component: ComponentType<{ id: string }>;
};
