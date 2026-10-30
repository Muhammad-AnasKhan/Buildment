import {
  EnrollmentBadge,
  enrollmentLabel,
} from '@buildment/learning-ui/components/learn/enrollment-badge';
import { useState } from 'react';
import { BookOpen, Clock3, Layers3, Code2, ArrowUpRight } from 'lucide-react';
import { coursePrice, type Course } from '../../domain/catalog';
import { categoryName } from './format';
export function CourseCard({
  course,
  index,
  onOpen,
}: {
  course: Course;
  index: number;
  onOpen: () => void;
}) {
  const enrolled = ['ACTIVE', 'COMPLETED'].includes(
    course.enrollmentLifecycle || '',
  );
  const action = enrolled
    ? 'Open course'
    : course.enrollmentLifecycle === 'PAYMENT_REQUIRED'
      ? 'View enrollment'
      : 'Preview course';
  const [imageFailed, setImageFailed] = useState(false);
  const cover =
    course.coverUrl &&
    /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)(:|\/))/.test(
      course.coverUrl,
    )
      ? course.coverUrl
      : null;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg hover:shadow-primary/5 focus-within:ring-2 focus-within:ring-ring">
      <div
        className={`course-cover relative flex h-40 items-center justify-center overflow-hidden ${index % 2 ? 'bg-muted' : 'bg-ok-soft'}`}
      >
        {cover && !imageFailed ? (
          <img
            src={cover}
            onError={() => setImageFailed(true)}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute size-full object-cover"
          />
        ) : (
          <>
            <div className="cover-grid absolute inset-0 opacity-40" />
            <div className="relative flex size-20 -rotate-6 items-center justify-center rounded-2xl border border-border/80 bg-card/65 text-primary shadow-sm">
              <Code2 size={38} strokeWidth={1.3} />
            </div>
            <span className="absolute right-5 bottom-4 font-mono text-[10px] tracking-[0.2em] text-primary/60">
              BUILDMENT / {String(index + 1).padStart(2, '0')}
            </span>
          </>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-border/60 bg-card/90 px-3 py-1 text-[10px] font-semibold tracking-wide text-primary">
          {categoryName(course.category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {course.enrollmentLifecycle && (
          <div className="mb-3">
            <EnrollmentBadge
              label={enrollmentLabel(course.enrollmentLifecycle)}
            />
          </div>
        )}
        <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-ok" />
          {course.difficulty || 'All levels'}
          {course.estimatedHours != null && (
            <>
              <span className="mx-1">·</span>
              <Clock3 size={12} />
              {course.estimatedHours} hours
            </>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {course.description ||
            'Explore this course and build your skills through practice.'}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers3 size={13} />
            {course.moduleCount} modules
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} />
            {course.chapterCount} chapters
          </span>
        </div>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="truncate text-xs text-muted-foreground">
              {course.instructorName || 'Buildment'}
            </span>
            <span className="text-sm font-semibold text-primary">
              {coursePrice(course)}
            </span>
          </div>
          <button
            id={`preview-${course.id}`}
            onClick={onOpen}
            aria-label={`${enrolled ? 'Open' : course.enrollmentLifecycle === 'PAYMENT_REQUIRED' ? 'View enrollment for' : 'Preview'} ${course.title}`}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary after:absolute after:inset-0"
          >
            {action}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
