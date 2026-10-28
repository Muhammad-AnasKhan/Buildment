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
      className="not-prose my-6 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
    >
      <div className="flex items-center gap-3 border-b border-border bg-secondary px-5 py-3 sm:px-6">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
          <ClipboardCheck className="size-4" aria-hidden="true" />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
          Checkpoint ahead
        </span>
      </div>
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        {title ? <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-foreground">{title}</h3> : null}
        {body ? (
          <div className="text-[15px] leading-relaxed text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_p]:my-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_strong]:text-foreground">
            {body}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
