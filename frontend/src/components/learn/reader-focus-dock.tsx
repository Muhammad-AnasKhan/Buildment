"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReaderFocusDock({ onExitFocus }: { onExitFocus: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-end px-5 sm:bottom-6 sm:px-6">
      <button
        type="button"
        onClick={onExitFocus}
        title="Exit focus mode"
        aria-label="Exit focus mode"
        className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg shadow-foreground/15 transition-colors hover:bg-foreground/90"
      >
        <Minimize2 className="size-4 shrink-0" aria-hidden />
      </button>
    </div>
  );
}

export function FocusModeToggle({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? "Exit focus mode" : "Focus mode — hide bars and read fullscreen"}
      aria-label={active ? "Exit focus mode" : "Enter focus mode"}
      aria-pressed={active}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        active
          ? "bg-foreground text-background hover:bg-foreground/90"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Maximize2 className="size-4" />
    </button>
  );
}
