import type { GradeResult } from "../types.js";
import type { MustReadConfig, MustReadPayload } from "./schema.js";

export function gradeMustRead(_config: MustReadConfig, payload: MustReadPayload): GradeResult {
  return {
    score: null,
    maxScore: null,
    isCorrect: payload.complete,
    status: payload.complete ? "SUBMITTED" : "DRAFT",
  };
}
