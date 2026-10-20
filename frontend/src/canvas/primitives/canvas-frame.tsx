import type { ReactNode } from "react";
import { LearnPanelShell } from "@/components/learn/content-blocks/learn-panel-shell";

type CanvasFrameProps = {
  eyebrow: "Walkthrough" | "Explore";
  title: string;
  /** One sentence: what this shows and why it matters. */
  purpose: string;
  children: ReactNode;
};

/** The panel every canvas sits in, so they all read as one family in the reader. */
export function CanvasFrame({ eyebrow, title, purpose, children }: CanvasFrameProps) {
  return (
    <LearnPanelShell eyebrow={eyebrow} title={title} subtitle={purpose} contentClassName="p-4 sm:p-6">
      {children}
    </LearnPanelShell>
  );
}

type CanvasNotesProps = {
  tryThis?: string[];
  /** What the model leaves out. Every canvas states its limits. */
  limits: string;
};

/** "Try this" experiments and the limits of the model, under the canvas. */
export function CanvasNotes({ tryThis, limits }: CanvasNotesProps) {
  return (
    <div className="space-y-4 border-t border-border pt-4 text-sm leading-relaxed">
      {tryThis && tryThis.length > 0 ? (
        <div>
          <h4 className="font-semibold text-foreground">Try this</h4>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-foreground/85">
            {tryThis.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div>
        <h4 className="font-semibold text-foreground">Limits of the model</h4>
        <p className="mt-1 text-muted-foreground">{limits}</p>
      </div>
    </div>
  );
}

/** Mono chips under a step note: field names, status codes, key values. */
export function Chips({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Key details">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
