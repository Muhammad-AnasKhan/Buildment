import Link from "next/link";
import { ArrowUpRight, FileText, GitFork, Globe2, Network, PlaySquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectEvidence as ProjectEvidenceItem } from "./types";

const iconByType = { Repository: GitFork, "Demo video": PlaySquare, "Deployed application": Globe2, "Architecture / ERD": Network, "Article / document": FileText, "Other evidence": FileText } as const;

export function ProjectEvidence({ items }: { items: ProjectEvidenceItem[] }) {
  return <section aria-labelledby="evidence-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">The work itself</p><h2 id="evidence-title" className="mt-1 text-lg font-semibold">Project evidence</h2><p className="mt-1 text-sm text-muted-foreground">Repository, working demo, and design artifacts submitted through the course.</p></div>
    {items.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">
      {items.map((item) => { const Icon = iconByType[item.type]; return <article key={item.id} className="flex min-w-0 flex-col rounded-xl border bg-background p-4">
        <div className="flex items-start justify-between gap-3"><span className="grid size-9 place-items-center rounded-lg bg-muted"><Icon className="size-4" /></span><Badge variant="outline">Attempt {item.attempt}</Badge></div>
        <p className="mt-3 text-sm font-semibold">{item.type}</p><p className="mt-1 text-xs text-muted-foreground">{item.chapterTitle}</p>
        <a href={item.url} target="_blank" rel="noreferrer noopener" className="mt-3 min-w-0 rounded-lg border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/60">
          <span className="flex items-center gap-1 text-xs font-medium">{item.hostname}<ArrowUpRight className="size-3" /></span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{item.displayPath}</span>
        </a>
        {item.explanation ? <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.explanation}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4"><span className="text-[11px] text-muted-foreground">{new Date(item.submittedAt).toLocaleDateString()}</span><Link href={item.reviewHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-mr-2")}>Review</Link></div>
      </article>; })}
    </div> : <div className="mt-5 rounded-xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">No project links submitted yet. Evidence appears here as soon as the learner submits a repository, demo, deployment, diagram, or supporting document.</div>}
  </section>;
}
