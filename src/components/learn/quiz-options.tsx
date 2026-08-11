"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizOption = { id: string; label: string };

type QuizOptionsProps = {
  options: QuizOption[];
  selected: string[];
  onToggle: (optionId: string) => void;
  disabled?: boolean;
  multiple?: boolean;
};

export function QuizOptions({
  options,
  selected,
  onToggle,
  disabled = false,
  multiple = false,
}: QuizOptionsProps) {
  return (
    <div className="divide-y divide-neutral-100">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => !disabled && onToggle(option.id)}
            disabled={disabled}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 text-left text-sm transition-colors sm:px-6",
              !disabled && "hover:bg-neutral-50",
              disabled && "cursor-default",
              isSelected && !disabled && "bg-indigo-50/50"
            )}
          >
            <span className="shrink-0">
              {multiple ? (
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded border-2 transition-colors",
                    isSelected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-neutral-300 bg-white"
                  )}
                >
                  {isSelected ? (
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
                    isSelected ? "border-indigo-600" : "border-neutral-300"
                  )}
                >
                  {isSelected ? <span className="size-2 rounded-full bg-indigo-600" /> : null}
                </span>
              )}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 leading-relaxed",
                isSelected && !disabled && "font-medium text-neutral-900",
                !isSelected && !disabled && "text-neutral-700",
                disabled && "text-neutral-700"
              )}
            >
              {option.label}
            </span>
            {disabled && isSelected ? (
              <CheckCircle2 className="size-4 shrink-0 text-indigo-600" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
