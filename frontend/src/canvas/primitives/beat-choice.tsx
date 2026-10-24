"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { FOCUS_RING } from "./tones";

// Two small controls for the strip under a beat picture, next to BeatButton:
// a pair of real buttons that act as a switch (one is always pressed), and a
// plain action button that can be disabled. Same 44px pill look as BeatButton.

const PILL = "h-11 rounded-full px-4 text-sm font-semibold sm:h-10";
const PRESSED = "bg-blue-600 text-white hover:bg-blue-600/90 dark:bg-blue-400 dark:text-blue-950";

type Option<T extends string> = { id: T; label: string };

type BeatChoiceProps<T extends string> = {
  /** What the pair chooses, for screen readers and as the group name. */
  label: string;
  options: readonly [Option<T>, Option<T>];
  value: T;
  onChange: (id: T) => void;
};

export function BeatChoice<T extends string>({ label, options, value, onChange }: BeatChoiceProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center gap-1.5">
      {options.map((o) => {
        const pressed = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(o.id)}
            className={cn(buttonVariants({ variant: pressed ? "default" : "outline" }), PILL, pressed && PRESSED, FOCUS_RING)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A 44px pill action button that can be disabled. */
export function BeatActionButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn(buttonVariants({ variant: "outline" }), PILL, "disabled:opacity-45", FOCUS_RING)}>
      {children}
    </button>
  );
}
