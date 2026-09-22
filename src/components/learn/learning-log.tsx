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
import type { LearningLogAnswers } from "@/lib/learning-log";

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
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-800"
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
    border: "border-violet-200",
    headerBg: "bg-gradient-to-r from-violet-600 to-violet-700",
    headerText: "text-white",
    subText: "text-violet-100",
    iconBg: "bg-white/15",
    bodyBg: "bg-gradient-to-b from-violet-50/40 to-card dark:from-violet-950/25 dark:to-card",
    progress: "bg-violet-100",
    progressFill: "bg-violet-600",
    badge: "bg-white/20 text-white",
    questionRing: "focus-visible:ring-violet-500/30",
    questionBorder: "border-violet-100 focus-visible:border-violet-400",
  },
  default: {
    border: "border-border",
    headerBg: "bg-muted/50 border-b border-border",
    headerText: "text-foreground",
    subText: "text-muted-foreground",
    iconBg: "bg-violet-500/15",
    bodyBg: "bg-card",
    progress: "bg-muted",
    progressFill: "bg-violet-500",
    badge: "bg-muted text-muted-foreground",
    questionRing: "focus-visible:ring-violet-500/30",
    questionBorder: "border-border focus-visible:border-violet-400",
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
    <li className="rounded-xl border border-border bg-muted/30 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
            answered
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
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
            placeholder="Write your answer in your own words…"
            rows={4}
            ariaLabel={question.title}
            className={cn(
              "placeholder:text-neutral-400",
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
  questions: LearningLogQuestionData[];
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const ctx = useContext(LearningLogContext);
  const chapterId = ctx?.chapterId;
  const styles = VARIANT_STYLES[variant];

  const [answers, setAnswers] = useState<LearningLogAnswers>(() => {
    const initial: LearningLogAnswers = {};
    for (const q of questions) {
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
      for (const q of questions) {
        if (ctx.initialAnswers[q.id] !== undefined) {
          next[q.id] = ctx.initialAnswers[q.id]!;
        }
      }
      return next;
    });
  }, [ctx?.initialAnswers, questions]);

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
    () => questions.filter((q) => answers[q.id]?.trim()).length,
    [questions, answers]
  );
  const total = questions.length;
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
        "not-prose my-8 overflow-hidden rounded-2xl border shadow-sm",
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
                className={cn("size-5", variant === "gate" ? "text-white" : "text-violet-600")}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  variant === "gate" ? styles.subText : "text-violet-600"
                )}
              >
                {variant === "gate" ? "Gate learning log" : "Learning log"}
              </p>
              <p className={cn("mt-0.5 text-base font-semibold leading-snug", styles.headerText)}>
                {title.replace(/^learning log\s*[—–-]?\s*/i, "") || title}
              </p>
              {instruction ? (
                <p className={cn("mt-1.5 text-sm leading-relaxed", styles.subText)}>
                  {parseInlineMarkdown(instruction)}
                </p>
              ) : (
                <p className={cn("mt-1 text-sm", styles.subText)}>
                  Answer in your own words — saved to your enrollment. Use the mic button to dictate if
                  your browser supports it.
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
            variant === "gate" ? styles.subText : "text-neutral-500"
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
        {questions.map((question, index) => (
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
        <div className="border-t border-emerald-100 bg-emerald-50/80 px-5 py-3.5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" />
            All questions answered — your learning log is complete for this chapter.
          </p>
        </div>
      ) : null}
    </div>
  );
}
