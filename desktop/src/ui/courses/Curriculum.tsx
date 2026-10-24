import { BookOpen, ChevronDown } from 'lucide-react';
import type { CourseDetail } from '../../domain/catalog';
export function Curriculum({ modules }: { modules: CourseDetail['modules'] }) {
  return (
    <div className="space-y-3">
      {modules.length ? (
        [...modules]
          .sort((a, b) => a.order - b.order)
          .map((module, index) => (
            <details
              key={module.id}
              className="group rounded-xl border border-border bg-card"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold">
                  {module.title}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {module.chapters.length} chapters
                  </span>
                </span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                />
              </summary>
              <ol className="border-t border-border px-5">
                {[...module.chapters]
                  .sort((a, b) => a.order - b.order)
                  .map((chapter) => (
                    <li
                      key={chapter.id}
                      className="flex items-center gap-3 border-b border-border py-4 text-sm last:border-0"
                    >
                      <BookOpen
                        size={14}
                        className="shrink-0 text-muted-foreground"
                      />
                      <span className="flex-1">{chapter.title}</span>
                      {chapter.estimatedMinutes != null && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {chapter.estimatedMinutes} min
                        </span>
                      )}
                    </li>
                  ))}
              </ol>
              {!module.chapters.length && (
                <p className="px-5 pb-5 text-sm text-muted-foreground">
                  No published chapters yet.
                </p>
              )}
            </details>
          ))
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          The curriculum hasn’t been published yet.
        </p>
      )}
    </div>
  );
}
