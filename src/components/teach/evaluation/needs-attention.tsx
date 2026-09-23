import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleAlert, CircleHelp, ClockAlert, RotateCcw, XCircle } from "lucide-react";
import type { EvaluationAttention } from "./types";

const iconByKind = { review: CircleAlert, revision: RotateCcw, help: CircleHelp, incorrect: XCircle, stalled: ClockAlert, inactive: ClockAlert } as const;

export function NeedsAttention({ items }: { items: EvaluationAttention[] }) {
  return (
    <section aria-labelledby="attention-title" className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Mentor queue</p><h2 id="attention-title" className="mt-1 text-lg font-semibold">Needs attention</h2></div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">{items.length}</span>
      </div>
      {items.length ? (
        <div className="mt-4 grid gap-2 lg:grid-cols-2">
          {items.map((item) => {
            const Icon = iconByKind[item.kind];
            return <Link key={item.id} href={item.href} className="group flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-foreground/20 hover:bg-muted/40">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400"><Icon className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="block truncate text-xs text-muted-foreground">{item.detail}</span></span>
              <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground sm:flex">{item.action}<ArrowUpRight className="size-3" /></span>
            </Link>;
          })}
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 p-4"><CheckCircle2 className="size-5 text-emerald-600" /><div><p className="text-sm font-medium">Nothing needs intervention</p><p className="text-xs text-muted-foreground">Reviews, help requests, and recent progress all look clear.</p></div></div>
      )}
    </section>
  );
}
