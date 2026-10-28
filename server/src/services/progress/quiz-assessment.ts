import { isLlmGradedOpenQuestion } from "../../shared/blocks/open-question/schema.js";

export const QUIZ_DETERMINISTIC_WEIGHT = 80;
export const QUIZ_AI_WEIGHT = 20;
export const DEFAULT_QUIZ_PASSING_SCORE = 70;

export type AssessmentBlock = { id: string; type: string; config: unknown };
export type AssessmentResponse = {
  blockId: string;
  status: string;
  score: number | null;
  maxScore: number | null;
};

export type QuizAssessment = {
  score: number;
  maxScore: 100;
  passingScore: number;
  passed: boolean;
  allAttempted: boolean;
  deterministic: { score: number; weight: number; attempted: number; total: number } | null;
  ai: { score: number; weight: number; attempted: number; total: number } | null;
};

function categoryFor(block: AssessmentBlock): "deterministic" | "ai" | null {
  if (["QUIZ", "PREDICT", "CODE"].includes(block.type)) return "deterministic";
  if (block.type === "OPEN_QUESTION" && isLlmGradedOpenQuestion(block.config)) return "ai";
  return null;
}

function categoryScore(blocks: AssessmentBlock[], latest: Map<string, AssessmentResponse>) {
  let points = 0;
  let maximum = 0;
  let attempted = 0;
  for (const block of blocks) {
    const response = latest.get(block.id);
    if (!response || response.status === "DRAFT") continue;
    attempted += 1;
    points += response.score ?? 0;
    maximum += response.maxScore ?? 0;
  }
  return {
    score: maximum > 0 ? Math.round((points / maximum) * 100) : 0,
    attempted,
    total: blocks.length,
  };
}

/**
 * Calculate the chapter grade without allowing AI judgement to dominate it.
 * If a chapter only contains one category, that category is normalized to 100%.
 */
export function calculateQuizAssessment(input: {
  blocks: AssessmentBlock[];
  responses: AssessmentResponse[];
  passingScore?: number | null;
}): QuizAssessment | null {
  const latest = new Map(input.responses.map((response) => [response.blockId, response]));
  const deterministicBlocks = input.blocks.filter((block) => categoryFor(block) === "deterministic");
  const aiBlocks = input.blocks.filter((block) => categoryFor(block) === "ai");
  if (deterministicBlocks.length === 0 && aiBlocks.length === 0) return null;

  const deterministicRaw = deterministicBlocks.length ? categoryScore(deterministicBlocks, latest) : null;
  const aiRaw = aiBlocks.length ? categoryScore(aiBlocks, latest) : null;
  const deterministicWeight = deterministicRaw ? (aiRaw ? QUIZ_DETERMINISTIC_WEIGHT : 100) : 0;
  const aiWeight = aiRaw ? (deterministicRaw ? QUIZ_AI_WEIGHT : 100) : 0;
  const score = Math.round(
    (deterministicRaw?.score ?? 0) * (deterministicWeight / 100) +
    (aiRaw?.score ?? 0) * (aiWeight / 100)
  );
  const allAttempted =
    (!deterministicRaw || deterministicRaw.attempted === deterministicRaw.total) &&
    (!aiRaw || aiRaw.attempted === aiRaw.total);
  const passingScore = Math.max(1, Math.min(100, input.passingScore ?? DEFAULT_QUIZ_PASSING_SCORE));

  return {
    score,
    maxScore: 100,
    passingScore,
    passed: allAttempted && score >= passingScore,
    allAttempted,
    deterministic: deterministicRaw ? { ...deterministicRaw, weight: deterministicWeight } : null,
    ai: aiRaw ? { ...aiRaw, weight: aiWeight } : null,
  };
}
