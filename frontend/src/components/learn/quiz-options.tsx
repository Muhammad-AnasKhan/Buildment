"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizOption = { id: string; label: string };

type QuizOptionsProps = {
  options: QuizOption[];
  selected: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  incorrectOptionIds?: string[];
  correctOptionIds?: string[];
  showAnswerState?: boolean;
};

export function QuizOptions({
  options,
  selected,
  onToggle,
  disabled = false,
  multiple = false,
  incorrectOptionIds = [],
  correctOptionIds = [],
  showAnswerState = false,
}: QuizOptionsProps) {
  const incorrectSet = new Set(incorrectOptionIds);
  const correctSet = new Set(correctOptionIds);

  return (
    <ul className="flex flex-col gap-3" role="listbox" aria-multiselectable={multiple}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const isIncorrect = showAnswerState && incorrectSet.has(option.id);
        const isCorrect = showAnswerState && correctSet.has(option.id);

        return (
          <li key={option.id}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => !disabled && onToggle(option.id)}
              disabled={disabled}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
                !disabled && !isIncorrect && !isCorrect && "border-border bg-card hover:bg-muted/50",
                disabled && !isIncorrect && !isCorrect && "cursor-default border-border bg-card",
                isSelected &&
                  !isIncorrect &&
                  !isCorrect &&
                  !disabled &&
                  "border-foreground/25 bg-muted/60 ring-1 ring-inset ring-foreground/10",
                isIncorrect &&
                  "border-red-500/50 bg-red-500/10 text-foreground dark:border-red-400/45 dark:bg-red-950/35",
                isCorrect &&
                  "border-emerald-500/45 bg-emerald-500/10 dark:border-emerald-400/40 dark:bg-emerald-950/30"
              )}
            >
              <span className="shrink-0" aria-hidden>
                {multiple ? (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-md border-2 transition-colors",
                      isIncorrect && "border-red-500 bg-red-500/20",
                      isCorrect && "border-emerald-600 bg-emerald-500/20",
                      !isIncorrect &&
                        !isCorrect &&
                        (isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background")
                    )}
                  >
                    {isSelected && !isIncorrect && !isCorrect ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
                      isIncorrect && "border-red-500",
                      isCorrect && "border-emerald-600",
                      !isIncorrect && !isCorrect && (isSelected ? "border-foreground" : "border-muted-foreground/40")
                    )}
                  >
                    {isSelected && !isIncorrect && !isCorrect ? (
                      <span className="size-2.5 rounded-full bg-foreground" />
                    ) : null}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 leading-relaxed",
                  isSelected && "font-medium text-foreground",
                  !isSelected && "text-foreground",
                  disabled && !isSelected && !isIncorrect && "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
              {isIncorrect ? (
                <XCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
              ) : null}
              {isCorrect ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
