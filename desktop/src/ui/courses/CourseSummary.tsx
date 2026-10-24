import type { ReactNode } from 'react';
import { BookOpen, Clock3, Layers3 } from 'lucide-react';
import { coursePrice, type Course } from '../../domain/catalog';
export function CourseSummary({
  course: current,
  children,
}: {
  course: Course;
  children?: ReactNode;
}) {
  return (
    <aside
      aria-label="Course details"
      className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        At a glance
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight">
        {coursePrice(current)}
      </p>
      <dl className="mt-6 space-y-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Level</dt>
          <dd>{current.difficulty || 'All levels'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Layers3 size={14} />
            Modules
          </dt>
          <dd>{current.moduleCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <BookOpen size={14} />
            Chapters
          </dt>
          <dd>{current.chapterCount}</dd>
        </div>
        {current.estimatedHours != null && (
          <div className="flex justify-between">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Clock3 size={14} />
              Duration
            </dt>
            <dd>{current.estimatedHours} hours</dd>
          </div>
        )}
      </dl>
      {children}
      <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
        Course preview · Browse the outline before you begin.
      </p>
    </aside>
  );
}
