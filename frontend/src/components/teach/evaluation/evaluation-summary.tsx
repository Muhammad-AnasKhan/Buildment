import { BookOpenCheck, CircleHelp, Clock3, MessageSquareMore, Trophy } from "lucide-react";
import { formatStudyAmount } from "@/lib/format-study-duration";
import type { MenteeEvaluation } from "@/shared/api/teach";

export function EvaluationSummary({ evaluation }: { evaluation: MenteeEvaluation }) {
  const value = evaluation.enrollment;
  const percent = Math.min(100, Math.max(0, value.percentComplete));
  const metrics = [
    { label: "Chapters complete", value: `${value.chaptersCompleted}/${value.chapterCount}`, icon: BookOpenCheck },
    { label: "Scored points", value: value.maxScore ? `${value.totalScore}/${value.maxScore}` : "—", icon: Trophy },
    { label: "Pending reviews", value: String(value.pendingReviews), icon: MessageSquareMore },
    { label: "Open questions", value: String(value.openHelpCount), icon: CircleHelp },
    { label: "Study this week", value: formatStudyAmount(value.studyWeekSeconds), icon: Clock3 },
    { label: "Total study", value: formatStudyAmount(value.studyTotalSeconds), icon: Clock3 },
  ];

  return (
    <section aria-labelledby="evaluation-summary-title" className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
      <div className="flex flex-col justify-between rounded-2xl border bg-card p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Learning progress</p>
          <h2 id="evaluation-summary-title" className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">{percent}%</span>
            <span className="text-sm text-muted-foreground">of this course completed</span>
          </h2>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Course completion" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{value.chaptersCompleted} of {value.chapterCount} chapters</span> completed
          {value.currentChapterDetail ? <span className="mt-1 block truncate text-xs">Now in {value.currentChapterDetail}</span> : null}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {metrics.map(({ label, value: metric, icon: Icon }) => (
          <div key={label} className="flex min-w-0 flex-col justify-between rounded-xl border bg-card px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{metric}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
