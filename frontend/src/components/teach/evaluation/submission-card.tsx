import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvaluationSubmission } from "./types";

export function SubmissionCard({ item }: { item: EvaluationSubmission }) {
  const status = item.status.toLowerCase().replaceAll("_", " ");
  return <article className="rounded-xl border bg-background p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{item.moduleTitle} · {item.chapterTitle}</p><h3 className="mt-1 line-clamp-2 text-sm font-semibold">{item.prompt ?? item.type.toLowerCase().replaceAll("_", " ")}</h3></div>
      <div className="flex gap-1.5"><Badge variant="outline" className="capitalize">{status}</Badge>{item.historyCount > 1 ? <Badge variant="secondary">{item.historyCount} attempts</Badge> : null}</div>
    </div>
    <div className="mt-3 rounded-lg bg-muted/45 px-3 py-2.5"><p className="line-clamp-4 whitespace-pre-wrap text-xs leading-5 text-foreground/80">{item.answer || "No written answer"}</p></div>
    {item.feedback ? <p className="mt-3 border-l-2 border-primary/30 pl-3 text-xs leading-5 text-muted-foreground"><span className="font-medium text-foreground">Mentor feedback: </span>{item.feedback}</p> : null}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>Attempt {item.attempt} · {new Date(item.submittedAt).toLocaleString()}</span><span className="flex items-center gap-2">{item.maxScore ? `${item.score ?? 0}/${item.maxScore} points` : item.isCorrect === true ? "Correct" : item.isCorrect === false ? "Incorrect" : ""}{item.reviewHref ? <Link href={item.reviewHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-1")}>Open review</Link> : null}</span></div>
  </article>;
}
