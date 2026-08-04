"use client";

import { useEffect, useId, useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MandatoryReadCardProps = {
  title: string;
  href: string;
  source?: string;
  summary: string;
  readMinutes?: number;
};

function storageKey(href: string) {
  return `buildment:read:${href}`;
}

export function MandatoryReadCard({
  title,
  href,
  source,
  summary,
  readMinutes,
}: MandatoryReadCardProps) {
  const checkboxId = useId();
  const [read, setRead] = useState(false);

  useEffect(() => {
    try {
      setRead(localStorage.getItem(storageKey(href)) === "1");
    } catch {
      // ignore private browsing / storage blocks
    }
  }, [href]);

  function toggle(checked: boolean) {
    setRead(checked);
    try {
      if (checked) localStorage.setItem(storageKey(href), "1");
      else localStorage.removeItem(storageKey(href));
    } catch {
      // ignore
    }
  }

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 bg-neutral-50/80 px-5 py-3 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          Mandatory read
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-600">
            <BookOpen className="size-4" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold leading-snug text-neutral-950 sm:text-base">
              {title}
            </h3>

            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Open article
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
              {source ? (
                <span className="text-xs text-neutral-500">{source}</span>
              ) : null}
              {readMinutes ? (
                <span className="text-xs text-neutral-400">~{readMinutes} min read</span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-5 flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
            read ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-neutral-50/50"
          )}
        >
          <Checkbox
            id={checkboxId}
            checked={read}
            onCheckedChange={(value) => toggle(value === true)}
          />
          <Label htmlFor={checkboxId} className="cursor-pointer text-sm leading-relaxed text-neutral-700">
            I have read this article
          </Label>
        </div>
      </div>
    </div>
  );
}
