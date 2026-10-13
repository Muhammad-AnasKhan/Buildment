"use client";

import { useMemo, useState } from "react";
import type { EvaluationSubmission } from "./types";
import { SubmissionCard } from "./submission-card";

const filters = ["All", "Needs review", "Needs revision", "Incorrect", "Reviewed", "Quiz", "Predict", "Code", "Open question"] as const;
type Filter = typeof filters[number];

function matches(item: EvaluationSubmission, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Needs review") return item.status === "PENDING_REVIEW";
  if (filter === "Needs revision") return item.status === "NEEDS_REVISION";
  if (filter === "Incorrect") return item.isCorrect === false;
  if (filter === "Reviewed") return item.status === "REVIEWED" || Boolean(item.feedback);
  if (filter === "Open question") return item.type === "OPEN_QUESTION";
  return item.type.includes(filter.toUpperCase());
}

export function SubmissionFilters({ items }: { items: EvaluationSubmission[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = useMemo(() => items.filter((item) => matches(item, filter)), [items, filter]);
  return <section id="submissions" aria-labelledby="submissions-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Latest per checkpoint</p><h2 id="submissions-title" className="mt-1 text-lg font-semibold">Submission review</h2><p className="mt-1 text-sm text-muted-foreground">A bounded evidence view; previous attempts remain preserved in history.</p></div>
    <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filter submissions">
      {filters.map((name) => <button key={name} type="button" role="tab" aria-selected={filter === name} onClick={() => setFilter(name)} className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors aria-selected:border-foreground aria-selected:bg-foreground aria-selected:text-background hover:bg-muted">{name}</button>)}
    </div>
    <div className="mt-4 grid gap-3 xl:grid-cols-2">{visible.map((item) => <SubmissionCard key={item.id} item={item} />)}</div>
    {!visible.length ? <div className="mt-4 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No submissions match this filter.</div> : null}
  </section>;
}
