import Link from "next/link";
import { CheckCheck, Send } from "lucide-react";
import type { FeedbackEvent } from "./types";

export function FeedbackTimeline({ items }: { items: FeedbackEvent[] }) {
  return <section aria-labelledby="timeline-title" className="rounded-2xl border bg-card p-5 sm:p-6">
    <details>
      <summary className="cursor-pointer list-none marker:hidden">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Audit trail</p><h2 id="timeline-title" className="mt-1 text-lg font-semibold">Feedback timeline</h2></div><span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{items.length} events · expand</span></div>
      </summary>
      <div className="mt-5 border-l pl-5">
        {items.map((item) => { const Icon = item.kind === "review" ? CheckCheck : Send; return <div key={item.id} className="relative pb-5 last:pb-0">
          <span className="absolute -left-[30px] grid size-5 place-items-center rounded-full border bg-background"><Icon className="size-2.5" /></span>
          <div className="flex flex-wrap items-start justify-between gap-2"><div><Link href={item.href} className="text-sm font-medium hover:underline">{item.title}</Link><p className="text-xs text-muted-foreground">{item.chapterTitle} · attempt {item.attempt}</p></div><time className="text-[11px] text-muted-foreground">{new Date(item.occurredAt).toLocaleString()}</time></div>
          {item.detail ? <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.detail}</p> : null}
        </div>; })}
        {!items.length ? <p className="text-sm text-muted-foreground">No submissions or reviews yet.</p> : null}
      </div>
    </details>
  </section>;
}
