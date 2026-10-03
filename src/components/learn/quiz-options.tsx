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
    <ul className="divide-y divide-border/80" role="listbox" aria-multiselectable={multiple}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);

        return (
          <li key={option.id}>
            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => !disabled && onToggle(option.id)}
              disabled={disabled}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left text-sm transition-colors",
                !disabled && "hover:bg-muted/55",
                disabled && "cursor-default",
                isSelected &&
                  !disabled &&
                  "bg-muted/70 ring-1 ring-inset ring-foreground/10",
                isSelected && disabled && "bg-muted/30"
              )}
            >
              <span className="shrink-0" aria-hidden>
                {multiple ? (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-md border-2 transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background"
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
                      isSelected ? "border-foreground" : "border-muted-foreground/40"
                    )}
                  >
                  {isSelected ? <span className="size-2.5 rounded-full bg-foreground" /> : null}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 leading-relaxed",
                  isSelected && "font-medium text-foreground",
                  !isSelected && "text-foreground/90",
                  disabled && !isSelected && "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
              {disabled && isSelected ? (
                <CheckCircle2 className="size-4 shrink-0 text-foreground" aria-hidden />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
