// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { GradeResult } from "../types";
import type { MustReadConfig, MustReadPayload } from "./schema";

export function gradeMustRead(_config: MustReadConfig, payload: MustReadPayload): GradeResult {
  return {
    score: null,
    maxScore: null,
    isCorrect: payload.complete,
    status: payload.complete ? "SUBMITTED" : "DRAFT",
  };
}
