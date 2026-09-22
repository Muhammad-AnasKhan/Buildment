import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

type BigWordAlertProps = {
  term: string;
  plainEnglish: string;
  whyItMatters?: string;
};

const shell = cn(
  "not-prose my-8 overflow-hidden rounded-xl border border-violet-500/30",
  "bg-gradient-to-br from-violet-500/10 via-card to-card text-card-foreground"
);

const header = cn(
  "flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/5 px-5 py-2.5 sm:px-6"
);

export function BigWordAlert({ term, plainEnglish, whyItMatters }: BigWordAlertProps) {
  return (
    <div className={shell}>
      <div className={header}>
        <BookMarked className="size-4 text-violet-600 dark:text-violet-300" aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-widest text-violet-800 dark:text-violet-200">
          Big word alert
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-lg font-semibold tracking-tight text-foreground">{term}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{plainEnglish}</p>
        {whyItMatters ? (
          <p
            className={cn(
              "mt-4 rounded-lg border border-violet-500/25 bg-muted/60 px-4 py-3",
              "text-sm leading-relaxed text-foreground/90"
            )}
          >
            <span className="font-semibold text-foreground">Why it matters here: </span>
            {whyItMatters}
          </p>
        ) : null}
      </div>
    </div>
  );
}
