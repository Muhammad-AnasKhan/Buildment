import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

type BigWordAlertProps = {
  term: string;
  plainEnglish: string;
  whyItMatters?: string;
};

export function BigWordAlert({ term, plainEnglish, whyItMatters }: BigWordAlertProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/90 to-white">
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50/60 px-5 py-2.5 sm:px-6">
        <BookMarked className="size-4 text-violet-600" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-700">
          Big word alert
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-lg font-semibold tracking-tight text-neutral-950">{term}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{plainEnglish}</p>
        {whyItMatters ? (
          <p
            className={cn(
              "mt-4 rounded-lg border border-violet-100 bg-white/80 px-4 py-3",
              "text-sm leading-relaxed text-neutral-600"
            )}
          >
            <span className="font-semibold text-neutral-800">Why it matters here: </span>
            {whyItMatters}
          </p>
        ) : null}
      </div>
    </div>
  );
}
