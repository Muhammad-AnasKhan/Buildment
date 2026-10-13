import "server-only";
import { CodeConfigSchema } from "@/blocks/code/schema";
import { OpenQuestionConfigSchema } from "@/blocks/open-question/schema";
import { PredictConfigSchema } from "@/blocks/predict/schema";
import { QuizConfigSchema } from "@/blocks/quiz/schema";

/** Mentor-facing answer text. Does not include correct answers, rubrics, or hidden tests. */
export function submissionPreview(
  type: string,
  config: unknown,
  payload: unknown
): { prompt: string | null; answer: string } {
  if (type === "QUIZ" || type === "TEST") {
    const cfg = QuizConfigSchema.safeParse(config);
    const selected = readStringList(payload, "selected");
    const labels = cfg.success
      ? selected.map((id) => cfg.data.options.find((option) => option.id === id)?.label ?? "Selected choice")
      : [];
    return {
      prompt: cfg.success ? cfg.data.prompt : null,
      answer: labels.length > 0 ? labels.join(", ") : "No choice recorded",
    };
  }

  if (type === "PREDICT") {
    const cfg = PredictConfigSchema.safeParse(config);
    const selected = readString(payload, "selected");
    const label =
      cfg.success && selected
        ? (cfg.data.options.find((option) => option.id === selected)?.label ?? "Selected choice")
        : null;
    return {
      prompt: cfg.success ? cfg.data.prompt : null,
      answer: label ?? "No choice recorded",
    };
  }

  if (type === "OPEN_QUESTION") {
    const cfg = OpenQuestionConfigSchema.safeParse(config);
    const text = readString(payload, "text");
    const url = readString(payload, "url");
    const parts = [text, url].filter((part) => part.length > 0);
    return {
      prompt: cfg.success ? cfg.data.prompt : null,
      answer: parts.join("\n\n") || "Empty answer",
    };
  }

  if (type === "CODE") {
    const cfg = CodeConfigSchema.safeParse(config);
    const source = readString(payload, "source");
    return {
      prompt: cfg.success ? cfg.data.prompt : null,
      answer: source || "No code submitted",
    };
  }

  return { prompt: null, answer: "Submitted" };
}

function readString(payload: unknown, key: string): string {
  if (!payload || typeof payload !== "object") return "";
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function readStringList(payload: unknown, key: string): string[] {
  if (!payload || typeof payload !== "object") return [];
  const value = (payload as Record<string, unknown>)[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
