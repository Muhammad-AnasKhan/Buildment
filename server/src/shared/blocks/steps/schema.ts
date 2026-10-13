import { z } from "zod";

// Server-only config for a <Steps> block — rendered as a static numbered guide
// in MDX content. Unlike QUIZ or OPEN_QUESTION, Steps has no submission or
// grading; it is purely presentational.
//
// The Steps block is configured once per course content file and rendered
// entirely from its MDX children (<Step> tags). There is no separate DB config
// to fetch — the block's schema is minimal and the rendering is driven by the
// MDX AST, not by a config object.
export const StepsConfigSchema = z.object({
  title: z.string().optional(),
});

export type StepsConfig = z.infer<typeof StepsConfigSchema>;

// Steps blocks are static — no user payload, no grading.
export const StepsPayloadSchema = z.object({});

export type StepsPayload = z.infer<typeof StepsPayloadSchema>;
