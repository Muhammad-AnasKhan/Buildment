import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MenteeRosterItem } from "@/server/mentor-dashboard/types";

export function MenteesNeedingAttention({ mentees }: { mentees: MenteeRosterItem[] }) {
  return <section aria-labelledby="attention-title" className="rounded-2xl border bg-card p-5">
    <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mentor queue</p><h2 id="attention-title" className="mt-1 text-lg font-semibold">Needs attention</h2></div>{mentees.length ? <Badge variant="secondary">{mentees.length} learner{mentees.length === 1 ? "" : "s"}</Badge> : null}</div>
    {mentees.length ? <div className="mt-4 grid gap-2 lg:grid-cols-2">{mentees.slice(0, 6).map((mentee) => <Link key={mentee.id} href={mentee.evaluationHref} className="group flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400"><CircleAlert className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{mentee.name}</span><span className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">{mentee.attention.slice(0, 2).map((item) => <span key={item.kind}>{item.label}</span>)}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" /></Link>)}</div> : <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-4"><CheckCircle2 className="size-5 text-emerald-600" /><div><p className="text-sm font-medium">No learners need intervention</p><p className="text-xs text-muted-foreground">There are no pending reviews, open help requests, unresolved revisions, or objective inactivity flags.</p></div></div>}
    {mentees.length > 6 ? <p className="mt-3 text-xs text-muted-foreground">And {mentees.length - 6} more in the filtered roster below.</p> : null}
  </section>;
}
