"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { publishChapter, saveChapterDraft } from "@/server/actions/chapters";

// The mentor's authoring surface — see docs/02-content-authoring.mdx "The
// in-app editor". MDXEditor is Lexical-based and client-only, so the real
// editor is lazy-loaded with ssr:false behind this shell, which owns the
// autosave/publish state around it.

const MdxEditorCore = dynamic(() => import("./mdx-editor-core"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
      Loading editor…
    </div>
  ),
});

type SaveState =
  | { kind: "idle" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

export function ChapterEditor({
  chapterId,
  courseSlug,
  chapterTitle,
  initialSource,
  lastPublishedSource,
}: {
  chapterId: string;
  courseSlug: string;
  chapterTitle: string;
  initialSource: string;
  lastPublishedSource: string | null;
}) {
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSource = useRef(initialSource);
  const inFlight = useRef(false);

  const flushDraft = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaveState({ kind: "saving" });
    const result = await saveChapterDraft({
      chapterId,
      source: latestSource.current,
    });
    inFlight.current = false;
    if (result.ok) {
      setSaveState({ kind: "saved", at: "savedAt" in result ? result.savedAt : new Date().toISOString() });
    } else {
      setSaveState({ kind: "error", message: result.errors.join(" ") });
    }
  }, [chapterId]);

  const handleChange = useCallback(
    (markdown: string) => {
      latestSource.current = markdown;
      setSaveState({ kind: "dirty" });
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flushDraft(), 900);
    },
    [flushDraft]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const handlePublish = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await flushDraft();
    setPublishing(true);
    setPublishErrors([]);
    const result = await publishChapter({ chapterId });
    setPublishing(false);
    if (result.ok) {
      setPublishedAt(new Date().toISOString());
    } else {
      setPublishErrors(result.errors);
    }
  }, [chapterId, flushDraft]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/courses/${courseSlug}/edit`}
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-950"
          >
            ← Back to course
          </Link>
          <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-950">
            {chapterTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <SaveStatus state={saveState} />
          <Button
            onClick={() => void handlePublish()}
            disabled={publishing}
            className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {publishedAt && publishErrors.length === 0 && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          Published {new Date(publishedAt).toLocaleTimeString()}. Learners now see this version.
        </p>
      )}
      {publishErrors.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-semibold">Cannot publish yet:</p>
          <ul className="mt-1 list-disc pl-5">
            {publishErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <MdxEditorCore
          initialMarkdown={initialSource}
          diffMarkdown={lastPublishedSource ?? undefined}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  switch (state.kind) {
    case "idle":
      return null;
    case "dirty":
      return <span className="text-xs text-neutral-400">Unsaved changes</span>;
    case "saving":
      return <span className="text-xs text-neutral-400">Saving draft…</span>;
    case "saved":
      return <span className="text-xs text-emerald-600">Draft saved</span>;
    case "error":
      return (
        <span className="max-w-56 truncate text-xs text-red-600" title={state.message}>
          Save failed: {state.message}
        </span>
      );
  }
}
