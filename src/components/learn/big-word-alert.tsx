import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";
import { readerCard, readerCardHeader, readerEyebrow } from "@/components/learn/reader-theme";

type BigWordAlertProps = {
  term: string;
  plainEnglish: string;
  whyItMatters?: string;
};

export function BigWordAlert({ term, plainEnglish, whyItMatters }: BigWordAlertProps) {
  return (
    <div className={cn("not-prose my-8", readerCard)}>
      <div className={cn(readerCardHeader, "flex items-center gap-2 py-3")}>
        <BookMarked className="size-4 text-muted-foreground" aria-hidden />
        <p className={readerEyebrow}>
          Big word alert
        </p>
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-lg font-semibold tracking-tight text-foreground">{term}</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{plainEnglish}</p>
        {whyItMatters ? (
          <p
            className={cn(
              "mt-4 rounded-lg border border-border bg-muted/45 px-4 py-3",
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
