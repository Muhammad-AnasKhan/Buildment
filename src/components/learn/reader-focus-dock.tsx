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
        className="pointer-events-auto inline-flex size-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 transition-colors hover:bg-neutral-800"
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
          ? "bg-neutral-900 text-white hover:bg-neutral-800"
          : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
      )}
    >
      <Maximize2 className="size-4" />
    </button>
  );
}
