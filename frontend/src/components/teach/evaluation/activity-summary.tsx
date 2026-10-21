import Link from "next/link";
import { CircleHelp, Clock3, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type { HelpRequest, StudySessionItem } from "@/shared/api/teach";
import { helpUiCopy as copy } from "@/shared/lib/help-ui-copy";

export function ActivitySummary({ help, sessions }: { help: HelpRequest[]; sessions: StudySessionItem[] }) {
  return <section id="activity" aria-labelledby="activity-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Context</p><h2 id="activity-title" className="mt-1 text-lg font-semibold">Questions and study activity</h2></div>
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
      <div><div className="flex items-center gap-2"><MessageCircle className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">{copy.activitySectionTitle}</h3></div>
        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">{help.map((item) => <Link key={item.id} href={item.href} className="block rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{item.chapterTitle}</p><Badge variant={item.status === "OPEN" ? "secondary" : "outline"} className="capitalize">{item.status.toLowerCase()}</Badge></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.preview}</p><p className="mt-2 text-[11px] text-muted-foreground">Updated {new Date(item.updatedAt).toLocaleString()}</p></Link>)}{!help.length ? <Empty icon={CircleHelp} text={copy.activityEmpty} /> : null}</div>
      </div>
      <div><div className="flex items-center gap-2"><Clock3 className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Recent study sessions</h3></div>
        <div className="mt-3 max-h-96 divide-y overflow-y-auto rounded-xl border bg-background">{sessions.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.chapterTitle}</p><p className="text-[11px] text-muted-foreground">{new Date(item.startedAt).toLocaleString()}</p></div><div className="text-right"><p className="text-xs font-medium">{formatStudyAmount(item.activeSeconds)}</p><p className="text-[11px] capitalize text-muted-foreground">{item.status.toLowerCase()}</p></div></div>)}{!sessions.length ? <Empty icon={Clock3} text="No study sessions recorded." /> : null}</div>
      </div>
    </div>
  </section>;
}

function Empty({ icon: Icon, text }: { icon: typeof Clock3; text: string }) { return <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Icon className="size-4" />{text}</div>; }
