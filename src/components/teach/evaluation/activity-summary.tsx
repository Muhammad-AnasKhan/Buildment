import Link from "next/link";
import { CircleHelp, Clock3, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type { HelpRequest, StudySessionItem } from "./types";

export function ActivitySummary({ help, sessions }: { help: HelpRequest[]; sessions: StudySessionItem[] }) {
  return <section id="activity" aria-labelledby="activity-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Context</p><h2 id="activity-title" className="mt-1 text-lg font-semibold">Help and study activity</h2></div>
    <div className="mt-5 grid gap-6 lg:grid-cols-2">
      <div><div className="flex items-center gap-2"><MessageCircle className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Help requests</h3></div>
        <div className="mt-3 space-y-2">{help.map((item) => <Link key={item.id} href={item.href} className="block rounded-xl border bg-background p-3 transition-colors hover:bg-muted/40"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{item.chapterTitle}</p><Badge variant={item.status === "OPEN" ? "secondary" : "outline"} className="capitalize">{item.status.toLowerCase()}</Badge></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.preview}</p><p className="mt-2 text-[11px] text-muted-foreground">Updated {new Date(item.updatedAt).toLocaleString()}</p></Link>)}{!help.length ? <Empty icon={CircleHelp} text="No help requests yet." /> : null}</div>
      </div>
      <div><div className="flex items-center gap-2"><Clock3 className="size-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Recent study sessions</h3></div>
        <div className="mt-3 divide-y rounded-xl border bg-background">{sessions.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{item.chapterTitle}</p><p className="text-[11px] text-muted-foreground">{new Date(item.startedAt).toLocaleString()}</p></div><div className="text-right"><p className="text-xs font-medium">{formatStudyAmount(item.activeSeconds)}</p><p className="text-[11px] capitalize text-muted-foreground">{item.status.toLowerCase()}</p></div></div>)}{!sessions.length ? <Empty icon={Clock3} text="No study sessions recorded." /> : null}</div>
      </div>
    </div>
  </section>;
}

function Empty({ icon: Icon, text }: { icon: typeof Clock3; text: string }) { return <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground"><Icon className="size-4" />{text}</div>; }
