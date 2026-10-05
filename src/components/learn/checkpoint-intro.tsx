export function CheckpointIntro({
  title,
  content,
  children,
}: {
  title?: string;
  content?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="not-prose -mt-2 mb-1 flex gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 px-4 py-3.5 sm:px-5">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
      <div className="text-[15px] leading-relaxed text-foreground/85 [&>p]:m-0 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {title ? <p className="font-semibold text-foreground mb-1">{title}</p> : null}
        {children ?? content}
      </div>
    </div>
  );
}
