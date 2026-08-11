import { Globe } from "lucide-react";

type RealWorldEventProps = {
  title: string;
  when: string;
  summary: string;
  lesson: string;
};

export function RealWorldEvent({ title, when, summary, lesson }: RealWorldEventProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/80 to-white">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50/50 px-5 py-2.5 sm:px-6">
        <Globe className="size-4 text-sky-600" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-800">
          Real-world event
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug text-neutral-950 sm:text-base">{title}</h3>
          <span className="text-xs font-medium text-sky-700">{when}</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{summary}</p>
        <p className="mt-4 rounded-lg border border-sky-100 bg-white/80 px-4 py-3 text-sm leading-relaxed text-neutral-700">
          <span className="font-semibold text-neutral-900">Takeaway for your build: </span>
          {lesson}
        </p>
      </div>
    </div>
  );
}
