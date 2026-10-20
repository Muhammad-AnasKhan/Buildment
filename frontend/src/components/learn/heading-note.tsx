"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { saveHeadingNote } from "@/server/actions/heading-note";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeadingNotesContext = createContext<{
  chapterId: string;
  notes: Record<string, string>;
} | null>(null);

export function HeadingNotesProvider({
  chapterId,
  notes,
  children,
}: {
  chapterId: string;
  notes: Record<string, string>;
  children: React.ReactNode;
}) {
  return <HeadingNotesContext.Provider value={{ chapterId, notes }}>{children}</HeadingNotesContext.Provider>;
}

export function HeadingNoteButton({ headingId }: { headingId: string }) {
  const context = useContext(HeadingNotesContext);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(context?.notes[headingId] ?? "");
  const [saved, setSaved] = useState(Boolean(context?.notes[headingId]?.trim()));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!context) return null;
  const chapterId = context.chapterId;

  function onSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveHeadingNote({ chapterId, headingId, body });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(Boolean(body.trim()));
      setOpen(false);
    });
  }

  return (
    <div className="not-prose -mt-3 mb-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs transition-colors hover:bg-muted hover:text-foreground",
            saved ? "font-medium text-amber-700 dark:text-amber-300" : "text-muted-foreground/80"
          )}
        >
          <StickyNote className="size-3.5" aria-hidden />
          {saved ? "Your note" : "Add a note"}
        </button>
      </div>
      {open ? (
        <div className="mt-2 rounded-xl border border-border bg-card p-3">
          <label className="text-xs text-muted-foreground" htmlFor={`note-${headingId}`}>
            Only you can read this.
          </label>
          <textarea
            id={`note-${headingId}`}
            value={body}
            maxLength={2000}
            rows={3}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button type="button" size="sm" loading={pending} disabled={pending} onClick={onSave}>
              {pending ? "Saving…" : "Save note"}
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
