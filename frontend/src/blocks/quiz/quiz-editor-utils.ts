import type { QuizConfig } from "./schema";

export type QuizOptionDraft = { id: string; label: string };

export function normalizeQuizOptions(raw: unknown): QuizOptionDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((opt, index) => {
    if (typeof opt === "string") {
      return { id: `opt-${index}`, label: opt };
    }
    if (opt && typeof opt === "object") {
      const row = opt as { id?: string; label?: string };
      return {
        id: row.id?.trim() || `opt-${index}`,
        label: row.label?.trim() ?? "",
      };
    }
    return { id: `opt-${index}`, label: String(opt) };
  });
}

export function normalizeCorrectOptionIds(raw: unknown, options: QuizOptionDraft[]): string[] {
  const ids = new Set(options.map((opt) => opt.id));
  if (!Array.isArray(raw)) return [];
  return raw
    .map(String)
    .filter((id) => ids.has(id));
}

export function defaultQuizDraft(): {
  quizType: QuizConfig["quizType"];
  prompt: string;
  options: QuizOptionDraft[];
  correctOptionIds: string[];
  explanation: string;
  allowRetry: boolean;
} {
  return {
    quizType: "single",
    prompt: "",
    options: [
      { id: "opt-0", label: "Option A" },
      { id: "opt-1", label: "Option B" },
    ],
    correctOptionIds: ["opt-0"],
    explanation: "",
    allowRetry: true,
  };
}

export function quizDraftFromConfig(config: unknown) {
  const draft = defaultQuizDraft();
  if (!config || typeof config !== "object") return draft;
  const row = config as Partial<QuizConfig>;
  draft.quizType = row.quizType ?? draft.quizType;
  draft.prompt = row.prompt ?? draft.prompt;
  draft.options = normalizeQuizOptions(row.options);
  if (draft.options.length < 2) {
    draft.options = defaultQuizDraft().options;
  }
  draft.correctOptionIds = normalizeCorrectOptionIds(row.correctOptionIds, draft.options);
  if (draft.correctOptionIds.length === 0 && draft.options[0]) {
    draft.correctOptionIds = [draft.options[0].id];
  }
  draft.explanation = row.explanation ?? "";
  draft.allowRetry = row.allowRetry ?? true;
  return draft;
}

export function quizDraftFromJsxProperties(properties: Record<string, string>) {
  const draft = defaultQuizDraft();
  if (properties.quizType === "single" || properties.quizType === "multiple" || properties.quizType === "true-false") {
    draft.quizType = properties.quizType;
  }
  draft.prompt = properties.prompt || properties.question || draft.prompt;
  if (properties.options) {
    try {
      draft.options = normalizeQuizOptions(JSON.parse(properties.options));
    } catch {
      draft.options = normalizeQuizOptions(parseJsxExpressionLoose(properties.options));
    }
  }
  if (properties.correctOptionIds) {
    try {
      draft.correctOptionIds = normalizeCorrectOptionIds(
        JSON.parse(properties.correctOptionIds),
        draft.options
      );
    } catch {
      draft.correctOptionIds = normalizeCorrectOptionIds(
        parseJsxExpressionLoose(properties.correctOptionIds),
        draft.options
      );
    }
  }
  if (properties.explanation) draft.explanation = properties.explanation;
  if (properties.allowRetry) {
    draft.allowRetry =
      properties.allowRetry === "true" ||
      properties.allowRetry === "1" ||
      (() => {
        try {
          return Boolean(JSON.parse(properties.allowRetry));
        } catch {
          return properties.allowRetry !== "false";
        }
      })();
  }
  if (draft.correctOptionIds.length === 0 && draft.options[0]) {
    draft.correctOptionIds = [draft.options[0].id];
  }
  return draft;
}

function parseJsxExpressionLoose(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function quizDraftToJsxProperties(input: {
  id?: string;
  draft: ReturnType<typeof defaultQuizDraft>;
}): Record<string, string> {
  const { draft, id } = input;
  const values: Record<string, string> = {
    quizType: draft.quizType,
    prompt: draft.prompt,
    options: JSON.stringify(draft.options),
    correctOptionIds: JSON.stringify(draft.correctOptionIds),
    explanation: draft.explanation,
    allowRetry: JSON.stringify(Boolean(draft.allowRetry)),
  };
  if (id) values.id = id;
  return values;
}

export function quizDraftToConfig(draft: ReturnType<typeof defaultQuizDraft>): QuizConfig {
  return {
    quizType: draft.quizType,
    prompt: draft.prompt.trim(),
    options: draft.options.filter((opt) => opt.label.trim()).map((opt) => ({
      id: opt.id,
      label: opt.label.trim(),
    })),
    correctOptionIds: draft.correctOptionIds,
    explanation: draft.explanation.trim() || undefined,
    allowRetry: draft.allowRetry,
  };
}
