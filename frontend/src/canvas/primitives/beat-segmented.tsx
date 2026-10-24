"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FOCUS_RING } from "./tones";

// A row of pills for a choice with three or more options (BeatChoice holds
// exactly two). One option is always selected. Same 44px pill look as
// BeatChoice, wraps on a phone, and is a real radio group for keyboards and
// screen readers.

const PILL = "h-11 rounded-full px-4 text-sm font-semibold sm:h-10";
const PRESSED = "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-400 dark:text-blue-950";

type Option<T extends string> = { id: T; label: string };

type BeatSegmentedProps<T extends string> = {
  /** What the row chooses. Shown before the pills and used as the group name. */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function BeatSegmented<T extends string>({ label, options, value, onChange }: BeatSegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex w-full flex-wrap items-center gap-1.5">
      <span className="mr-1 w-11 text-xs font-semibold text-muted-foreground" aria-hidden>{label}</span>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.id)}
            className={cn(buttonVariants({ variant: selected ? "default" : "outline" }), PILL, selected && PRESSED, FOCUS_RING)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
