export function FaqGroup({ children }: { children: React.ReactNode }) {
  return <div className="not-prose my-6 space-y-3">{children}</div>;
}

export function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="flex items-start gap-2.5 text-sm font-semibold leading-snug text-neutral-950">
        <span className="mt-0.5 shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Q
        </span>
        <span>{question}</span>
      </p>
      <div className="mt-3 flex items-start gap-2.5 border-t border-neutral-100 pt-3 text-sm leading-relaxed text-neutral-600">
        <span className="mt-0.5 shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          A
        </span>
        <div className="min-w-0 flex-1 [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
