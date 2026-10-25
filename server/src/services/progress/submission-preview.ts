import { AI_INTERVIEW_FLAG_LABELS, AI_INTERVIEW_FOCUS_LABELS, AiInterviewConfigSchema, AiInterviewPayloadSchema } from "../../shared/blocks/ai-interview/schema.js";
import { CodeConfigSchema } from "../../shared/blocks/code/schema.js";
import { OpenQuestionConfigSchema } from "../../shared/blocks/open-question/schema.js";
import { PredictConfigSchema } from "../../shared/blocks/predict/schema.js";
import { QuizConfigSchema } from "../../shared/blocks/quiz/schema.js";

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

  if (type === "AI_INTERVIEW") return aiInterviewPreview(config, payload);

  return { prompt: null, answer: "Submitted" };
}

/** The transcript then the feedback, as plain text a mentor can read in the existing report. */
function aiInterviewPreview(config: unknown, payload: unknown): { prompt: string | null; answer: string } {
  const cfg = AiInterviewConfigSchema.safeParse(config);
  const prompt = cfg.success ? cfg.data.title : null;
  const parsed = AiInterviewPayloadSchema.safeParse(payload);
  if (!parsed.success) return { prompt, answer: "Interview finished" };
  const { transcript, feedback, turns } = parsed.data;
  const lines = transcript.map((turn) => `${turn.role === "interviewer" ? "Interviewer" : "Learner"}: ${turn.content}`);
  const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
  const sections = [
    `Interview transcript (${turns} ${turns === 1 ? "answer" : "answers"})`,
    lines.join("\n\n"),
    `Strengths\n${bullets(feedback.strengths)}`,
    `Weaknesses and fixes\n${bullets(feedback.weaknesses.map((item) => `${item.point} Fix: ${item.fix}`))}`,
    ...(feedback.focusNotes.length > 0
      ? [`Notes by focus area\n${bullets(feedback.focusNotes.map((item) => `${AI_INTERVIEW_FOCUS_LABELS[item.focus]}: ${item.note}`))}`]
      : []),
    ...(feedback.flags.length > 0
      ? [`Flags\n${bullets(feedback.flags.map((item) => `${AI_INTERVIEW_FLAG_LABELS[item.name]}: "${item.quote}"`))}`]
      : []),
    `Next steps\n${feedback.nextSteps.map((item, index) => `${index + 1}. ${item}`).join("\n")}`,
  ];
  return { prompt, answer: sections.join("\n\n") };
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
