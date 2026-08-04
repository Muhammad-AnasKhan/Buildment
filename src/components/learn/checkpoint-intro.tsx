export function CheckpointIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose -mt-2 mb-1 flex gap-3 rounded-lg border border-indigo-100 bg-indigo-50/40 px-4 py-3.5 sm:px-5">
      <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-indigo-400" aria-hidden />
      <p className="text-[15px] leading-relaxed text-neutral-700 [&>p]:m-0">{children}</p>
    </div>
  );
}
