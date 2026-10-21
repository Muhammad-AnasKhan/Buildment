import Link from "next/link";
import { ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export type HelpInboxRow = {
  id: string;
  href: string;
  primaryLabel: string;
  secondaryLabel: string;
  preview?: string;
  avatarInitials?: string;
  badges?: { text: string; tone: "waiting" | "muted" | "status" | "plain" }[];
};

export function InboxEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-12 flex flex-col items-center gap-2 text-center">
      <Inbox className="size-8 text-neutral-300" aria-hidden />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-md text-sm text-neutral-400">{description}</p>
    </div>
  );
}

export function HelpInboxList({ rows }: { rows: HelpInboxRow[] }) {
  if (rows.length === 0) return null;

  return (
    <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={row.href}
            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-5"
          >
            {row.avatarInitials && (
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                aria-hidden
              >
                {row.avatarInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{row.primaryLabel}</p>
                {row.badges?.map((badge) => (
                  <span
                    key={badge.text}
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      badge.tone === "waiting" &&
                        "rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-800 dark:text-amber-300",
                      badge.tone === "muted" && "text-neutral-400",
                      badge.tone === "status" &&
                        "rounded-md bg-muted px-2 py-0.5 text-foreground",
                      badge.tone === "plain" && "text-xs font-normal normal-case text-neutral-400"
                    )}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.secondaryLabel}</p>
              {row.preview && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {row.preview}
                </p>
              )}
            </div>
            <ChevronRight className="size-4 shrink-0 text-neutral-300" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
