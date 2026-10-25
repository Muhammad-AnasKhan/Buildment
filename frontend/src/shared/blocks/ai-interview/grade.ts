// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { GradeResult } from "../types";
import type { AiInterviewConfig, AiInterviewPayload } from "./schema";

// An interview is never scored. The Response exists only once a session has
// finished and its feedback is saved (services/ai/interview/service.ts), so a
// response being present is the completion.
export function gradeAiInterview(_config: AiInterviewConfig, _payload: AiInterviewPayload): GradeResult {
  return { score: null, maxScore: null, isCorrect: null, status: "SUBMITTED" };
}
