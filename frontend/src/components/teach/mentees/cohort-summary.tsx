import { CheckCircle2, CircleHelp, Clock3, Gauge, MessageSquareText, Radio, Users } from "lucide-react";
import type { CourseMenteesView } from "@/server/mentor-dashboard/types";

export function CohortSummary({ summary }: { summary: CourseMenteesView["summary"] }) {
  const metrics = [
    { label: "Enrolled", value: summary.total, icon: Users },
    { label: "Active 7 days", value: summary.active, icon: Radio },
    { label: "Average progress", value: `${summary.averageCompletion}%`, icon: Gauge },
    { label: "Completed", value: summary.completed, icon: CheckCircle2 },
    { label: "Pending reviews", value: summary.pendingReviews, icon: MessageSquareText },
    { label: "Open help", value: summary.openHelpRequests, icon: CircleHelp },
    { label: "Inactive 7+ days", value: summary.inactive, icon: Clock3 },
  ];
  return <section aria-label="Cohort overview" className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4 lg:grid-cols-7">
    {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="border-b border-r p-4 last:border-r-0 lg:border-b-0"><div className="flex items-center gap-2 text-muted-foreground"><Icon className="size-3.5" /><span className="truncate text-[11px] font-medium">{label}</span></div><p className="mt-2 text-xl font-semibold tabular-nums tracking-tight">{value}</p></div>)}
  </section>;
}
