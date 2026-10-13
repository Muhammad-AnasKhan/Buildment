import { z } from "zod";

export const CodeTestSchema = z.object({
  name: z.string(),
  /** Server-only test script — runs in a sandbox after the learner's code. */
  code: z.string(),
});

export const CodeConfigSchema = z.object({
  /** complete = fill in marked sections; implement = write the function body. */
  mode: z.enum(["complete", "implement"]).default("implement"),
  language: z.enum(["javascript"]).default("javascript"),
  prompt: z.string(),
  starterCode: z.string(),
  filename: z.string().optional(),
  hints: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  allowRetry: z.boolean().default(true),
  /** Server-only reference solution — revealed after a passing submission. */
  solution: z.string().optional(),
  /** Server-only automated checks. */
  tests: z.array(CodeTestSchema).min(1),
});

export type CodeConfig = z.infer<typeof CodeConfigSchema>;

export type SanitizedCodeConfig = Omit<CodeConfig, "tests" | "solution"> & {
  testCount: number;
};

export const CodePayloadSchema = z.object({
  source: z.string(),
});

export type CodePayload = z.infer<typeof CodePayloadSchema>;
