"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvaluationReflection } from "@/shared/api/teach";

const INITIAL_COUNT = 8;

export function LearnerReflections({ items }: { items: EvaluationReflection[] }) {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const matching = items.filter((item) => `${item.moduleTitle} ${item.chapterTitle}`.toLowerCase().includes(query.trim().toLowerCase()));
  const visible = (query || showAll ? matching : matching.slice(-INITIAL_COUNT)).slice().reverse();

  return (
    <section id="reflections" aria-labelledby="reflections-title" className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Saved learning notes</p>
          <h2 id="reflections-title" className="mt-1 text-lg font-semibold">Learning log</h2>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} chapters with checklist or reflection entries. Open a chapter when you need its details.</p>
        </div>
        {items.length > INITIAL_COUNT ? (
          <label className="relative block w-full shrink-0 sm:w-56">
            <span className="sr-only">Find a learning log chapter</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a chapter" className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
        ) : null}
      </div>

      {items.length === 0 ? <p className="mt-4 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No reflections saved yet.</p> : (
        <>
          <div className="mt-4 space-y-2">
            {visible.map((item) => (
              <details key={item.chapterId} className="group overflow-hidden rounded-xl border bg-background">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
                  <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{item.moduleTitle}</span><span className="mt-0.5 block text-sm font-semibold">{item.chapterTitle}</span></span>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.answers.length} notes · {item.checklist.filter((entry) => entry.checked).length}/{item.checklist.length} checked</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-4 border-t p-4">
                  {item.checklist.length > 0 ? (
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Checklist</p><ul className="mt-2 space-y-1.5 text-sm">{item.checklist.map((entry) => <li key={entry.id} className="flex gap-2"><span className={entry.checked ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>{entry.checked ? "✓" : "○"}</span><span className="break-words">{entry.id}</span></li>)}</ul></div>
                  ) : null}
                  {item.answers.length > 0 ? (
                    <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reflections</p><div className="mt-2 space-y-2">{item.answers.map((answer) => <div key={answer.id} className="rounded-lg bg-muted/35 p-3"><p className="text-xs font-medium text-muted-foreground">{answer.id}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{answer.text}</p></div>)}</div></div>
                  ) : null}
                </div>
              </details>
            ))}
            {!visible.length ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No chapters match your search.</p> : null}
          </div>
          {!query && items.length > INITIAL_COUNT ? <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Showing {visible.length} of {items.length} chapters</p><Button type="button" variant="outline" size="sm" onClick={() => setShowAll((value) => !value)}>{showAll ? "Show recent chapters" : `Show all ${items.length} chapters`}</Button></div> : null}
        </>
      )}
    </section>
  );
}
