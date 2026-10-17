"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/** Keep task-critical fields visible; optional settings remain mounted. */
export function EditorFields({ children, advanced, revealSettings = false }: {
  children: ReactNode;
  advanced: readonly string[];
  revealSettings?: boolean;
}) {
  const fields = Children.toArray(children);
  const isAdvanced = (child: ReactNode) => isValidElement<{ "data-field"?: string }>(child) && advanced.includes(child.props["data-field"] ?? "");
  const secondary = fields.filter(isAdvanced);
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">{fields.filter(child => !isAdvanced(child))}</div>
    {secondary.length > 0 && <details className="group/editor-settings border-t border-border/60 pt-3" open={revealSettings || undefined}>
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded px-1 py-1 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-3.5 transition-transform group-open/editor-settings:rotate-90" aria-hidden />Settings
      </summary>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{secondary}</div>
    </details>}
  </div>;
}
