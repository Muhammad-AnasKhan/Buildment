// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { CodeConfig } from "./schema";

export function reportCode(config: CodeConfig) {
  return {
    type: "CODE",
    title: "Code exercise",
    summary: config.prompt,
    details: [{ mode: config.mode, language: config.language }],
  };
}
