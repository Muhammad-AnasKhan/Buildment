import type { GradeResult } from "@/blocks/types";
import type { MustReadConfig, MustReadPayload } from "./schema";

export function gradeMustRead(_config: MustReadConfig, payload: MustReadPayload): GradeResult {
  return {
    score: null,
    maxScore: null,
    isCorrect: payload.complete,
    status: payload.complete ? "SUBMITTED" : "DRAFT",
  };
}
