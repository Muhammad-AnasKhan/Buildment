import Link from "next/link";

export function LearnerBreadcrumb({
  courseSlug,
  courseTitle,
  chapterTitle,
}: {
  courseSlug?: string;
  courseTitle?: string;
  chapterTitle?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/dashboard" className="transition-colors hover:text-foreground">
        Dashboard
      </Link>
      {courseTitle ? (
        <>
          <span aria-hidden>/</span>
          {courseSlug && chapterTitle ? (
            <Link href={`/courses/${courseSlug}`} className="transition-colors hover:text-foreground">
              {courseTitle}
            </Link>
          ) : (
            <span className="text-foreground">{courseTitle}</span>
          )}
        </>
      ) : null}
      {chapterTitle ? (
        <>
          <span aria-hidden>/</span>
          <span className="text-foreground">{chapterTitle}</span>
        </>
      ) : null}
    </nav>
  );
}
