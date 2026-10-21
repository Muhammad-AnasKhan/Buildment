import { ClipboardCheck } from "lucide-react";

export function CheckpointIntro({
  title,
  content,
  children,
}: {
  title?: string;
  content?: string;
  children?: React.ReactNode;
}) {
  const body = children ?? content;

  return (
    <aside
      role="note"
      aria-label={title ?? "Checkpoint introduction"}
      data-checkpoint-intro
      className="not-prose my-6 overflow-hidden rounded-2xl border border-indigo-200/80 bg-card text-card-foreground shadow-[0_1px_3px_rgb(0_0_0/0.06)] dark:border-indigo-400/25"
    >
      <div className="flex items-center gap-3 border-b border-indigo-200/70 bg-indigo-50/70 px-5 py-3 dark:border-indigo-400/20 dark:bg-indigo-500/10 sm:px-6">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-200">
          <ClipboardCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-800 dark:text-indigo-200">
          Checkpoint ahead
        </span>
      </div>
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        {title ? <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-foreground">{title}</h3> : null}
        {body ? (
          <div className="text-[15px] leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-indigo-700 [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-indigo-300 [&_p]:my-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground">
            {body}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
