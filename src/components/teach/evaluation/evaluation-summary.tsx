import { BookOpenCheck, CircleHelp, Clock3, Gauge, ListChecks, MessageSquareMore, Trophy, Waypoints } from "lucide-react";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type { MenteeEvaluation } from "./types";

const icons = [Gauge, BookOpenCheck, Trophy, MessageSquareMore, Clock3, Waypoints, ListChecks, CircleHelp];

export function EvaluationSummary({ evaluation }: { evaluation: MenteeEvaluation }) {
  const value = evaluation.enrollment;
  const metrics = [
    ["Course progress", `${value.percentComplete}%`],
    ["Chapters", `${value.chaptersCompleted}/${value.chapterCount}`],
    ["Score", value.maxScore ? `${value.totalScore}/${value.maxScore}` : "—"],
    ["Pending reviews", String(value.pendingReviews)],
    ["This week", formatStudyAmount(value.studyWeekSeconds)],
    ["All-time study", formatStudyAmount(value.studyTotalSeconds)],
    ["Project evidence", String(evaluation.evidence.length)],
    ["Open help", String(value.openHelpCount)],
  ] as const;
  return (
    <section aria-labelledby="evaluation-summary-title">
      <h2 id="evaluation-summary-title" className="sr-only">Evaluation summary</h2>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4 lg:grid-cols-8">
        {metrics.map(([label, metric], index) => {
          const Icon = icons[index];
          return (
            <div key={label} className="min-w-0 border-b border-r p-4 last:border-r-0 sm:[&:nth-child(n+5)]:border-b-0 lg:border-b-0">
              <Icon className="mb-3 size-4 text-muted-foreground" />
              <p className="truncate text-lg font-semibold tracking-tight">{metric}</p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${value.percentComplete}% complete`}>
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.min(100, Math.max(0, value.percentComplete))}%` }} />
      </div>
    </section>
  );
}
