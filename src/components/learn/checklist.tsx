"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { CheckCircle2, ClipboardCheck, ListChecks } from "lucide-react";

export type ChecklistItemData = {
  id: string;
  label: string;
  defaultChecked?: boolean;
};

type ChecklistContextValue = {
  chapterSlug: string;
};

const ChecklistContext = createContext<ChecklistContextValue | null>(null);

export function ChecklistProvider({
  chapterSlug,
  children,
}: {
  chapterSlug: string;
  children: React.ReactNode;
}) {
  return (
    <ChecklistContext.Provider value={{ chapterSlug }}>
      {children}
    </ChecklistContext.Provider>
  );
}

function storageKey(chapterSlug: string, itemId: string) {
  return `buildment:checklist:${chapterSlug}:${itemId}`;
}

function parseLabel(label: string) {
  const parts = label.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.9em] text-neutral-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function ChecklistItemRow({
  item,
  checked,
  onToggle,
}: {
  item: ChecklistItemData;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <li>
      <label
        className={cn(
          "group flex cursor-pointer items-start gap-3.5 rounded-xl px-3 py-3.5 transition-colors",
          "hover:bg-white/80",
          checked && "bg-emerald-50/50 hover:bg-emerald-50/70"
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onToggle(value === true)}
          className={cn(
            "mt-0.5 size-5 rounded-md border-2",
            checked && "border-emerald-600 bg-emerald-600"
          )}
          aria-label={item.label.replace(/\*\*/g, "")}
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-[15px] leading-relaxed text-neutral-800",
            checked && "text-neutral-500 line-through decoration-neutral-400/80"
          )}
        >
          {parseLabel(item.label)}
        </span>
        {checked ? (
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-emerald-600 opacity-100 transition-opacity"
            aria-hidden
          />
        ) : (
          <span className="mt-0.5 size-4 shrink-0" aria-hidden />
        )}
      </label>
    </li>
  );
}

const VARIANT_STYLES = {
  gate: {
    border: "border-indigo-200",
    headerBg: "bg-gradient-to-r from-indigo-600 to-indigo-700",
    headerText: "text-white",
    subText: "text-indigo-100",
    iconBg: "bg-white/15",
    bodyBg: "bg-gradient-to-b from-indigo-50/40 to-white",
    progress: "bg-indigo-100",
    progressFill: "bg-indigo-600",
    badge: "bg-white/20 text-white",
  },
  section: {
    border: "border-neutral-200",
    headerBg: "bg-neutral-50",
    headerText: "text-neutral-900",
    subText: "text-neutral-500",
    iconBg: "bg-indigo-100",
    bodyBg: "bg-white",
    progress: "bg-neutral-100",
    progressFill: "bg-emerald-500",
    badge: "bg-neutral-200 text-neutral-700",
  },
  inline: {
    border: "border-neutral-200",
    headerBg: "bg-neutral-50",
    headerText: "text-neutral-900",
    subText: "text-neutral-500",
    iconBg: "bg-neutral-100",
    bodyBg: "bg-white",
    progress: "bg-neutral-100",
    progressFill: "bg-emerald-500",
    badge: "bg-neutral-200 text-neutral-700",
  },
} as const;

export function Checklist({
  items,
  section,
  variant = "inline",
}: {
  items: ChecklistItemData[];
  section?: string;
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const ctx = useContext(ChecklistContext);
  const chapterSlug = ctx?.chapterSlug ?? "unknown";
  const styles = VARIANT_STYLES[variant];

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of items) {
      initial[item.id] = item.defaultChecked ?? false;
    }
    return initial;
  });

  useEffect(() => {
    const fromStorage: Record<string, boolean> = {};
    let hasStored = false;
    for (const item of items) {
      try {
        const raw = localStorage.getItem(storageKey(chapterSlug, item.id));
        if (raw !== null) {
          fromStorage[item.id] = raw === "true";
          hasStored = true;
        } else {
          fromStorage[item.id] = item.defaultChecked ?? false;
        }
      } catch {
        fromStorage[item.id] = item.defaultChecked ?? false;
      }
    }
    if (hasStored) {
      setCheckedMap(fromStorage);
    }
  }, [chapterSlug, items]);

  const toggle = useCallback(
    (id: string, next: boolean) => {
      setCheckedMap((prev) => ({ ...prev, [id]: next }));
      try {
        localStorage.setItem(storageKey(chapterSlug, id), String(next));
      } catch {
        /* private browsing */
      }
    },
    [chapterSlug]
  );

  const checkedCount = useMemo(
    () => items.filter((item) => checkedMap[item.id]).length,
    [items, checkedMap]
  );
  const total = items.length;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;
  const allDone = total > 0 && checkedCount === total;

  const headerTitle =
    variant === "gate"
      ? section ?? "Chapter gate checklist"
      : section ?? "Checklist";

  const HeaderIcon = variant === "gate" ? ClipboardCheck : ListChecks;

  return (
    <div
      className={cn(
        "not-prose my-8 overflow-hidden rounded-2xl border shadow-sm",
        styles.border,
        styles.bodyBg
      )}
      data-checklist
      data-checklist-variant={variant}
    >
      <div
        className={cn(
          "px-5 py-4",
          variant === "gate" ? styles.headerBg : cn(styles.headerBg, "border-b border-neutral-200")
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                variant === "gate" ? styles.iconBg : styles.iconBg
              )}
            >
              <HeaderIcon
                className={cn(
                  "size-5",
                  variant === "gate" ? "text-white" : "text-indigo-600"
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  variant === "gate" ? styles.subText : "text-indigo-600"
                )}
              >
                {variant === "gate" ? "Gate checklist" : "Checklist"}
              </p>
              <p className={cn("mt-0.5 text-base font-semibold leading-snug", styles.headerText)}>
                {headerTitle}
              </p>
              {variant === "gate" ? (
                <p className={cn("mt-1 text-sm", styles.subText)}>
                  Tick each item when you can demo or explain it — progress saves in your browser.
                </p>
              ) : null}
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              styles.badge
            )}
          >
            {checkedCount}/{total}
          </span>
        </div>

        <div className={cn("mt-4 h-1.5 overflow-hidden rounded-full", styles.progress)}>
          <div
            className={cn("h-full rounded-full transition-all duration-300 ease-out", styles.progressFill)}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={total}
          />
        </div>
      </div>

      <ul className="space-y-0.5 p-2 sm:p-3">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            checked={Boolean(checkedMap[item.id])}
            onToggle={(next) => toggle(item.id, next)}
          />
        ))}
      </ul>

      {allDone ? (
        <div className="border-t border-emerald-100 bg-emerald-50/80 px-5 py-3.5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" />
            All items complete — you&apos;re ready to move on.
          </p>
        </div>
      ) : null}
    </div>
  );
}
