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
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      <p className="max-w-md text-sm text-neutral-400">{description}</p>
    </div>
  );
}

export function HelpInboxList({ rows }: { rows: HelpInboxRow[] }) {
  if (rows.length === 0) return null;

  return (
    <ul className="mt-6 divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={row.href}
            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-neutral-50/80 sm:px-5"
          >
            {row.avatarInitials && (
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600"
                aria-hidden
              >
                {row.avatarInitials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-neutral-900">{row.primaryLabel}</p>
                {row.badges?.map((badge) => (
                  <span
                    key={badge.text}
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide",
                      badge.tone === "waiting" &&
                        "rounded-md bg-amber-50 px-2 py-0.5 text-amber-800",
                      badge.tone === "muted" && "text-neutral-400",
                      badge.tone === "status" &&
                        "rounded-md bg-neutral-100 px-2 py-0.5 text-neutral-700",
                      badge.tone === "plain" && "text-xs font-normal normal-case text-neutral-400"
                    )}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
              <p className="mt-0.5 truncate text-xs text-neutral-500">{row.secondaryLabel}</p>
              {row.preview && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">
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
