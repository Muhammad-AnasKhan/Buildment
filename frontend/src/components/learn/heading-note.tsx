"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { saveHeadingNote } from "@/server/actions/heading-note";
import { Button } from "@/components/ui/button";

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
    <div className="not-prose mb-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        {saved ? "Your note" : "Add a private note"}
      </button>
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
            <Button type="button" size="sm" disabled={pending} onClick={onSave}>
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
