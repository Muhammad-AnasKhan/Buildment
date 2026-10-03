"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircle2, CloudOff, Loader2, NotebookPen, Save } from "lucide-react";
import { AnswerTextareaWithMic } from "@/components/learn/answer-textarea-with-mic";
import { cn } from "@/lib/utils";
import { saveLearningLogAnswers } from "@/server/actions/learning-log";
import {
  parseLearningLogQuestions,
  type LearningLogAnswers,
} from "@/lib/learning-log";

export type LearningLogQuestionData = {
  id: string;
  title: string;
  hint?: string;
};

type LearningLogContextValue = {
  chapterId: string;
  initialAnswers: LearningLogAnswers;
};

const LearningLogContext = createContext<LearningLogContextValue | null>(null);

export function LearningLogProvider({
  chapterId,
  initialAnswers,
  children,
}: {
  chapterId: string;
  initialAnswers: LearningLogAnswers;
  children: React.ReactNode;
}) {
  return (
    <LearningLogContext.Provider value={{ chapterId, initialAnswers }}>
      {children}
    </LearningLogContext.Provider>
  );
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

const VARIANT_STYLES = {
  gate: {
    border: "border-border",
    headerBg: "border-b border-border bg-muted/35",
    headerText: "text-foreground",
    subText: "text-muted-foreground",
    iconBg: "border border-border bg-background",
    bodyBg: "bg-card",
    progress: "bg-muted",
    progressFill: "bg-foreground",
    badge: "bg-muted text-muted-foreground",
    questionRing: "focus-visible:ring-foreground/15",
    questionBorder: "border-border focus-visible:border-foreground/40",
  },
  default: {
    border: "border-border",
    headerBg: "bg-muted/50 border-b border-border",
    headerText: "text-foreground",
    subText: "text-muted-foreground",
    iconBg: "border border-border bg-background",
    bodyBg: "bg-card",
    progress: "bg-muted",
    progressFill: "bg-foreground",
    badge: "bg-muted text-muted-foreground",
    questionRing: "focus-visible:ring-foreground/15",
    questionBorder: "border-border focus-visible:border-foreground/40",
  },
} as const;

function LearningLogQuestion({
  index,
  question,
  value,
  onChange,
  styles,
}: {
  index: number;
  question: LearningLogQuestionData;
  value: string;
  onChange: (text: string) => void;
  styles: (typeof VARIANT_STYLES)[keyof typeof VARIANT_STYLES];
}) {
  const answered = value.trim().length > 0;

  return (
    <li className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold tabular-nums",
            answered
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900"
              : "bg-muted text-muted-foreground"
          )}
        >
          {answered ? <CheckCircle2 className="size-4" aria-hidden /> : index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[15px] font-semibold leading-snug text-foreground">
              {question.title}
            </p>
            {question.hint ? (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{question.hint}</p>
            ) : null}
          </div>
          <AnswerTextareaWithMic
            value={value}
            onChange={onChange}
            enableSpeech
            placeholder="Write what you learned…"
            rows={4}
            ariaLabel={question.title}
            className={cn(
              "placeholder:text-muted-foreground/70",
              styles.questionBorder,
              styles.questionRing
            )}
          />
        </div>
      </div>
    </li>
  );
}

