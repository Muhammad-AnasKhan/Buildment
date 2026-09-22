"use client";

import { useId, useSyncExternalStore } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { readerCard, readerCardHeader, readerEyebrow, readerTitle } from "@/components/learn/reader-theme";

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

// localStorage is an external store here: the checkbox reflects it via
// useSyncExternalStore (SSR-safe through the server snapshot) instead of a
// mount-time setState.
const storageListeners = new Set<() => void>();

function subscribeToStorage(listener: () => void) {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}

function notifyStorageListeners() {
  for (const listener of storageListeners) listener();
}

export function MandatoryReadCard({
  title,
  href,
  source,
  summary,
  readMinutes,
}: MandatoryReadCardProps) {
  const checkboxId = useId();
  const read = useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return localStorage.getItem(storageKey(href)) === "1";
      } catch {
        return false; // private browsing / storage blocks
      }
    },
    () => false
  );

  function toggle(checked: boolean) {
    try {
      if (checked) localStorage.setItem(storageKey(href), "1");
      else localStorage.removeItem(storageKey(href));
    } catch {
      // ignore
    }
    notifyStorageListeners();
  }

  return (
    <div className={cn("not-prose my-8", readerCard)}>
      <div className={cn(readerCardHeader, "py-3")}>
        <p className={readerEyebrow}>
          Mandatory read
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
            <BookOpen className="size-4" aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className={readerTitle}>
              {title}
            </h3>

            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{summary}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            read ? "border-emerald-500/30 bg-emerald-500/10" : "border-border bg-muted/40"
          )}
        >
          <Checkbox
            id={checkboxId}
            checked={read}
            onCheckedChange={(value) => toggle(value === true)}
          />
          <Label htmlFor={checkboxId} className="cursor-pointer text-sm leading-relaxed text-foreground/90">
            I have read this article
          </Label>
        </div>
      </div>
    </div>
  );
}
