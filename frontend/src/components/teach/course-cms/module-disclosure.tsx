"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModuleDisclosure({
  moduleId,
  number,
  title,
  chapterCount,
  publishedCount,
  actions,
  children,
}: {
  moduleId: string;
  number: number;
  title: string;
  chapterCount: number;
  publishedCount: number;
  actions: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `module-chapters-${moduleId}`;

  return (
    <section className="overflow-visible rounded-xl border bg-card shadow-xs">
      <div className="flex flex-col gap-2 rounded-xl bg-muted/25 p-2 sm:flex-row sm:items-center sm:gap-3 sm:p-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="group flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring sm:px-2"
        >
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")} aria-hidden />
          <span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background font-mono text-xs font-medium text-muted-foreground">
            {String(number).padStart(2, "0")}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {chapterCount} chapter{chapterCount === 1 ? "" : "s"} · {publishedCount} published
            </span>
          </span>
          <span className="hidden shrink-0 text-xs font-medium text-muted-foreground group-hover:text-foreground md:inline">
            {open ? "Hide chapters" : "Show chapters"}
          </span>
        </button>
        <div className="flex flex-wrap items-center gap-1 border-t px-1 pt-2 sm:shrink-0 sm:border-t-0 sm:px-0 sm:pt-0">
          {actions}
        </div>
      </div>
      <div id={panelId} hidden={!open} className="border-t">{open ? children : null}</div>
    </section>
  );
}
