"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  FilePenLine,
  Flag,
  LoaderCircle,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  publishChapter,
  saveChapterDraft,
  updateChapterSettings,
} from "@/server/actions/chapters";

// The mentor's authoring surface — see docs/02-content-authoring.mdx "The
// in-app editor". MDXEditor is Lexical-based and client-only, so the real
// editor is lazy-loaded with ssr:false behind this shell, which owns the
// autosave/publish state around it.

const MdxEditorCore = dynamic(() => import("./mdx-editor-core"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
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
  chapterSummary,
  estimatedMinutes,
  readerMode,
  isMilestone,
  initialPublishedAt,
  initialHasUnpublishedChanges,
  initialSource,
  lastPublishedSource,
}: {
  chapterId: string;
  courseSlug: string;
  chapterTitle: string;
  chapterSummary: string | null;
  estimatedMinutes: number | null;
  readerMode: "DEFAULT" | "QUIZ";
  isMilestone: boolean;
  initialPublishedAt: string | null;
  initialHasUnpublishedChanges: boolean;
  initialSource: string;
  lastPublishedSource: string | null;
}) {
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishedAt, setPublishedAt] = useState<string | null>(initialPublishedAt);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(
    initialHasUnpublishedChanges
  );
  const [publishing, setPublishing] = useState(false);
  const [settings, setSettings] = useState({
    title: chapterTitle,
    summary: chapterSummary ?? "",
    estimatedMinutes: estimatedMinutes?.toString() ?? "",
    readerMode,
    isMilestone,
  });
  const [settingsState, setSettingsState] = useState<SaveState>({ kind: "idle" });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSource = useRef(initialSource);
  const savedSource = useRef(initialSource);
  const inFlight = useRef<Promise<boolean> | null>(null);

  const flushDraft = useCallback(async () => {
    while (savedSource.current !== latestSource.current || inFlight.current) {
      if (inFlight.current) {
        const saved = await inFlight.current;
        if (!saved) return false;
        continue;
      }

      const source = latestSource.current;
      setSaveState({ kind: "saving" });
      const operation = (async () => {
        const result = await saveChapterDraft({ chapterId, source });
        if (result.ok) {
          savedSource.current = source;
          setSaveState({
            kind: "saved",
            at: "savedAt" in result ? result.savedAt : new Date().toISOString(),
          });
          return true;
        }
        setSaveState({ kind: "error", message: result.errors.join(" ") });
        return false;
      })();
      inFlight.current = operation;
      const saved = await operation;
      if (inFlight.current === operation) inFlight.current = null;
      if (!saved) return false;
    }
    return true;
  }, [chapterId]);

  const handleChange = useCallback(
    (markdown: string) => {
      latestSource.current = markdown;
      setHasUnpublishedChanges(true);
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
    const saved = await flushDraft();
    if (!saved) {
      setPublishErrors(["Save the latest draft before publishing."]);
      return;
    }
    setPublishing(true);
    setPublishErrors([]);
    const result = await publishChapter({ chapterId });
    setPublishing(false);
    if (result.ok) {
      setPublishedAt(new Date().toISOString());
      setHasUnpublishedChanges(false);
    } else {
      setPublishErrors(result.errors);
    }
  }, [chapterId, flushDraft]);

  const handleSettingsSave = useCallback(async () => {
    const minutes = settings.estimatedMinutes.trim();
    setSettingsState({ kind: "saving" });
    const result = await updateChapterSettings({
      chapterId,
      title: settings.title,
      summary: settings.summary.trim() || null,
      estimatedMinutes: minutes ? Number(minutes) : null,
      readerMode: settings.readerMode,
      isMilestone: settings.isMilestone,
    });
    if (result.ok) {
      setSettingsState({
        kind: "saved",
        at: "savedAt" in result ? result.savedAt : new Date().toISOString(),
      });
    } else {
      setSettingsState({ kind: "error", message: result.errors.join(" ") });
    }
  }, [chapterId, settings]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/courses/${courseSlug}/edit`}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to course
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
              {settings.title || "Untitled chapter"}
            </h1>
            <Badge variant={publishedAt ? "secondary" : "outline"}>
              {publishedAt ? "Published" : "Draft"}
            </Badge>
            {hasUnpublishedChanges ? <Badge variant="outline">Draft changes</Badge> : null}
            {settings.readerMode === "QUIZ" ? <Badge variant="outline">Quiz</Badge> : null}
            {settings.isMilestone ? <Badge variant="outline">Milestone</Badge> : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {publishedAt
              ? hasUnpublishedChanges
                ? `Learners still see the version published ${formatTimestamp(publishedAt)}.`
                : `Learners see the version published ${formatTimestamp(publishedAt)}.`
              : "This chapter is private until you publish it."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <SaveStatus state={saveState} />
          <Button
            onClick={() => void handlePublish()}
            disabled={publishing}
            className="rounded-full"
          >
            {publishing ? <LoaderCircle className="animate-spin" /> : <BookOpen />}
            {publishing ? "Publishing…" : publishedAt ? "Publish update" : "Publish"}
          </Button>
        </div>
      </div>

      {publishedAt && publishErrors.length === 0 && (
        <p className="sr-only" aria-live="polite">Chapter is published.</p>
      )}
      {publishErrors.length > 0 && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          <p className="font-semibold">Cannot publish yet:</p>
          <ul className="mt-1 list-disc pl-5">
            {publishErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="group mt-5 overflow-hidden rounded-xl border bg-card shadow-sm">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden sm:px-5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
            <Settings2 className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Chapter settings</span>
            <span className="block truncate text-xs text-muted-foreground">
              {settings.readerMode === "QUIZ" ? "Quiz experience" : "Standard lesson"}
              {settings.estimatedMinutes ? ` · ${settings.estimatedMinutes} min` : " · No duration"}
              {settings.isMilestone ? " · Milestone" : ""}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="border-t p-4 sm:p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="chapter-title">Chapter title</Label>
              <Input
                id="chapter-title"
                value={settings.title}
                maxLength={120}
                onChange={(event) => {
                  setSettings((current) => ({ ...current, title: event.target.value }));
                  setSettingsState({ kind: "dirty" });
                }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="chapter-summary">Summary</Label>
                <span className="text-xs text-muted-foreground">{settings.summary.length}/280</span>
              </div>
              <Textarea
                id="chapter-summary"
                value={settings.summary}
                maxLength={280}
                placeholder="Tell learners what they will accomplish in this chapter."
                onChange={(event) => {
                  setSettings((current) => ({ ...current, summary: event.target.value }));
                  setSettingsState({ kind: "dirty" });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-minutes"><Clock3 className="size-3.5" /> Estimated minutes</Label>
              <Input
                id="estimated-minutes"
                type="number"
                inputMode="numeric"
                min={1}
                max={600}
                value={settings.estimatedMinutes}
                placeholder="e.g. 15"
                onChange={(event) => {
                  setSettings((current) => ({ ...current, estimatedMinutes: event.target.value }));
                  setSettingsState({ kind: "dirty" });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reader-mode"><FilePenLine className="size-3.5" /> Reader experience</Label>
              <select
                id="reader-mode"
                value={settings.readerMode}
                onChange={(event) => {
                  setSettings((current) => ({
                    ...current,
                    readerMode: event.target.value as "DEFAULT" | "QUIZ",
                  }));
                  setSettingsState({ kind: "dirty" });
                }}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="DEFAULT">Standard lesson</option>
                <option value="QUIZ">Quiz flow</option>
              </select>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 md:col-span-2">
              <Checkbox
                id="is-milestone"
                checked={settings.isMilestone}
                onCheckedChange={(checked) => {
                  setSettings((current) => ({ ...current, isMilestone: checked === true }));
                  setSettingsState({ kind: "dirty" });
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="is-milestone"><Flag className="size-3.5" /> Mark as a milestone chapter</Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Highlights a meaningful checkpoint for learners. Chapter locking is controlled by the course&apos;s sequencing setting.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <SettingsStatus state={settingsState} />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSettingsSave()}
              disabled={settingsState.kind === "saving"}
            >
              {settingsState.kind === "saving" ? <LoaderCircle className="animate-spin" /> : <Check />}
              {settingsState.kind === "saving" ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </div>
      </details>

      <div className="mt-5">
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
      return <span className="text-xs text-muted-foreground">Unsaved draft</span>;
    case "saving":
      return <span className="text-xs text-muted-foreground">Saving draft…</span>;
    case "saved":
      return <span className="text-xs text-emerald-600 dark:text-emerald-400">Draft saved</span>;
    case "error":
      return (
        <span className="max-w-56 truncate text-xs text-destructive" title={state.message}>
          Save failed: {state.message}
        </span>
      );
  }
}

function SettingsStatus({ state }: { state: SaveState }) {
  switch (state.kind) {
    case "idle":
      return <span className="text-xs text-muted-foreground">Settings save separately from lesson content.</span>;
    case "dirty":
      return <span className="text-xs text-amber-600 dark:text-amber-400">Settings have unsaved changes.</span>;
    case "saving":
      return <span className="text-xs text-muted-foreground">Saving settings…</span>;
    case "saved":
      return <span className="text-xs text-emerald-600 dark:text-emerald-400">Settings saved {formatTimestamp(state.at)}.</span>;
    case "error":
      return <span className="text-xs text-destructive" role="alert">Could not save: {state.message}</span>;
  }
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
