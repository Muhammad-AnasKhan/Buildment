"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  CirclePlay,
  Code2,
  Lightbulb,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SanitizedCodeConfig } from "./schema";

type CheckResult = {
  isCorrect: boolean | null;
  failedTestName?: string;
  errorMessage?: string;
  explanation?: string;
  solution?: string;
};

function lineCount(source: string) {
  return Math.max(source.split("\n").length, 1);
}

function CodeEditor({
  value,
  onChange,
  readOnly,
  filename,
  language,
}: {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
  filename: string;
  language: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = lineCount(value);

  const syncScroll = useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncScroll);
    return () => el.removeEventListener("scroll", syncScroll);
  }, [syncScroll]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-[#0d1117] shadow-inner">
      {/* Editor title bar */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 bg-[#161b22] px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 items-center gap-2 font-mono text-xs">
            <span className="truncate text-neutral-300">{filename}</span>
            <span className="shrink-0 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
              {language}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-neutral-600">Editable</span>
      </div>

      <div className="flex max-h-[min(420px,55vh)] min-h-[220px]">
        {/* Line numbers */}
        <div
          ref={gutterRef}
          className="hidden shrink-0 overflow-hidden border-r border-neutral-800 bg-[#0d1117] py-4 pr-3 pl-3 text-right font-mono text-[13px] leading-[1.65] text-neutral-600 select-none sm:block"
          aria-hidden
        >
          {Array.from({ length: lines }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={cn(
            "block min-h-[220px] w-full flex-1 resize-none bg-transparent py-4 pr-4 pl-4 font-mono text-[13px] leading-[1.65] text-[#e6edf3] outline-none sm:pl-3",
            "placeholder:text-neutral-600 caret-indigo-400",
            "selection:bg-indigo-500/30",
            readOnly && "opacity-90"
          )}
          aria-label={`Code editor for ${filename}`}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-neutral-800 bg-[#161b22] px-3 py-1.5 font-mono text-[10px] text-neutral-500 sm:px-4">
        <span>{lines} line{lines === 1 ? "" : "s"}</span>
        <span>UTF-8 · Spaces: 2</span>
      </div>
    </div>
  );
}

function ReadOnlyCodeBlock({ source, label }: { source: string; label: string }) {
  const lines = source.split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950">
      <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-400">
        {label}
      </div>
      <div className="flex overflow-x-auto">
        <div className="hidden shrink-0 border-r border-neutral-800 py-4 pr-3 pl-4 text-right font-mono text-xs leading-[1.65] text-neutral-600 sm:block">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="m-0 flex-1 p-4 font-mono text-[13px] leading-[1.65] text-neutral-100">
          <code>{source}</code>
        </pre>
      </div>
    </div>
  );
}

export function CodeExerciseClient({ id, config }: { id: string; config: SanitizedCodeConfig }) {
  const [source, setSource] = useState(config.starterCode);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintIndex, setHintIndex] = useState(-1);

  const hints = config.hints ?? [];
  const hasAnswered = result !== null;
  const canRetry = result && !result.isCorrect && config.allowRetry;
  const passed = result?.isCorrect === true;
  const filename = config.filename ?? "exercise.js";
  const language = config.language === "javascript" ? "JavaScript" : config.language;

  const modeMeta =
    config.mode === "complete"
      ? {
          label: "Complete the code",
          badge: "bg-amber-100 text-amber-800 ring-amber-200/80",
          accent: "text-amber-700",
          iconBg: "bg-amber-100 text-amber-700",
        }
      : {
          label: "Implement this",
          badge: "bg-violet-100 text-violet-800 ring-violet-200/80",
          accent: "text-violet-700",
          iconBg: "bg-violet-100 text-violet-700",
        };

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/blocks/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSource(config.starterCode);
    setResult(null);
    setError(null);
    setHintIndex(-1);
  }

  return (
    <div
      className="not-prose my-10 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      data-code-exercise
    >
      {/* Prompt header — matches quiz / checklist cards */}
      <div className="border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              modeMeta.iconBg
            )}
          >
            <Code2 className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                Code lab
              </p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                  modeMeta.badge
                )}
              >
                {modeMeta.label}
              </span>
            </div>
            <p className="mt-1.5 text-base font-semibold leading-snug text-neutral-950 sm:text-[17px]">
              {config.prompt}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Type in the editor below — same dark theme as code blocks in this course. Use{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs text-neutral-800">
                module.exports
              </code>{" "}
              so automated checks can run your functions.
            </p>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-4 bg-neutral-50/80 px-4 py-5 sm:px-6">
        <CodeEditor
          value={source}
          onChange={setSource}
          readOnly={passed}
          filename={filename}
          language={language}
        />

        {hintIndex >= 0 && hints[hintIndex] ? (
          <div className="flex gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p>
              <span className="font-semibold">Hint {hintIndex + 1}:</span> {hints[hintIndex]}
            </p>
          </div>
        ) : null}

        {hasAnswered && result ? (
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3.5",
                passed
                  ? "border-emerald-200 bg-emerald-50/90"
                  : "border-amber-200 bg-amber-50/90"
              )}
            >
              {passed ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              )}
              <div className="min-w-0 text-sm">
                <p className={cn("font-semibold", passed ? "text-emerald-900" : "text-amber-900")}>
                  {passed ? "All checks passed — well done!" : "Not quite yet — adjust and retry"}
                </p>
                {!passed && result.failedTestName ? (
                  <p className="mt-1.5 text-amber-900/90">
                    Failed: <span className="font-medium">{result.failedTestName}</span>
                    {result.errorMessage ? (
                      <code className="mt-2 block overflow-x-auto rounded-lg bg-amber-100/80 px-2.5 py-2 font-mono text-xs text-amber-950">
                        {result.errorMessage}
                      </code>
                    ) : null}
                  </p>
                ) : null}
                {result.explanation ? (
                  <p className="mt-2 leading-relaxed text-neutral-700">{result.explanation}</p>
                ) : null}
              </div>
            </div>

            {passed && result.solution ? (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <Sparkles className="size-3.5 text-emerald-600" />
                  Reference solution
                </p>
                <ReadOnlyCodeBlock source={result.solution} label={filename} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Actions footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {!passed ? (
            <>
              <Button
                size="sm"
                onClick={submit}
                disabled={!source.trim() || submitting}
                className="h-9 gap-2 rounded-full bg-neutral-950 px-5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800"
              >
                <CirclePlay className="size-4" />
                {submitting ? "Running checks…" : "Check my code"}
              </Button>
              {hints.length > 0 && hintIndex < hints.length - 1 ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 rounded-full"
                  onClick={() => setHintIndex((i) => Math.min(i + 1, hints.length - 1))}
                >
                  <Lightbulb className="size-3.5" />
                  Hint
                </Button>
              ) : null}
              {canRetry ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 gap-1.5"
                  onClick={reset}
                >
                  <RotateCcw className="size-3.5" />
                  Reset
                </Button>
              ) : null}
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-full" onClick={reset}>
              <RotateCcw className="size-3.5" />
              Practice again
            </Button>
          )}
        </div>
        <p className="text-xs text-neutral-400">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <>
              {config.testCount} check{config.testCount === 1 ? "" : "s"} · {language}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