export function LearningLog({
  title,
  instruction,
  questions,
  variant = "default",
}: {
  title: string;
  instruction?: string;
  questions: LearningLogQuestionData[] | string;
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const ctx = useContext(LearningLogContext);
  // Old snapshots may contain the editor's quoted JSON form. Normalizing at
  // the boundary prevents a malformed prop from crashing `.filter()`/`.map()`.
  const normalizedQuestions = useMemo(() => parseLearningLogQuestions(questions), [questions]);
  const chapterId = ctx?.chapterId;
  const styles = VARIANT_STYLES[variant];

  const [answers, setAnswers] = useState<LearningLogAnswers>(() => {
    const initial: LearningLogAnswers = {};
    for (const q of normalizedQuestions) {
      initial[q.id] = ctx?.initialAnswers[q.id] ?? "";
    }
    return initial;
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<LearningLogAnswers>({});

  useEffect(() => {
    if (!ctx?.initialAnswers) return;
    setAnswers((prev) => {
      const next = { ...prev };
      for (const q of normalizedQuestions) {
        if (ctx.initialAnswers[q.id] !== undefined) {
          next[q.id] = ctx.initialAnswers[q.id]!;
        }
      }
      return next;
    });
  }, [ctx?.initialAnswers, normalizedQuestions]);

  const flushSave = useCallback(async () => {
    if (!chapterId) return;
    const payload = { ...pendingRef.current };
    pendingRef.current = {};
    if (Object.keys(payload).length === 0) return;

    setSaveStatus("saving");
    const result = await saveLearningLogAnswers({ chapterId, answers: payload });
    if (result.ok) {
      setSaveStatus("saved");
      setLastSavedAt(result.savedAt);
    } else {
      setSaveStatus("error");
      pendingRef.current = { ...payload, ...pendingRef.current };
    }
  }, [chapterId]);

  const scheduleSave = useCallback(
    (questionId: string, text: string) => {
      pendingRef.current[questionId] = text;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void flushSave();
      }, 900);
    },
    [flushSave]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void flushSave();
    };
  }, [flushSave]);

  const updateAnswer = useCallback(
    (questionId: string, text: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: text }));
      if (chapterId) scheduleSave(questionId, text);
    },
    [chapterId, scheduleSave]
  );

  const answeredCount = useMemo(
    () => normalizedQuestions.filter((q) => answers[q.id]?.trim()).length,
    [normalizedQuestions, answers]
  );
  const total = normalizedQuestions.length;
  const progress = total > 0 ? (answeredCount / total) * 100 : 0;
  const allAnswered = total > 0 && answeredCount === total;

  const saveLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved to your account"
        : saveStatus === "error"
          ? "Could not save — retrying on next edit"
          : chapterId
            ? "Answers save automatically"
            : "Sign in to save answers";

  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-xl border shadow-[0_1px_2px_rgb(0_0_0/0.04)]",
        styles.border,
        styles.bodyBg
      )}
      data-learning-log
      data-learning-log-variant={variant}
    >
      <div className={cn("px-5 py-4", styles.headerBg)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                styles.iconBg
              )}
            >
              <NotebookPen
                className="size-5 text-muted-foreground"
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  styles.subText
                )}
              >
                What you learned
              </p>
              <p className={cn("mt-0.5 text-base font-semibold leading-snug", styles.headerText)}>
                {title.replace(/^(learning log|reflect on your work)\s*[—–-]?\s*/i, "") || "Share what you learned"}
              </p>
              {instruction ? (
                <p className={cn("mt-1.5 text-sm leading-relaxed", styles.subText)}>
                  {parseInlineMarkdown(instruction)}
                </p>
              ) : (
                <p className={cn("mt-1 text-sm", styles.subText)}>
                  Capture the decisions, discoveries, and proof from this lesson. Your notes are saved privately.
                </p>
              )}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              styles.badge
            )}
          >
            {answeredCount}/{total}
          </span>
        </div>

        <div className={cn("mt-4 h-1.5 overflow-hidden rounded-full", styles.progress)}>
          <div
            className={cn("h-full rounded-full transition-all duration-300 ease-out", styles.progressFill)}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs",
            "text-muted-foreground"
          )}
        >
          {saveStatus === "saving" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : saveStatus === "error" ? (
            <CloudOff className="size-3.5 text-amber-500" aria-hidden />
          ) : (
            <Save className="size-3.5 opacity-70" aria-hidden />
          )}
          <span>{saveLabel}</span>
          {lastSavedAt && saveStatus === "saved" ? (
            <span className="opacity-70">
              · {new Date(lastSavedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
          ) : null}
        </div>
      </div>

      <ol className="space-y-3 p-4 sm:p-5">
        {normalizedQuestions.map((question, index) => (
          <LearningLogQuestion
            key={question.id}
            index={index}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(text) => updateAnswer(question.id, text)}
            styles={styles}
          />
        ))}
      </ol>

      {allAnswered ? (
        <div className="border-t border-emerald-200/80 bg-emerald-50/80 px-5 py-3.5 dark:border-emerald-400/25 dark:bg-emerald-500/10">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-100">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            Reflection saved — you have captured what you learned in this chapter.
          </p>
        </div>
      ) : null}
    </div>
  );
}
