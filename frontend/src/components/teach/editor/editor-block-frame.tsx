"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronRight, Blocks, MoreHorizontal, Trash2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** Presentation-only folding: fields stay mounted and retain unfinished edits. */
export function EditorBlockFrame({ title, summary, detail, icon: Icon = Blocks, onSave, onRemove, dirty = false, children }: {
  title: string;
  summary?: string;
  detail?: string;
  icon?: LucideIcon;
  onSave?: () => void;
  onRemove?: () => void;
  dirty?: boolean;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const bodyId = useId();

  return (
    <section contentEditable={false} className="editor-block-frame my-3 overflow-hidden rounded-lg border border-border/70 bg-card text-foreground transition-colors focus-within:border-ring/60 hover:border-border">
      <div className="flex items-center gap-1 pr-2">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={bodyId}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${title}`}
        onClick={() => setExpanded(value => !value)}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronRight className={`size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${expanded ? "rotate-90" : ""}`} aria-hidden />
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-5">{title}</span>
          {!expanded && <span className="block truncate text-xs leading-5 text-muted-foreground">{summary?.trim() || "Expand to edit this block"}</span>}
        </span>
        {detail && <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{detail}</span>}
      </button>
      {dirty && onSave && <Button type="button" size="sm" onClick={onSave}>Save block</Button>}
      {onRemove && <DropdownMenu><DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={title + " actions"} />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end"><DropdownMenuItem onClick={onRemove}><Trash2 className="size-4" />Delete block</DropdownMenuItem></DropdownMenuContent>
      </DropdownMenu>}
      </div>
      <div id={bodyId} hidden={!expanded} className="border-t border-border/60 p-4 sm:pl-10">
        {children}
      </div>
    </section>
  );
}
